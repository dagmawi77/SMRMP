import { useCallback, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { narrationApi } from '../api/narrationApi';
import getApiErrorMessage from '../utils/apiError';

/** Addis Voices 2 covers Amharic and Afaan Oromo; English uses on-device speech. */
export const ADDIS_LANGUAGES = ['am', 'om'];

export function useNarrationVoices(language = 'am', { enabled = true } = {}) {
  return useQuery({
    queryKey: ['narration', 'voices', language],
    queryFn: () => narrationApi.getVoices(language),
    select: (res) => res.data.data,
    enabled: enabled && ADDIS_LANGUAGES.includes(language),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Lazily resolves Addis AI narration for an artifact.
 *
 * Deliberately not a `useQuery`: the first listen for an artifact is a billable
 * generation, so it must be triggered by an explicit user action rather than by
 * a page render. Results are memoised per language+voice for the session so
 * toggling back and forth does not re-request.
 */
export function useArtifactNarration(artifactCode) {
  const [clip, setClip] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const cacheRef = useRef(new Map());
  const inFlightRef = useRef(new Map());

  const load = useCallback(
    async ({ language = 'am', voiceId } = {}) => {
      if (!artifactCode || !ADDIS_LANGUAGES.includes(language)) return null;

      const cacheKey = `${language}:${voiceId || 'default'}`;

      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        setClip(cached);
        setError(null);
        return cached;
      }

      // Guards against a double-click paying for two generations.
      const pending = inFlightRef.current.get(cacheKey);
      if (pending) return pending;

      setIsLoading(true);
      setError(null);

      const request = (async () => {
        try {
          const res = await narrationApi.getForArtifactCode(artifactCode, { language, voiceId });
          const data = res.data.data;

          if (!data?.available) {
            // The backend answers 200 with a reason when narration cannot be
            // produced, so callers can fall back without treating it as a fault.
            const unavailable = { available: false, reason: data?.reason, detail: data?.detail };
            cacheRef.current.set(cacheKey, unavailable);
            setClip(unavailable);
            return unavailable;
          }

          cacheRef.current.set(cacheKey, data);
          setClip(data);
          return data;
        } catch (err) {
          setError(getApiErrorMessage(err, 'Could not load the Addis AI narration.'));
          return null;
        } finally {
          setIsLoading(false);
          inFlightRef.current.delete(cacheKey);
        }
      })();

      inFlightRef.current.set(cacheKey, request);
      return request;
    },
    [artifactCode],
  );

  const reset = useCallback(() => {
    setClip(null);
    setError(null);
  }, []);

  return { clip, isLoading, error, load, reset };
}

export default useArtifactNarration;
