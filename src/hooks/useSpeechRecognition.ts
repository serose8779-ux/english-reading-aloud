"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type WordResult = {
  word: string;
  status: "correct" | "incorrect" | "pending";
};

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  wordResults: WordResult[];
  isSupported: boolean;
  startListening: (targetSentence: string) => void;
  stopListening: () => void;
  finalize: () => void;
  reset: () => void;
}

// Web Speech API 타입 선언 (TypeScript 빌드 호환)
type SpeechRecognitionConstructor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  start: () => void;
  stop: () => void;
};

interface SpeechRecognitionResultEvent {
  results: {
    length: number;
    [index: number]: { [index: number]: { transcript: string } };
  };
}

type SpeechRecognitionInstance = InstanceType<SpeechRecognitionConstructor>;

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()\-]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function compareWords(original: string[], spoken: string[]): WordResult[] {
  return original.map((word, i) => {
    if (i >= spoken.length) return { word, status: "pending" };
    return { word, status: spoken[i] === word ? "correct" : "incorrect" };
  });
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [wordResults, setWordResults] = useState<WordResult[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const targetWordsRef = useRef<string[]>([]);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setIsSupported(supported);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const finalize = useCallback(() => {
    setWordResults((prev) =>
      prev.map((r) =>
        r.status === "pending" ? { ...r, status: "incorrect" } : r
      )
    );
  }, []);

  const reset = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setTranscript("");
    setWordResults([]);
    targetWordsRef.current = [];
  }, []);

  const startListening = useCallback(
    (targetSentence: string) => {
      if (!isSupported) return;

      recognitionRef.current?.stop();
      recognitionRef.current = null;

      const w = window as Window & {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
      const SpeechRecognitionClass = w.SpeechRecognition ?? w.webkitSpeechRecognition;
      if (!SpeechRecognitionClass) return;

      const normalized = normalizeWords(targetSentence);
      targetWordsRef.current = normalized;

      setWordResults(normalized.map((word) => ({ word, status: "pending" })));
      setTranscript("");

      const recognition = new SpeechRecognitionClass();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: SpeechRecognitionResultEvent) => {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        setTranscript(fullTranscript);
        const spokenWords = normalizeWords(fullTranscript);
        setWordResults(compareWords(targetWordsRef.current, spokenWords));
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    },
    [isSupported]
  );

  return {
    isListening,
    transcript,
    wordResults,
    isSupported,
    startListening,
    stopListening,
    finalize,
    reset,
  };
}
