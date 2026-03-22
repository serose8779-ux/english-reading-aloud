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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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

  /** pending 상태 단어를 incorrect로 확정 — 사용자가 "다 말했어요" 눌렀을 때만 호출 */
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

      const SpeechRecognitionClass =
        (window as Window & {
          SpeechRecognition?: typeof SpeechRecognition;
          webkitSpeechRecognition?: typeof SpeechRecognition;
        }).SpeechRecognition ??
        (window as Window & {
          SpeechRecognition?: typeof SpeechRecognition;
          webkitSpeechRecognition?: typeof SpeechRecognition;
        }).webkitSpeechRecognition;

      if (!SpeechRecognitionClass) return;

      const normalized = normalizeWords(targetSentence);
      targetWordsRef.current = normalized;

      // 초기: 모두 pending (빨간/파란색 없음)
      setWordResults(normalized.map((w) => ({ word: w, status: "pending" })));
      setTranscript("");

      const recognition = new SpeechRecognitionClass();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        setTranscript(fullTranscript);
        const spokenWords = normalizeWords(fullTranscript);
        setWordResults(compareWords(targetWordsRef.current, spokenWords));
      };

      // onend에서는 상태를 바꾸지 않음 — finalize()가 담당
      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

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
