/**
 * Addis AI (Addis Voices 2) client — Amharic / Afaan Oromo text-to-speech.
 *
 * Contract verified 2026-07-26 against https://api.addisassistant.com:
 *   GET  /api/v1/voice/voices?language=am   → { data: [ { id, name, is_available, ... } ] }
 *   POST /api/v1/voice/estimate             → { data: { estimated_cost, can_generate, ... } }
 *   POST /api/v1/voice/generations          → { data: { id, audio, audio_url, duration_seconds, usage } }
 *
 * Only `am` and `om` are supported — the API rejects `en` with UNSUPPORTED_LANGUAGE,
 * so English narration stays on browser speech synthesis.
 */
const SUPPORTED_LANGUAGES = ['am', 'om'];

// Wallet limit reported by GET /api/v1/voice/usage (max_tts_characters).
const MAX_TEXT_CHARACTERS = 5000;

const DEFAULT_VOICES = { am: 'am-dawit', om: 'om-diriba' };

const REQUEST_TIMEOUT_MS = 120000;
const VOICE_CATALOG_TTL_MS = 10 * 60 * 1000;

let voiceCatalogCache = new Map();

const baseUrl = () =>
  (process.env.ADDIS_BASE_URL || 'https://api.addisassistant.com').replace(/\/+$/, '');

const isConfigured = () => Boolean(process.env.ADDIS_API_KEY);

const defaultVoiceFor = (language) => {
  const configured =
    language === 'om' ? process.env.ADDIS_VOICE_OM : process.env.ADDIS_VOICE_AM;
  return configured || DEFAULT_VOICES[language] || DEFAULT_VOICES.am;
};

/**
 * Addis AI errors arrive as { error: { code, message, details: [...] } }.
 * Surface the provider code so callers can distinguish "insufficient balance"
 * from "bad voice id" without string matching on prose.
 */
class AddisVoiceError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = 'AddisVoiceError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const request = async (path, { method = 'GET', body } = {}) => {
  if (!isConfigured()) {
    throw new AddisVoiceError('Addis AI is not configured (ADDIS_API_KEY missing).', {
      code: 'NOT_CONFIGURED',
    });
  }

  let response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      method,
      headers: {
        'x-api-key': process.env.ADDIS_API_KEY,
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error.name === 'TimeoutError' || error.name === 'AbortError';
    throw new AddisVoiceError(
      timedOut
        ? 'Addis AI did not respond in time. Please try again.'
        : `Could not reach Addis AI: ${error.message}`,
      { code: timedOut ? 'TIMEOUT' : 'NETWORK_ERROR' }
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const providerError = payload?.error || {};
    throw new AddisVoiceError(
      providerError.message || `Addis AI request failed (HTTP ${response.status}).`,
      {
        status: response.status,
        code: providerError.code,
        details: providerError.details,
      }
    );
  }

  return payload?.data ?? payload;
};

const assertLanguageSupported = (language) => {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new AddisVoiceError(
      `Addis AI narration supports ${SUPPORTED_LANGUAGES.join(' and ')} only.`,
      { code: 'UNSUPPORTED_LANGUAGE' }
    );
  }
};

/**
 * Availability changes without notice, so the catalog is fetched rather than
 * hardcoded — cached briefly to keep the voice picker snappy.
 */
const listVoices = async (language = 'am', { force = false } = {}) => {
  assertLanguageSupported(language);

  const cached = voiceCatalogCache.get(language);
  if (!force && cached && Date.now() - cached.fetchedAt < VOICE_CATALOG_TTL_MS) {
    return cached.voices;
  }

  const data = await request(`/api/v1/voice/voices?language=${encodeURIComponent(language)}`);
  const voices = (Array.isArray(data) ? data : []).filter((voice) => voice.is_available);

  voiceCatalogCache.set(language, { voices, fetchedAt: Date.now() });
  return voices;
};

const resolveVoiceId = async (language, requestedVoiceId) => {
  const voices = await listVoices(language).catch(() => []);
  const available = new Set(voices.map((voice) => voice.id));

  for (const candidate of [requestedVoiceId, defaultVoiceFor(language)]) {
    if (candidate && (available.has(candidate) || available.size === 0)) return candidate;
  }

  const fallback = voices.find((voice) => voice.is_default) || voices[0];
  if (!fallback) {
    throw new AddisVoiceError(`No Addis AI voices are available for "${language}".`, {
      code: 'NO_VOICE_AVAILABLE',
    });
  }
  return fallback.id;
};

const estimate = async ({ text, voiceId, language, outputFormat = 'mp3_44100' }) => {
  assertLanguageSupported(language);

  const data = await request('/api/v1/voice/estimate', {
    method: 'POST',
    body: { text, voice_id: voiceId, language, output_format: outputFormat },
  });

  return {
    estimatedCostEtb: Number(data.estimated_cost) || 0,
    estimatedDurationSeconds: Number(data.estimated_duration_seconds) || 0,
    currency: data.currency || 'ETB',
    currentBalance: Number(data.current_balance) || 0,
    canGenerate: data.can_generate !== false,
  };
};

/**
 * The generation response carries the audio twice: inline base64 in `audio`, and
 * a signed `audio_url` that expires roughly an hour later. Prefer the inline
 * payload; idempotent replays omit it, in which case fetch the signed URL while
 * it is still valid.
 */
const generateClip = async ({
  text,
  voiceId,
  language,
  outputFormat = 'mp3_44100',
  clientRequestId,
}) => {
  assertLanguageSupported(language);

  const data = await request('/api/v1/voice/generations', {
    method: 'POST',
    body: {
      text,
      voice_id: voiceId,
      language,
      output_format: outputFormat,
      ...(clientRequestId ? { client_request_id: clientRequestId } : {}),
    },
  });

  const mimeType = data.mime_type || 'audio/mpeg';
  const audioBuffer = await extractAudioBuffer(data);

  return {
    clipId: data.id,
    voiceId: data.voice_id,
    voiceName: data.voice_name,
    language: data.language,
    mimeType,
    audioBuffer,
    signedAudioUrl: data.audio_url || data.playback?.url || null,
    durationSeconds: Number(data.duration_seconds) || 0,
    costEtb: Number(data.usage?.credits_used) || 0,
    balanceEtb: Number(data.usage?.credits_remaining) || 0,
    idempotentReplay: Boolean(data.meta?.idempotent_replay),
  };
};

const extractAudioBuffer = async (data) => {
  if (typeof data.audio === 'string' && data.audio.length) {
    const base64 = data.audio.startsWith('data:')
      ? data.audio.slice(data.audio.indexOf(',') + 1)
      : data.audio;
    return Buffer.from(base64, 'base64');
  }

  const signedUrl = data.audio_url || data.playback?.url;
  if (!signedUrl) {
    throw new AddisVoiceError('Addis AI returned a clip without any audio payload.', {
      code: 'NO_AUDIO_RETURNED',
    });
  }

  const response = await fetch(signedUrl, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new AddisVoiceError(
      `Could not download the generated clip (HTTP ${response.status}).`,
      { status: response.status, code: 'CLIP_DOWNLOAD_FAILED' }
    );
  }

  return Buffer.from(await response.arrayBuffer());
};

const getUsage = () => request('/api/v1/voice/usage');

module.exports = {
  AddisVoiceError,
  SUPPORTED_LANGUAGES,
  MAX_TEXT_CHARACTERS,
  isConfigured,
  defaultVoiceFor,
  listVoices,
  resolveVoiceId,
  estimate,
  generateClip,
  getUsage,
  __resetVoiceCatalogCache: () => {
    voiceCatalogCache = new Map();
  },
};
