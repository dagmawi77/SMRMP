import api from './axios';

// Generating a clip runs the full Addis AI synthesis plus a Cloudinary upload,
// which comfortably outlives the shared 30s axios timeout for longer stories.
const GENERATION_TIMEOUT_MS = 180000;

export const narrationApi = {
  getVoices: (language = 'am') => api.get('/narration/voices', { params: { language } }),

  /** Public QR surface — resolves a cached clip or generates one on first listen. */
  getForArtifactCode: (code, { language = 'am', voiceId } = {}) =>
    api.get(`/narration/artifact/${encodeURIComponent(code)}`, {
      params: { language, ...(voiceId ? { voice_id: voiceId } : {}) },
      timeout: GENERATION_TIMEOUT_MS,
    }),

  /** Staff: pre-generate or re-voice a narration. `force` pays for a new clip. */
  generateForArtifactId: (id, { language = 'am', voiceId, force = false } = {}) =>
    api.post(
      `/narration/artifact/${id}/generate`,
      { language, ...(voiceId ? { voice_id: voiceId } : {}), force },
      { timeout: GENERATION_TIMEOUT_MS },
    ),

  getStatus: (id) => api.get(`/narration/artifact/${id}/status`),
};

export default narrationApi;
