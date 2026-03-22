"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type SpeechRate = 0.7 | 0.85 | 1.0;

export interface SpeechVoice {
  name: string;
  lang: string;
  voiceURI: string;
}

export interface UseSpeechReturn {
  isPlaying: boolean;
  isPaused: boolean;
  currentWordIndex: number;
  words: string[];
  voices: SpeechVoice[];
  selectedVoice: SpeechVoice | null;
  rate: SpeechRate;
  isSupported: boolean;
  speak: (text: string, overrideRate?: number, onEnd?: () => void) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (rate: SpeechRate) => void;
  setSelectedVoice: (voice: SpeechVoice) => void;
}

export function useSpeech(): UseSpeechReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [words, setWords] = useState<string[]>([]);
  const [voices, setVoices] = useState<SpeechVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechVoice | null>(null);
  const [rate, setRate] = useState<SpeechRate>(0.85);
  const [isSupported, setIsSupported] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  useEffect(() => {
    if (!isSupported) return;
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const englishVoices = allVoices
        .filter((v) => v.lang.startsWith("en"))
        .map((v) => ({ name: v.name, lang: v.lang, voiceURI: v.voiceURI }));
      setVoices(englishVoices);
      if (englishVoices.length > 0 && !selectedVoice) {
        const usVoice = englishVoices.find((v) => v.lang === "en-US") ?? englishVoices[0];
        setSelectedVoice(usVoice);
      }
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [isSupported, selectedVoice]);

  /** 타이머 정리 */
  const clearWordTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * 타이밍 기반 단어 하이라이트 (노래방 스타일)
   * 각 단어의 길이 비율에 따라 순서대로 파란색으로 변경
   */
  const startTimingHighlight = useCallback(
    (wordList: string[], speechRate: number) => {
      // 평균 발화 속도: 1.0x 기준 약 12 글자/초
      const charsPerSec = 12 * speechRate;
      // 단어별 누적 시작 시각(ms) 계산
      const timings: number[] = [];
      let accumulated = 0;
      for (const word of wordList) {
        timings.push(accumulated);
        // 최소 150ms 보장 (너무 짧은 단어도 보임)
        accumulated += Math.max(150, (word.length / charsPerSec) * 1000);
      }

      let boundaryTookOver = false;

      const scheduleNext = (idx: number) => {
        if (boundaryTookOver || idx >= wordList.length) return;
        setCurrentWordIndex(idx);
        if (idx + 1 < wordList.length) {
          const delay = timings[idx + 1] - timings[idx];
          timerRef.current = setTimeout(() => scheduleNext(idx + 1), delay);
        }
      };

      // 첫 단어 표시까지 약간의 딜레이(TTS 실제 발성 시작 감안)
      timerRef.current = setTimeout(() => scheduleNext(0), 200);

      // onboundary가 작동하면 타이머를 중단하고 boundary를 따름
      return () => { boundaryTookOver = true; };
    },
    []
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    clearWordTimer();
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
  }, [isSupported, clearWordTimer]);

  const speak = useCallback(
    (text: string, overrideRate?: number, onEnd?: () => void) => {
      if (!isSupported || !text.trim()) return;

      clearWordTimer();
      window.speechSynthesis.cancel();

      const wordList = text.trim().split(/\s+/);
      setWords(wordList);
      setCurrentWordIndex(-1);

      // Chrome에서 cancel() 직후 speak() 오작동 방지
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = overrideRate ?? rate;

        if (selectedVoice) {
          const allVoices = window.speechSynthesis.getVoices();
          const voice = allVoices.find((v) => v.voiceURI === selectedVoice.voiceURI);
          if (voice) utterance.voice = voice;
        }

        let disableTimer: (() => void) | null = null;
        let boundaryFired = false;

        utterance.onstart = () => {
          setIsPlaying(true);
          setIsPaused(false);
          // 타이밍 기반 하이라이트 시작 (onboundary 폴백)
          disableTimer = startTimingHighlight(wordList, overrideRate ?? rate);
        };

        // onboundary가 실제로 작동하면 → 타이머 중단 후 boundary 값 사용
        utterance.onboundary = (event) => {
          if (event.name !== "word") return;
          if (!boundaryFired) {
            boundaryFired = true;
            disableTimer?.(); // 타이밍 타이머 비활성화
            clearWordTimer();
          }
          const spokenText = text.slice(0, event.charIndex + event.charLength);
          const wordCount = spokenText.trim().split(/\s+/).length - 1;
          setCurrentWordIndex(wordCount);
        };

        utterance.onend = () => {
          clearWordTimer();
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentWordIndex(-1);
          onEnd?.();
        };

        utterance.onerror = () => {
          clearWordTimer();
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentWordIndex(-1);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }, 120);
    },
    [isSupported, rate, selectedVoice, clearWordTimer, startTimingHighlight]
  );

  const pause = useCallback(() => {
    if (!isSupported || !isPlaying) return;
    clearWordTimer();
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, [isSupported, isPlaying, clearWordTimer]);

  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
    setIsPlaying(true);
  }, [isSupported, isPaused]);

  return {
    isPlaying,
    isPaused,
    currentWordIndex,
    words,
    voices,
    selectedVoice,
    rate,
    isSupported,
    speak,
    pause,
    resume,
    stop,
    setRate,
    setSelectedVoice,
  };
}
