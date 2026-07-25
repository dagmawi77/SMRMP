import { useState, useEffect, useRef } from 'react';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  DocumentTextIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';

export default function AudioNarrationPlayer({ artifactName, description, amharicDescription, origin, period }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' | 'am'

  const timerRef = useRef(null);
  const speechRef = useRef(null);

  const defaultNarrativeEn = description || `${artifactName} is a historical asset preserved at the Adwa Victory Memorial Museum. Hailing from ${origin || 'Ethiopia'} during the ${period || 'historical era'}, it embodies rich heritage and craftsmanship.`;

  const narrativeAm = amharicDescription || `${artifactName} በአድዋ ድል መታሰቢያ ሙዚየም ውስጥ የሚገኝ ታሪካዊ ቅርስ ነው። ${period || 'በታሪካዊው ዘመን'} የተሠራው ይህ ቅርስ የኢትዮጵያን የጀግንነት ታሪክ እና ባህላዊ ቅርስ ያንፀባርቃል።`;

  const currentNarrative = language === 'am' ? narrativeAm : defaultNarrativeEn;

  // Web Speech API integration for real speech synthesis
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handlePlayPause = () => {
    if (!('speechSynthesis' in window)) {
      // Fallback simulated progress
      toggleSimulatedPlay();
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
        startTimer();
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(currentNarrative);
        utterance.rate = playbackRate;
        utterance.lang = language === 'am' ? 'am-ET' : 'en-US';

        utterance.onend = () => {
          setIsPlaying(false);
          setProgress(100);
          if (timerRef.current) clearInterval(timerRef.current);
        };

        utterance.onerror = () => {
          // Fallback if voice not found
          toggleSimulatedPlay();
        };

        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
        setProgress(0);
        startTimer();
      }
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const durationEstimateSec = Math.max(10, Math.ceil(currentNarrative.length / 12));
    const stepMs = 200;
    const increment = (stepMs / (durationEstimateSec * 1000)) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          setIsPlaying(false);
          return 100;
        }
        return prev + increment;
      });
    }, stepMs);
  };

  const toggleSimulatedPlay = () => {
    if (isPlaying) {
      clearInterval(timerRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (progress >= 100) setProgress(0);
      startTimer();
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      // Chrome/Firefox handle volume on utterance
      if (speechRef.current) {
        speechRef.current.volume = isMuted ? 1 : 0;
      }
    }
  };

  const handleRateChange = (rate) => {
    setPlaybackRate(rate);
    if (isPlaying && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setProgress(0);
    }
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
            <h4 className="font-display text-sm font-bold text-white">Audio Narration & Story</h4>
            <p className="text-[10px] text-smrmp-gold/80">Adwa Victory Heritage Audio Guide</p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-white/10 p-1 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setLanguage('en');
              if (isPlaying) window.speechSynthesis?.cancel();
              setIsPlaying(false);
              setProgress(0);
            }}
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
            onClick={() => {
              setLanguage('am');
              if (isPlaying) window.speechSynthesis?.cancel();
              setIsPlaying(false);
              setProgress(0);
            }}
            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition-all ${
              language === 'am'
                ? 'bg-smrmp-gold text-black shadow-xs'
                : 'text-smrmp-parchment/70 hover:text-white'
            }`}
          >
            አማርኛ
          </button>
        </div>
      </div>

      {/* Main Controls */}
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handlePlayPause}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-smrmp-gold text-black shadow-md shadow-smrmp-gold/20 hover:scale-105 active:scale-95 transition-all"
            aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
          >
            {isPlaying ? (
              <PauseIcon className="h-6 w-6 fill-current" />
            ) : (
              <PlayIcon className="h-6 w-6 fill-current ml-0.5" />
            )}
          </button>

          {/* Progress Bar & Scrubber */}
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-smrmp-gold/90">
              <span>{isPlaying ? 'Playing Narration...' : progress === 100 ? 'Completed' : 'Ready to Listen'}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div
              className="relative h-2.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/10"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newProgress = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
                setProgress(newProgress);
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-smrmp-gold via-[#F5C842] to-[#E5A823] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Secondary Options: Speed, Mute, Transcript Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-smrmp-parchment/60 uppercase font-bold tracking-wider">Speed:</span>
            {[1, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleRateChange(rate)}
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold border transition-colors ${
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
              onClick={handleMuteToggle}
              className="flex items-center gap-1 text-[11px] text-smrmp-parchment/80 hover:text-smrmp-gold transition-colors"
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
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold text-smrmp-gold border border-smrmp-gold/30 hover:bg-white/20 transition-all"
            >
              <DocumentTextIcon className="h-3.5 w-3.5" />
              <span>{showTranscript ? 'Hide Story' : 'Read Transcript'}</span>
            </button>
          </div>
        </div>

        {/* Transcript Box */}
        {showTranscript && (
          <div className="mt-2 rounded-xl bg-black/40 p-3.5 border border-smrmp-gold/20 text-xs leading-relaxed text-smrmp-parchment/90 animate-in fade-in duration-200">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-smrmp-gold">
              <span>Transcript ({language === 'am' ? 'Amharic' : 'English'})</span>
              <LanguageIcon className="h-3.5 w-3.5" />
            </div>
            <p className="whitespace-pre-wrap">{currentNarrative}</p>
          </div>
        )}
      </div>
    </div>
  );
}
