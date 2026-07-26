/**
 * Addis AI story narration — service-level tests.
 *
 * The models, Cloudinary and the Addis AI HTTP calls are all mocked, so this
 * suite runs without a database and never spends real narration credit.
 */
jest.mock('../src/models', () => ({
  Artifact: { findOne: jest.fn(), findByPk: jest.fn() },
  ArtifactNarration: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../src/config/cloudinary', () => ({
  cloudinary: { uploader: { upload_stream: jest.fn() } },
}));

const { ArtifactNarration } = require('../src/models');
const { cloudinary } = require('../src/config/cloudinary');
const addisVoice = require('../src/services/addisVoiceService');
const narrationService = require('../src/services/narrationService');

const ARTIFACT = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Adwa Battle Drum',
  description: 'A ceremonial drum carried at Adwa.',
  amharic_description: 'በአድዋ ጦርነት የተያዘ ከበሮ። ይህ ቅርስ የኢትዮጵያን የጀግንነት ታሪክ ያንፀባርቃል።',
  qr_code: 'ART-TEST0001',
};

const VOICE_CATALOG = [
  { id: 'am-dawit', name: 'Dawit', is_available: true, is_default: false },
  { id: 'am-hamen', name: 'Hamen', is_available: true, is_default: true },
];

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

/** Routes the mocked fetch by Addis AI endpoint path. */
const mockAddisApi = ({ estimateOverrides = {}, generationOverrides = {} } = {}) => {
  global.fetch = jest.fn(async (url) => {
    if (String(url).includes('/voice/voices')) {
      return jsonResponse({ data: VOICE_CATALOG });
    }
    if (String(url).includes('/voice/estimate')) {
      return jsonResponse({
        data: {
          estimated_cost: 0.5,
          estimated_duration_seconds: 6,
          currency: 'ETB',
          current_balance: 500,
          can_generate: true,
          ...estimateOverrides,
        },
      });
    }
    if (String(url).includes('/voice/generations')) {
      return jsonResponse(
        {
          data: {
            id: 'clip-abc',
            voice_id: 'am-dawit',
            voice_name: 'Dawit',
            language: 'am',
            audio: `data:audio/mpeg;base64,${Buffer.from('fake-mp3').toString('base64')}`,
            audio_url: 'https://cdn.addisassistant.com/audio/clips/clip-abc.mp3?token=x',
            mime_type: 'audio/mpeg',
            duration_seconds: 6.2,
            usage: { credits_used: 0.52, credits_remaining: 499.48 },
            ...generationOverrides,
          },
        },
        201
      );
    }
    throw new Error(`Unexpected fetch to ${url}`);
  });
};

const countCalls = (fragment) =>
  global.fetch.mock.calls.filter(([url]) => String(url).includes(fragment)).length;

beforeEach(() => {
  jest.clearAllMocks();
  addisVoice.__resetVoiceCatalogCache();

  process.env.ADDIS_API_KEY = 'sk_test-addis-key';
  process.env.ADDIS_BASE_URL = 'https://api.addisassistant.com';
  process.env.ADDIS_VOICE_AM = 'am-dawit';
  process.env.ADDIS_ALLOW_PUBLIC_GENERATION = 'true';
  process.env.ADDIS_MAX_COST_PER_CLIP_ETB = '15';

  ArtifactNarration.findOne.mockResolvedValue(null);
  ArtifactNarration.create.mockImplementation(async (values) => ({
    ...values,
    created_at: new Date('2026-07-26T00:00:00Z'),
  }));

  cloudinary.uploader.upload_stream.mockImplementation((_options, callback) => ({
    end: () =>
      callback(null, {
        secure_url: 'https://res.cloudinary.com/demo/video/upload/narration.mp3',
        public_id: 'smrmp/narrations/x/am-am-dawit',
      }),
  }));
});

afterEach(() => {
  delete global.fetch;
});

describe('Addis AI narration generation', () => {
  test('generates a clip, stores the permanent URL, and reports cost metadata', async () => {
    mockAddisApi();

    const narration = await narrationService.getOrCreateNarration(ARTIFACT, { language: 'am' });

    expect(narration).toMatchObject({
      language: 'am',
      voice_id: 'am-dawit',
      voice_name: 'Dawit',
      provider: 'addis_ai',
      cached: false,
      duration_seconds: 6.2,
    });

    // The stored URL must be the durable Cloudinary one, never the signed
    // Addis AI link, which expires within the hour.
    expect(narration.audio_url).toBe(
      'https://res.cloudinary.com/demo/video/upload/narration.mp3'
    );
    expect(narration.audio_url).not.toContain('addisassistant.com');

    const persisted = ArtifactNarration.create.mock.calls[0][0];
    expect(persisted.provider_clip_id).toBe('clip-abc');
    expect(persisted.cost_etb).toBe(0.52);
    expect(persisted.text_hash).toHaveLength(64);
  });

  test('serves a cached clip without calling the billable endpoint', async () => {
    mockAddisApi();

    ArtifactNarration.findOne.mockResolvedValue({
      artifact_id: ARTIFACT.id,
      language: 'am',
      voice_id: 'am-dawit',
      voice_name: 'Dawit',
      audio_url: 'https://res.cloudinary.com/demo/video/upload/cached.mp3',
      mime_type: 'audio/mpeg',
      duration_seconds: '6.20',
      provider: 'addis_ai',
      source_text: ARTIFACT.amharic_description,
      created_at: new Date('2026-07-26T00:00:00Z'),
    });

    const narration = await narrationService.getOrCreateNarration(ARTIFACT, { language: 'am' });

    expect(narration.cached).toBe(true);
    expect(narration.audio_url).toContain('cached.mp3');
    expect(countCalls('/voice/generations')).toBe(0);
    expect(ArtifactNarration.create).not.toHaveBeenCalled();
  });

  test('reuses one client_request_id per artifact + language + voice + text', async () => {
    mockAddisApi();

    await narrationService.getOrCreateNarration(ARTIFACT, { language: 'am' });
    const first = JSON.parse(
      global.fetch.mock.calls.find(([url]) => String(url).includes('/voice/generations'))[1].body
    );

    jest.clearAllMocks();
    ArtifactNarration.findOne.mockResolvedValue(null);
    ArtifactNarration.create.mockImplementation(async (values) => ({ ...values }));
    addisVoice.__resetVoiceCatalogCache();
    mockAddisApi();

    await narrationService.getOrCreateNarration(ARTIFACT, { language: 'am' });
    const second = JSON.parse(
      global.fetch.mock.calls.find(([url]) => String(url).includes('/voice/generations'))[1].body
    );

    expect(first.client_request_id).toBe(second.client_request_id);
  });

  test('returns null when the artifact has no Amharic story text', async () => {
    mockAddisApi();

    const narration = await narrationService.getOrCreateNarration(
      { ...ARTIFACT, amharic_description: '   ' },
      { language: 'am' }
    );

    expect(narration).toBeNull();
    expect(countCalls('/voice/generations')).toBe(0);
  });
});

describe('spend and access guards', () => {
  test('refuses to generate above the per-clip cost ceiling', async () => {
    mockAddisApi({ estimateOverrides: { estimated_cost: 42 } });
    process.env.ADDIS_MAX_COST_PER_CLIP_ETB = '15';

    await expect(
      narrationService.getOrCreateNarration(ARTIFACT, { language: 'am' })
    ).rejects.toMatchObject({ code: 'COST_LIMIT_EXCEEDED' });

    expect(countCalls('/voice/generations')).toBe(0);
  });

  test('refuses to generate when the provider reports no balance', async () => {
    mockAddisApi({ estimateOverrides: { can_generate: false } });

    await expect(
      narrationService.getOrCreateNarration(ARTIFACT, { language: 'am' })
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_BALANCE' });

    expect(countCalls('/voice/generations')).toBe(0);
  });

  test('blocks public visitors from triggering generation when disabled', async () => {
    mockAddisApi();
    process.env.ADDIS_ALLOW_PUBLIC_GENERATION = 'false';

    await expect(
      narrationService.getOrCreateNarration(ARTIFACT, { language: 'am', isPublicRequest: true })
    ).rejects.toMatchObject({ code: 'PUBLIC_GENERATION_DISABLED' });

    expect(countCalls('/voice/generations')).toBe(0);
  });

  test('rejects English, which Addis Voices does not support', async () => {
    mockAddisApi();

    await expect(
      addisVoice.estimate({ text: 'Hello', voiceId: 'am-dawit', language: 'en' })
    ).rejects.toMatchObject({ code: 'UNSUPPORTED_LANGUAGE' });
  });

  test('surfaces the provider error code instead of a bare HTTP failure', async () => {
    global.fetch = jest.fn(async () =>
      jsonResponse(
        { error: { code: 'VOICE_UNAVAILABLE', message: 'Voice is not available.' } },
        422
      )
    );

    await expect(addisVoice.listVoices('am')).rejects.toMatchObject({
      code: 'VOICE_UNAVAILABLE',
      status: 422,
    });
  });
});

describe('text preparation', () => {
  test('leaves text within the provider limit untouched', () => {
    const { text, truncated } = narrationService.clampToProviderLimit('አጭር ጽሑፍ።');
    expect(truncated).toBe(false);
    expect(text).toBe('አጭር ጽሑፍ።');
  });

  test('truncates over-long text at an Ethiopic sentence boundary', () => {
    const sentence = 'ይህ ቅርስ የኢትዮጵያን የጀግንነት ታሪክ ያንፀባርቃል።';
    const { text, truncated } = narrationService.clampToProviderLimit(
      sentence.repeat(400)
    );

    expect(truncated).toBe(true);
    expect(text.length).toBeLessThanOrEqual(addisVoice.MAX_TEXT_CHARACTERS);
    expect(text.endsWith('።')).toBe(true);
  });

  test('hashes text so an edited description invalidates the cached clip', () => {
    const before = narrationService.hashText('የመጀመሪያው ጽሑፍ።');
    const after = narrationService.hashText('የተስተካከለው ጽሑፍ።');
    expect(before).not.toBe(after);
  });
});
