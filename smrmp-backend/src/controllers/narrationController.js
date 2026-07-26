const { sendSuccess, sendError } = require('../utils/apiResponse');
const addisVoice = require('../services/addisVoiceService');
const narrationService = require('../services/narrationService');

const { AddisVoiceError, SUPPORTED_LANGUAGES } = addisVoice;

// Provider-side conditions the caller can act on, versus genuine server faults.
const CLIENT_ERROR_CODES = new Set([
  'UNSUPPORTED_LANGUAGE',
  'COST_LIMIT_EXCEEDED',
  'PUBLIC_GENERATION_DISABLED',
  'VOICE_UNAVAILABLE',
]);

const statusForAddisError = (error) => {
  if (CLIENT_ERROR_CODES.has(error.code)) return 400;
  if (error.code === 'NOT_CONFIGURED') return 503;
  if (error.code === 'INSUFFICIENT_BALANCE') return 402;
  if (error.code === 'TIMEOUT') return 504;
  if (error.status === 429) return 429;
  return 502;
};

const handleNarrationError = (res, error, next) => {
  if (error instanceof AddisVoiceError) {
    return sendError(res, statusForAddisError(error), error.message, {
      provider: 'addis_ai',
      code: error.code || 'PROVIDER_ERROR',
    });
  }
  return next(error);
};

const normalizeLanguage = (value) => String(value || 'am').toLowerCase();

/**
 * GET /api/narration/voices?language=am
 * Public: the visitor player offers a voice picker, and the catalog is not secret.
 */
const listNarrationVoices = async (req, res, next) => {
  const language = normalizeLanguage(req.query.language);

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return sendError(
      res,
      400,
      `Narration voices are available for ${SUPPORTED_LANGUAGES.join(', ')} only.`
    );
  }

  try {
    const voices = await addisVoice.listVoices(language);

    return sendSuccess(res, 200, 'Narration voices retrieved', {
      language,
      default_voice_id: addisVoice.defaultVoiceFor(language),
      voices: voices.map((voice) => ({
        id: voice.id,
        name: voice.name,
        descriptor: voice.descriptor,
        gender: voice.gender,
        style: voice.style,
        preview_url: voice.preview_audio_url,
      })),
    });
  } catch (error) {
    return handleNarrationError(res, error, next);
  }
};

/**
 * GET /api/narration/artifact/:code?language=am
 * Public QR surface. Returns a cached clip when one exists; otherwise generates
 * one (billable, and rate-limited at the router) unless public generation is off.
 *
 * Provider problems answer 200 with `available: false` rather than an error
 * status: for a visitor the Addis AI voice is an enhancement, so the player
 * should quietly fall back to on-device speech instead of surfacing a failure.
 */
const getArtifactNarration = async (req, res, next) => {
  const language = normalizeLanguage(req.query.language);

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return sendError(
      res,
      400,
      `Addis AI narration supports ${SUPPORTED_LANGUAGES.join(' and ')} only. ` +
        'English narration uses on-device speech.'
    );
  }

  try {
    const artifact = await narrationService.findArtifactByQrCode(req.params.code);
    if (!artifact) return sendError(res, 404, 'Artifact not found');

    const narration = await narrationService.getOrCreateNarration(artifact, {
      language,
      voiceId: req.query.voice_id,
      isPublicRequest: true,
    });

    if (!narration) {
      return sendSuccess(res, 200, 'No narration text available for this language', {
        available: false,
        language,
        reason: 'NO_SOURCE_TEXT',
      });
    }

    return sendSuccess(res, 200, 'Narration ready', { available: true, ...narration });
  } catch (error) {
    if (error instanceof AddisVoiceError) {
      return sendSuccess(res, 200, 'Narration unavailable', {
        available: false,
        language,
        reason: error.code || 'PROVIDER_ERROR',
        detail: error.message,
      });
    }
    return next(error);
  }
};

/**
 * POST /api/narration/artifact/:id/generate
 * Staff-only. Lets a curator pre-generate or re-voice a narration ahead of
 * visitors arriving, and is the only path that may force a paid regeneration.
 */
const generateArtifactNarration = async (req, res, next) => {
  const language = normalizeLanguage(req.body.language);

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return sendError(
      res,
      400,
      `Addis AI narration supports ${SUPPORTED_LANGUAGES.join(' and ')} only.`
    );
  }

  try {
    const artifact = await narrationService.findArtifactById(req.params.id);
    if (!artifact) return sendError(res, 404, 'Artifact not found');

    const narration = await narrationService.getOrCreateNarration(artifact, {
      language,
      voiceId: req.body.voice_id,
      userId: req.user?.id || null,
      forceRegenerate: Boolean(req.body.force),
    });

    if (!narration) {
      return sendError(
        res,
        422,
        language === 'am'
          ? 'This artifact has no Amharic description to narrate. Add one first.'
          : `This artifact has no ${language} description to narrate.`
      );
    }

    return sendSuccess(res, 200, 'Narration ready', { available: true, ...narration });
  } catch (error) {
    return handleNarrationError(res, error, next);
  }
};

/**
 * GET /api/narration/artifact/:id/status — staff view of cached clips and spend.
 */
const getArtifactNarrationStatus = async (req, res, next) => {
  try {
    const artifact = await narrationService.findArtifactById(req.params.id);
    if (!artifact) return sendError(res, 404, 'Artifact not found');

    const narrations = await narrationService.getNarrationStatus(artifact.id);

    return sendSuccess(res, 200, 'Narration status retrieved', {
      artifact_id: artifact.id,
      provider_configured: addisVoice.isConfigured(),
      public_generation_allowed: narrationService.publicGenerationAllowed(),
      narrations,
    });
  } catch (error) {
    return handleNarrationError(res, error, next);
  }
};

module.exports = {
  listNarrationVoices,
  getArtifactNarration,
  generateArtifactNarration,
  getArtifactNarrationStatus,
};
