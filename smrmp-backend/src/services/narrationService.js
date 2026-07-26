/**
 * Story narration pipeline for artifact audio guides.
 *
 * Narration is produced by Addis AI (Addis Voices 2), which covers Amharic and
 * Afaan Oromo. English is intentionally absent: the provider rejects `en`, so the
 * frontend keeps using browser speech synthesis for it.
 *
 * Addis AI bills 5 ETB per generated minute, so a clip is generated at most once
 * per (artifact, language, voice, exact text) and then served forever from
 * Cloudinary. Editing an artifact description changes the text hash, which is
 * what triggers the next (and only then billable) regeneration.
 */
const crypto = require('crypto');
const { Artifact, ArtifactNarration } = require('../models');
const { cloudinary } = require('../config/cloudinary');
const addisVoice = require('./addisVoiceService');

const { AddisVoiceError, MAX_TEXT_CHARACTERS } = addisVoice;

const DEFAULT_MAX_COST_PER_CLIP_ETB = 15;

const maxCostPerClip = () => {
  const configured = Number(process.env.ADDIS_MAX_COST_PER_CLIP_ETB);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_MAX_COST_PER_CLIP_ETB;
};

const publicGenerationAllowed = () =>
  String(process.env.ADDIS_ALLOW_PUBLIC_GENERATION || 'true').toLowerCase() !== 'false';

const hashText = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');

/**
 * Keeps the request inside the provider's 5000-character ceiling, cutting at a
 * sentence boundary so a clip never ends mid-word. Ethiopic full stop (።) is
 * checked alongside Latin punctuation.
 */
const clampToProviderLimit = (text) => {
  if (text.length <= MAX_TEXT_CHARACTERS) return { text, truncated: false };

  const window = text.slice(0, MAX_TEXT_CHARACTERS);
  const lastBoundary = Math.max(
    window.lastIndexOf('።'),
    window.lastIndexOf('.'),
    window.lastIndexOf('!'),
    window.lastIndexOf('?'),
    window.lastIndexOf('\n')
  );

  const cutoff = lastBoundary > MAX_TEXT_CHARACTERS * 0.5 ? lastBoundary + 1 : MAX_TEXT_CHARACTERS;
  return { text: window.slice(0, cutoff).trim(), truncated: true };
};

// Only Amharic has stored source text today. There is no machine translation
// step, so an artifact without amharic_description has no narratable story yet —
// callers treat that as "nothing to narrate" rather than an error.
const NARRATION_TEXT_FIELDS = { am: 'amharic_description' };

const resolveNarrationText = (artifact, language) => {
  const field = NARRATION_TEXT_FIELDS[language];
  const raw = field ? artifact[field] : null;
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  return trimmed || null;
};

const serializeNarration = (narration, { generated = false, truncated = false } = {}) => ({
  artifact_id: narration.artifact_id,
  language: narration.language,
  voice_id: narration.voice_id,
  voice_name: narration.voice_name,
  audio_url: narration.audio_url,
  mime_type: narration.mime_type,
  duration_seconds:
    narration.duration_seconds === null || narration.duration_seconds === undefined
      ? null
      : Number(narration.duration_seconds),
  provider: narration.provider,
  transcript: narration.source_text,
  transcript_truncated: truncated,
  cached: !generated,
  generated_at: narration.created_at,
});

const uploadClipToCloudinary = (buffer, { artifactId, language, voiceId }) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `smrmp/narrations/${artifactId}`,
        // Cloudinary serves audio through its video pipeline.
        resource_type: 'video',
        public_id: `${language}-${voiceId}-${Date.now()}`,
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

const findCachedNarration = (artifactId, language, voiceId, textHash) =>
  ArtifactNarration.findOne({
    where: { artifact_id: artifactId, language, voice_id: voiceId, text_hash: textHash },
  });

/**
 * Resolves narration audio for an artifact, generating it only when there is no
 * cached clip for the current text. Returns `null` when the artifact has no
 * story text in the requested language so callers can fall back gracefully.
 */
const getOrCreateNarration = async (
  artifact,
  {
    language = 'am',
    voiceId: requestedVoiceId,
    isPublicRequest = false,
    userId = null,
    forceRegenerate = false,
  } = {}
) => {
  if (!addisVoice.isConfigured()) {
    throw new AddisVoiceError('Addis AI narration is not configured on this server.', {
      code: 'NOT_CONFIGURED',
    });
  }

  const sourceText = resolveNarrationText(artifact, language);
  if (!sourceText) return null;

  const { text, truncated } = clampToProviderLimit(sourceText);
  const textHash = hashText(text);
  const voiceId = await addisVoice.resolveVoiceId(language, requestedVoiceId);

  if (!forceRegenerate) {
    const cached = await findCachedNarration(artifact.id, language, voiceId, textHash);
    if (cached) return serializeNarration(cached, { truncated });
  }

  if (isPublicRequest && !publicGenerationAllowed()) {
    throw new AddisVoiceError(
      'This narration has not been published yet. A curator must generate it first.',
      { code: 'PUBLIC_GENERATION_DISABLED' }
    );
  }

  const estimate = await addisVoice.estimate({ text, voiceId, language });
  if (!estimate.canGenerate) {
    throw new AddisVoiceError(
      'The Addis AI narration balance is exhausted. Please top up the account.',
      { code: 'INSUFFICIENT_BALANCE' }
    );
  }
  if (estimate.estimatedCostEtb > maxCostPerClip()) {
    throw new AddisVoiceError(
      `This narration would cost ${estimate.estimatedCostEtb.toFixed(2)} ETB, above the ` +
        `${maxCostPerClip()} ETB per-clip limit. Shorten the description or raise ` +
        'ADDIS_MAX_COST_PER_CLIP_ETB.',
      { code: 'COST_LIMIT_EXCEEDED' }
    );
  }

  // Reusing this id means a retry after a timeout replays the same generation
  // instead of being billed twice.
  const clientRequestId = `smrmp-${artifact.id}-${language}-${voiceId}-${textHash.slice(0, 16)}`;

  const clip = await addisVoice.generateClip({ text, voiceId, language, clientRequestId });
  const upload = await uploadClipToCloudinary(clip.audioBuffer, {
    artifactId: artifact.id,
    language,
    voiceId,
  });

  const record = {
    artifact_id: artifact.id,
    language,
    voice_id: voiceId,
    voice_name: clip.voiceName || null,
    text_hash: textHash,
    source_text: text,
    provider: 'addis_ai',
    provider_clip_id: clip.clipId,
    audio_url: upload.secure_url,
    storage_path: upload.public_id,
    mime_type: clip.mimeType,
    duration_seconds: clip.durationSeconds || null,
    cost_etb: clip.costEtb || null,
    generated_by: userId,
  };

  const existing = await findCachedNarration(artifact.id, language, voiceId, textHash);
  const narration = existing
    ? await existing.update(record)
    : await ArtifactNarration.create(record);

  return serializeNarration(narration, { generated: true, truncated });
};

const findArtifactByQrCode = (qrCode) =>
  Artifact.findOne({
    where: { qr_code: qrCode },
    attributes: ['id', 'name', 'description', 'amharic_description', 'qr_code'],
  });

const findArtifactById = (id) =>
  Artifact.findByPk(id, {
    attributes: ['id', 'name', 'description', 'amharic_description', 'qr_code'],
  });

const getNarrationStatus = async (artifactId) => {
  const narrations = await ArtifactNarration.findAll({
    where: { artifact_id: artifactId },
    order: [['created_at', 'DESC']],
  });

  return narrations.map((narration) => serializeNarration(narration));
};

module.exports = {
  getOrCreateNarration,
  getNarrationStatus,
  findArtifactByQrCode,
  findArtifactById,
  resolveNarrationText,
  publicGenerationAllowed,
  maxCostPerClip,
  hashText,
  clampToProviderLimit,
};
