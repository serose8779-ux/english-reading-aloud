"use client";

import { useState, useCallback, useRef } from "react";
import { useSpeech } from "@/hooks/useSpeech";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import WordFeedback from "@/components/WordFeedback";

interface ShadowingModeProps {
  text: string;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function playDingDong(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = new AudioContext();

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = "sine";
      osc1.frequency.value = 880;
      gain1.gain.setValueAtTime(0.4, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.6);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "sine";
      osc2.frequency.value = 660;
      gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.5);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
      osc2.start(ctx.currentTime + 0.5);
      osc2.stop(ctx.currentTime + 1.1);

      setTimeout(resolve, 1200);
    } catch {
      resolve();
    }
  });
}

type Step = "idle" | "listening-tts" | "ding-dong" | "recording" | "feedback";

export default function ShadowingMode({ text }: ShadowingModeProps) {
  const sentences = splitSentences(text);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<Step>("idle");

  // 진행 중인 시퀀스를 취소할 수 있는 플래그
  const cancelledRef = useRef(false);

  const { speak, stop: stopTTS, isSupported: ttsSupported } = useSpeech();
  const {
    isListening,
    wordResults,
    isSupported: sttSupported,
    startListening,
    stopListening,
    finalize,
    reset: resetSTT,
  } = useSpeechRecognition();

  const currentSentence = sentences[currentIndex] ?? "";

  const handleStart = useCallback(() => {
    if (!currentSentence) return;

    cancelledRef.current = false;
    resetSTT();
    setStep("listening-tts");

    // 이 시점의 문장을 클로저로 캡처 (stale closure 방지)
    const sentence = currentSentence;

    speak(sentence, 0.75, async () => {
      // TTS 끝난 뒤 — 취소됐으면 중단
      if (cancelledRef.current) return;

      setStep("ding-dong");
      await playDingDong();

      if (cancelledRef.current) return;

      setStep("recording");
      startListening(sentence);
    });
  }, [currentSentence, speak, resetSTT, startListening]);

  const handleStopRecording = useCallback(() => {
    stopListening();
    finalize();
    setStep("feedback");
  }, [stopListening, finalize]);

  const handleRetry = useCallback(() => {
    cancelledRef.current = true;
    stopTTS();
    resetSTT();
    setStep("idle");
  }, [stopTTS, resetSTT]);

  const handleNext = useCallback(() => {
    cancelledRef.current = true;
    stopTTS();
    resetSTT();
    setStep("idle");
    setCurrentIndex((prev) => Math.min(prev + 1, sentences.length - 1));
  }, [stopTTS, resetSTT, sentences.length]);

  const handleReset = useCallback(() => {
    cancelledRef.current = true;
    stopTTS();
    resetSTT();
    setStep("idle");
    setCurrentIndex(0);
  }, [stopTTS, resetSTT]);

  if (!ttsSupported || !sttSupported) {
    return (
      <div
        className="rounded-2xl p-4 text-center text-lg font-bold"
        style={{ backgroundColor: "#FFB3C6", color: "#2D3561" }}
      >
        ⚠️ 따라 읽기는 Chrome 브라우저에서만 지원돼요!
      </div>
    );
  }

  if (sentences.length === 0) {
    return (
      <div
        className="rounded-2xl p-4 text-center text-lg font-bold"
        style={{ backgroundColor: "#FFE599", color: "#2D3561" }}
      >
        📝 위에 영어 문장을 입력해봐요!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 진행 상태 */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold" style={{ color: "#2D3561" }}>
          📖 {currentIndex + 1} / {sentences.length} 문장
        </span>
        <button
          onClick={handleReset}
          className="text-base font-bold py-2 px-4 rounded-xl"
          style={{ backgroundColor: "#EDE8FF", color: "#7a6ab0" }}
          aria-label="처음부터 다시 시작"
        >
          🔄 처음부터
        </button>
      </div>

      {/* 현재 문장 */}
      <div
        className="w-full rounded-2xl p-5"
        style={{ backgroundColor: "#EDE8FF", border: "2px solid #C9B8F5" }}
      >
        <p className="text-xl font-bold mb-1" style={{ color: "#7a6ab0" }}>
          현재 문장
        </p>
        <p className="text-2xl font-black leading-relaxed" style={{ color: "#2D3561" }}>
          {currentSentence}
        </p>
      </div>

      {/* step: idle */}
      {step === "idle" && (
        <button
          onClick={handleStart}
          className="flex items-center justify-center gap-2 text-white text-xl font-bold py-5 px-8 rounded-2xl active:scale-95 transition-all"
          style={{
            backgroundColor: "#87CEEB",
            boxShadow: "0 4px 15px rgba(135,206,235,0.4)",
          }}
          aria-label="문장 듣기 시작"
        >
          <span className="text-3xl">👂</span> 들어볼게요!
        </button>
      )}

      {/* step: listening-tts */}
      {step === "listening-tts" && (
        <div
          className="rounded-2xl p-5 text-center"
          style={{ backgroundColor: "#FFFBF5", border: "2px solid #FFE599" }}
        >
          <p className="text-4xl mb-2 animate-bounce">🔊</p>
          <p className="text-xl font-bold" style={{ color: "#2D3561" }}>
            잘 들어봐요!
          </p>
          <p className="text-base mt-1" style={{ color: "#7a85b0" }}>
            소리가 끝나면 신호가 울려요
          </p>
        </div>
      )}

      {/* step: ding-dong */}
      {step === "ding-dong" && (
        <div
          className="rounded-2xl p-5 text-center"
          style={{ backgroundColor: "#FEF9C3", border: "2px solid #FDE047" }}
        >
          <p className="text-4xl mb-2">🔔</p>
          <p className="text-xl font-bold" style={{ color: "#2D3561" }}>
            띵~동~ 이제 따라 읽어봐요!
          </p>
        </div>
      )}

      {/* step: recording */}
      {step === "recording" && (
        <div className="flex flex-col gap-3">
          <div
            className="rounded-2xl p-5 text-center"
            style={{ backgroundColor: "#FEE2E2", border: "2px solid #FCA5A5" }}
          >
            <p className="text-4xl mb-2 animate-pulse">🎙️</p>
            <p className="text-xl font-bold" style={{ color: "#2D3561" }}>
              따라 말해봐요!
            </p>
            <p className="text-base mt-1" style={{ color: "#7a85b0" }}>
              마이크에 대고 또렷하게 말해주세요
            </p>
          </div>

          {/* 실시간 인식 결과 표시 */}
          {wordResults.length > 0 && (
            <div
              className="w-full rounded-2xl p-4 flex flex-wrap gap-x-3 gap-y-2"
              style={{ backgroundColor: "#FFFBF5", border: "2px solid #C9B8F5" }}
              aria-live="polite"
            >
              {wordResults.map((r, i) => (
                <span
                  key={i}
                  className="text-2xl font-bold transition-all duration-200"
                  style={{
                    color: r.status !== "pending" ? "#fff" : "#2D3561",
                    backgroundColor:
                      r.status === "correct"
                        ? "#3B82F6"
                        : r.status === "incorrect"
                        ? "#EF4444"
                        : "transparent",
                    borderRadius: "8px",
                    padding: "2px 6px",
                  }}
                >
                  {r.word}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={handleStopRecording}
            className="flex items-center justify-center gap-2 text-white text-xl font-bold py-4 px-8 rounded-2xl active:scale-95"
            style={{ backgroundColor: "#EF4444" }}
            aria-label="녹음 완료"
          >
            <span className="text-2xl">⏹️</span> 다 말했어요!
          </button>
        </div>
      )}

      {/* step: feedback */}
      {step === "feedback" && (
        <div className="flex flex-col gap-4">
          <WordFeedback wordResults={wordResults} isListening={isListening} />

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 text-white text-xl font-bold py-4 px-6 rounded-2xl active:scale-95"
              style={{ backgroundColor: "#FF8FAB" }}
              aria-label="이 문장 다시 연습"
            >
              <span className="text-2xl">🔁</span> 다시!
            </button>

            {currentIndex < sentences.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 text-white text-xl font-bold py-4 px-6 rounded-2xl active:scale-95"
                style={{ backgroundColor: "#98E4D4" }}
                aria-label="다음 문장으로"
              >
                다음 문장 <span className="text-2xl">➡️</span>
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-white text-xl font-bold py-4 px-6 rounded-2xl active:scale-95"
                style={{ backgroundColor: "#C9B8F5" }}
                aria-label="처음부터 다시"
              >
                <span className="text-2xl">🏁</span> 완료! 다시 도전
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
