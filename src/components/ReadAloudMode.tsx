"use client";

import { useSpeech, SpeechRate } from "@/hooks/useSpeech";

interface ReadAloudModeProps {
  text: string;
}

const RATES: { value: SpeechRate; label: string; emoji: string }[] = [
  { value: 0.7, label: "천천히", emoji: "🐢" },
  { value: 0.85, label: "보통", emoji: "🐇" },
  { value: 1.0, label: "빠르게", emoji: "🚀" },
];

export default function ReadAloudMode({ text }: ReadAloudModeProps) {
  const {
    isPlaying,
    isPaused,
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
  } = useSpeech();

  const handlePlay = () => {
    if (text.trim()) speak(text);
  };

  if (!isSupported) {
    return (
      <div
        className="rounded-2xl p-4 text-center text-lg font-bold"
        style={{ backgroundColor: "#FFB3C6", color: "#2D3561" }}
      >
        ⚠️ 이 브라우저는 음성 읽기를 지원하지 않아요. Chrome을 사용해 주세요!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 재생 버튼 */}
      <div className="flex justify-center gap-4 flex-wrap">
        {!isPlaying && !isPaused && (
          <button
            onClick={handlePlay}
            disabled={!text.trim()}
            className="flex items-center gap-2 text-white text-xl font-bold py-4 px-8 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: "#FF8FAB" }}
            aria-label="영어 문장 읽기 시작"
          >
            <span className="text-3xl">▶️</span> 읽어줘!
          </button>
        )}
        {isPlaying && (
          <button
            onClick={pause}
            className="flex items-center gap-2 text-white text-xl font-bold py-4 px-8 rounded-2xl active:scale-95"
            style={{ backgroundColor: "#87CEEB" }}
            aria-label="일시정지"
          >
            <span className="text-3xl">⏸️</span> 잠깐!
          </button>
        )}
        {isPaused && (
          <button
            onClick={resume}
            className="flex items-center gap-2 text-white text-xl font-bold py-4 px-8 rounded-2xl active:scale-95"
            style={{ backgroundColor: "#98E4D4" }}
            aria-label="계속 읽기"
          >
            <span className="text-3xl">▶️</span> 계속!
          </button>
        )}
        {(isPlaying || isPaused) && (
          <button
            onClick={stop}
            className="flex items-center gap-2 text-white text-xl font-bold py-4 px-8 rounded-2xl active:scale-95"
            style={{ backgroundColor: "#C9B8F5" }}
            aria-label="읽기 정지"
          >
            <span className="text-3xl">⏹️</span> 그만!
          </button>
        )}
      </div>

      {/* 속도 조절 */}
      <div className="flex flex-col gap-2">
        <p className="text-center text-lg font-bold" style={{ color: "#2D3561" }}>
          🎛️ 읽기 속도
        </p>
        <div className="flex justify-center gap-3">
          {RATES.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => setRate(value)}
              className="flex flex-col items-center gap-1 py-3 px-5 rounded-2xl text-base font-bold transition-all"
              style={{
                backgroundColor: rate === value ? "#FFE599" : "#FFFBF5",
                border: rate === value ? "2px solid #FFD966" : "2px solid #e0d8c8",
                color: "#2D3561",
                transform: rate === value ? "scale(1.05)" : "scale(1)",
              }}
              aria-pressed={rate === value}
              aria-label={`속도: ${label}`}
            >
              <span className="text-2xl">{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 목소리 선택 */}
      {voices.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-center text-lg font-bold" style={{ color: "#2D3561" }}>
            🎤 목소리 선택
          </p>
          <select
            value={selectedVoice?.voiceURI ?? ""}
            onChange={(e) => {
              const v = voices.find((v) => v.voiceURI === e.target.value);
              if (v) setSelectedVoice(v);
            }}
            className="w-full text-lg font-semibold py-3 px-4 rounded-2xl outline-none cursor-pointer"
            style={{
              backgroundColor: "#FFFBF5",
              border: "2px solid #87CEEB",
              color: "#2D3561",
            }}
            aria-label="영어 목소리 선택"
          >
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
