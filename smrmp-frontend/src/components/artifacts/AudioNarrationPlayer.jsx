import { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  DocumentTextIcon,
  LanguageIcon,
  SparklesIcon,
  ArrowPathIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useArtifactNarration, useNarrationVoices } from '../../hooks/useNarration';

const PLAYBACK_RATES = [1, 1.25, 1.5];

const formatClock = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

/**
 * Artifact audio guide.
 *
 * Amharic is narrated by Addis AI (Addis Voices 2) — a real synthesised clip
 * streamed from the backend. English falls back to the browser's speech
 * synthesis because Addis Voices only supports Amharic and Afaan Oromo.
 *
 * The Amharic clip is fetched on the first play rather than on mount: a cache
 * miss bills the museum's Addis AI account, so it must follow a user action.
 */
export default function AudioNarrationPlayer({
  artifactName,
  artifactCode,
  description,
  amharicDescription,
  origin,
  period,
}) {
  const [language, setLanguage] = useState('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [voiceId, setVoiceId] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const speechRef = useRef(null);
  // Set when the user asks to hear a clip that still has to be fetched, so the
  // audio element only starts itself for a deliberate action.
  const autoPlayOnReadyRef = useRef(false);

  const narrativeEn =
    description ||
    `${artifactName} is a historical asset preserved at the Adwa Victory Memorial Museum. Hailing from ${origin || 'Ethiopia'} during the ${period || 'historical era'}, it embodies rich heritage and craftsmanship.`;

  const narrativeAm =
    amharicDescription ||
    `${artifactName} በአድዋ ድል መታሰቢያ ሙዚየም ውስጥ የሚገኝ ታሪካዊ ቅርስ ነው። ${period || 'በታሪካዊው ዘመን'} የተሠራው ይህ ቅርስ የኢትዮጵያን የጀግንነት ታሪክ እና ባህላዊ ቅርስ ያንፀባርቃል።`;

  const isAmharic = language === 'am';
  const { clip, isLoading, error, load } = useArtifactNarration(artifactCode);
  const { data: voiceCatalog } = useNarrationVoices('am', { enabled: showVoicePicker });

  // Addis AI can only narrate stored Amharic text; the generated English-derived
  // placeholder above is never sent, so a clip only exists when the curator
  // actually wrote an Amharic description.
  const addisEligible = Boolean(artifactCode && amharicDescription);
  const addisClip = isAmharic && clip?.available ? clip : null;
  const usingAddis = Boolean(addisClip?.audio_url);

  const currentNarrative = isAmharic
    ? addisClip?.transcript || narrativeAm
    : narrativeEn;

  const stopEverything = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => stopEverything, [stopEverything]);

  // ─── Browser speech synthesis (English, and Amharic fallback) ────────
  const startSimulatedProgress = useCallback((text) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const estimateSec = Math.max(10, Math.ceil(text.length / 12));
    const stepMs = 200;
    const increment = (stepMs / (estimateSec * 1000)) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setIsPlaying(false);
          return 100;
        }
        return prev + increment;
      });
    }, stepMs);
  }, []);

  const toggleSpeechSynthesis = useCallback(() => {
    const text = currentNarrative;

    if (!('speechSynthesis' in window)) {
      // No TTS engine at all — animate the bar so the transcript still reads
      // as a timed narration.
      if (isPlaying) {
        stopEverything();
      } else {
        setIsPlaying(true);
        if (progress >= 100) setProgress(0);
        startSimulatedProgress(text);
      }
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlaying(false);
      return;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      startSimulatedProgress(text);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackRate;
    utterance.lang = isAmharic ? 'am-ET' : 'en-US';
    utterance.volume = isMuted ? 0 : 1;

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setProgress(0);
    startSimulatedProgress(text);
  }, [
    currentNarrative,
    isAmharic,
    isMuted,
    isPlaying,
    playbackRate,
    progress,
    startSimulatedProgress,
    stopEverything,
  ]);

  // ─── Addis AI clip playback ──────────────────────────────────────────
  const handlePlayPause = async () => {
    if (!isAmharic) {
      toggleSpeechSynthesis();
      return;
    }

    if (usingAddis) {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying) {
        audio.pause();
      } else {
        try {
          await audio.play();
        } catch {
          // Autoplay policies or a stale URL — read it aloud on-device instead.
          toggleSpeechSynthesis();
        }
      }
      return;
    }

    if (!addisEligible) {
      toggleSpeechSynthesis();
      return;
    }

    // First listen: fetch (and possibly generate) the Addis AI clip.
    autoPlayOnReadyRef.current = true;
    const loaded = await load({ language: 'am', voiceId });
    if (loaded?.available && loaded.audio_url) {
      setProgress(0);
      setCurrentTime(0);
      return;
    }
    autoPlayOnReadyRef.current = false;
    toggleSpeechSynthesis();
  };

  // Start playing once a just-requested clip is attached to the audio element.
  useEffect(() => {
    if (!usingAddis || !autoPlayOnReadyRef.current) return;
    autoPlayOnReadyRef.current = false;
    audioRef.current?.play().catch(() => {});
  }, [usingAddis, addisClip?.audio_url]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate, addisClip?.audio_url]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted, addisClip?.audio_url]);

  const switchLanguage = (next) => {
    if (next === language) return;
    stopEverything();
    setLanguage(next);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  };

  const selectVoice = async (nextVoiceId) => {
    setShowVoicePicker(false);
    if (nextVoiceId === voiceId) return;
    stopEverything();
    setVoiceId(nextVoiceId);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    autoPlayOnReadyRef.current = true;
    await load({ language: 'am', voiceId: nextVoiceId });
  };

  const handleRateChange = (rate) => {
    setPlaybackRate(rate);
    // Speech synthesis rate can only be set before speaking, so restart it.
    if (!usingAddis && isPlaying) {
      stopEverything();
      setProgress(0);
    }
  };

  const handleScrub = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));

    if (usingAddis && audioRef.current && duration > 0) {
      audioRef.current.currentTime = ratio * duration;
      setProgress(ratio * 100);
      return;
    }
    // Browser speech synthesis cannot seek; move the indicator only.
    setProgress(ratio * 100);
  };

  const statusLabel = () => {
    if (isLoading) return 'Generating narration with Addis AI...';
    if (isPlaying) return 'Playing narration...';
    if (progress >= 100) return 'Completed';
    if (isAmharic && addisEligible && !usingAddis) return 'Tap play for Addis AI voice';
    return 'Ready to Listen';
  };

  const engineLabel = () => {
    if (usingAddis) {
      return `Addis AI · ${addisClip.voice_name || addisClip.voice_id}`;
    }
    if (isAmharic) return 'On-device voice';
    return 'On-device voice (English)';
  };

  return (
    <div className="rounded-2xl border border-smrmp-gold/40 bg-gradient-to-br from-[#241710] via-[#1C120B] to-[#120D08] p-5 text-smrmp-parchment shadow-lg">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-smrmp-gold/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-smrmp-gold/20 text-smrmp-gold ring-1 ring-smrmp-gold/40">
            <SpeakerWaveIcon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-white">Audio Narration &amp; Story</h4>
            <p className="text-[10px] text-smrmp-gold/80">Adwa Victory Heritage Audio Guide</p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/10 p-1">
          <button
            type="button"
            onClick={() => switchLanguage('en')}
            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition-all ${
              language === 'en'
                ? 'bg-smrmp-gold text-black shadow-xs'
                : 'text-smrmp-parchment/70 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => switchLanguage('am')}
            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition-all ${
              isAmharic
                ? 'bg-smrmp-gold text-black shadow-xs'
                : 'text-smrmp-parchment/70 hover:text-white'
            }`}
          >
            አማርኛ
          </button>
        </div>
      </div>

      {usingAddis && (
        <audio
          ref={audioRef}
          src={addisClip.audio_url}
          preload="auto"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onTimeUpdate={(e) => {
            const audio = e.currentTarget;
            setCurrentTime(audio.currentTime);
            if (audio.duration > 0) setProgress((audio.currentTime / audio.duration) * 100);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setProgress(100);
          }}
          className="hidden"
        />
      )}

      {/* Main Controls */}
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handlePlayPause}
            disabled={isLoading}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-smrmp-gold text-black shadow-md shadow-smrmp-gold/20 transition-all hover:scale-105 active:scale-95 disabled:cursor-wait disabled:opacity-70"
            aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
          >
            {isLoading ? (
              <ArrowPathIcon className="h-6 w-6 animate-spin" />
            ) : isPlaying ? (
              <PauseIcon className="h-6 w-6 fill-current" />
            ) : (
              <PlayIcon className="ml-0.5 h-6 w-6 fill-current" />
            )}
          </button>

          {/* Progress Bar & Scrubber */}
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-smrmp-gold/90">
              <span>{statusLabel()}</span>
              <span>
                {usingAddis && duration > 0
                  ? `${formatClock(currentTime)} / ${formatClock(duration)}`
                  : `${Math.round(progress)}%`}
              </span>
            </div>
            <div
              className="relative h-2.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/10"
              onClick={handleScrub}
            >
              <div
                className="h-full bg-gradient-to-r from-smrmp-gold via-[#F5C842] to-[#E5A823] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Engine attribution + Amharic voice picker */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
          <span className="inline-flex items-center gap-1 rounded-lg bg-black/30 px-2 py-1 font-bold uppercase tracking-wider text-smrmp-gold/90">
            <SparklesIcon className="h-3 w-3" />
            {engineLabel()}
          </span>

          {isAmharic && addisEligible && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowVoicePicker((open) => !open)}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2 py-1 font-bold text-smrmp-parchment/80 transition-colors hover:text-white"
              >
                Change voice
                <ChevronDownIcon className="h-3 w-3" />
              </button>

              {showVoicePicker && (
                <div className="absolute right-0 z-20 mt-1 max-h-56 w-56 overflow-y-auto rounded-xl border border-smrmp-gold/30 bg-[#1C120B] p-1 shadow-xl">
                  {voiceCatalog?.voices?.length ? (
                    voiceCatalog.voices.map((voice) => {
                      const activeId = voiceId || voiceCatalog.default_voice_id;
                      return (
                        <button
                          key={voice.id}
                          type="button"
                          onClick={() => selectVoice(voice.id)}
                          className={`block w-full rounded-lg px-2 py-1.5 text-left transition-colors ${
                            activeId === voice.id
                              ? 'bg-smrmp-gold/20 text-smrmp-gold'
                              : 'text-smrmp-parchment/80 hover:bg-white/10'
                          }`}
                        >
                          <span className="block text-[11px] font-bold">{voice.name}</span>
                          <span className="block text-[9px] text-smrmp-parchment/60">
                            {voice.descriptor}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <p className="px-2 py-1.5 text-[10px] text-smrmp-parchment/60">
                      Loading voices...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {isAmharic && !addisEligible && (
          <p className="rounded-lg bg-black/30 px-2.5 py-1.5 text-[10px] text-smrmp-parchment/60">
            No Amharic description on record yet, so this plays with the on-device
            voice. Add one to unlock the Addis AI narration.
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-rose-950/40 px-2.5 py-1.5 text-[10px] text-rose-300">
            {error}
          </p>
        )}

        {/* Secondary Options: Speed, Mute, Transcript Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-smrmp-parchment/60">
              Speed:
            </span>
            {PLAYBACK_RATES.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleRateChange(rate)}
                className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold transition-colors ${
                  playbackRate === rate
                    ? 'border-smrmp-gold bg-smrmp-gold/20 text-smrmp-gold'
                    : 'border-white/10 text-smrmp-parchment/60 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const next = !isMuted;
                setIsMuted(next);
                if (speechRef.current) speechRef.current.volume = next ? 0 : 1;
              }}
              className="flex items-center gap-1 text-[11px] text-smrmp-parchment/80 transition-colors hover:text-smrmp-gold"
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="h-4 w-4 text-rose-400" />
              ) : (
                <SpeakerWaveIcon className="h-4 w-4" />
              )}
              <span>{isMuted ? 'Muted' : 'Mute'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowTranscript((open) => !open)}
              className="flex items-center gap-1 rounded-lg border border-smrmp-gold/30 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-smrmp-gold transition-all hover:bg-white/20"
            >
              <DocumentTextIcon className="h-3.5 w-3.5" />
              <span>{showTranscript ? 'Hide Story' : 'Read Transcript'}</span>
            </button>
          </div>
        </div>

        {/* Transcript Box */}
        {showTranscript && (
          <div className="animate-in fade-in mt-2 rounded-xl border border-smrmp-gold/20 bg-black/40 p-3.5 text-xs leading-relaxed text-smrmp-parchment/90 duration-200">
            <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-smrmp-gold">
              <span>Transcript ({isAmharic ? 'Amharic' : 'English'})</span>
              <LanguageIcon className="h-3.5 w-3.5" />
            </div>
            <p className="whitespace-pre-wrap">{currentNarrative}</p>
          </div>
        )}
      </div>
    </div>
  );
}
