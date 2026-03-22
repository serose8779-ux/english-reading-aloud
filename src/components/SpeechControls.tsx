"use client";

import { SpeechRate, SpeechVoice } from "@/hooks/useSpeech";

interface SpeechControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  rate: SpeechRate;
  voices: SpeechVoice[];
  selectedVoice: SpeechVoice | null;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRateChange: (rate: SpeechRate) => void;
  onVoiceChange: (voice: SpeechVoice) => void;
}

const RATES: { value: SpeechRate; label: string; emoji: string }[] = [
  { value: 0.7, label: "느리게", emoji: "🐢" },
  { value: 0.85, label: "보통", emoji: "🐇" },
  { value: 1.0, label: "빠르게", emoji: "🚀" },
];

export default function SpeechControls({
  isPlaying,
  isPaused,
  rate,
  voices,
  selectedVoice,
  onPlay,
  onPause,
  onResume,
  onStop,
  onRateChange,
  onVoiceChange,
}: SpeechControlsProps) {
  return (
    <div className="w-full flex flex-col gap-5">
      {/* 재생 버튼 그룹 */}
      <div className="flex justify-center gap-4">
        {/* 재생 / 일시정지 / 재개 버튼 */}
        {!isPlaying && !isPaused && (
          <button
            onClick={onPlay}
            className="btn-bounce flex items-center gap-2 text-white text-xl font-bold py-4 px-8 rounded-2xl transition-transform active:scale-95"
            style={{ backgroundColor: "#FF8FAB" }}
            aria-label="영어 문장 읽기 시작"
          >
            <span className="text-3xl">▶️</span>
            <span>읽어줘!</span>
          </button>
        )}

        {isPlaying && (
          <button
            onClick={onPause}
            className="btn-bounce flex items-center gap-2 text-white text-xl font-bold py-4 px-8 rounded-2xl transition-transform active:scale-95"
            style={{ backgroundColor: "#87CEEB" }}
            aria-label="일시정지"
          >
            <span className="text-3xl">⏸️</span>
            <span>잠깐!</span>
          </button>
        )}

        {isPaused && (
          <button
            onClick={onResume}
            className="btn-bounce flex items-center gap-2 text-white text-xl font-bold py-4 px-8 rounded-2xl transition-transform active:scale-95"
            style={{ backgroundColor: "#98E4D4" }}
            aria-label="계속 읽기"
          >
            <span className="text-3xl">▶️</span>
            <span>계속!</span>
          </button>
        )}

        {/* 정지 버튼 */}
        {(isPlaying || isPaused) && (
          <button
            onClick={onStop}
            className="btn-bounce flex items-center gap-2 text-white text-xl font-bold py-4 px-8 rounded-2xl transition-transform active:scale-95"
            style={{ backgroundColor: "#C9B8F5" }}
            aria-label="읽기 정지"
          >
            <span className="text-3xl">⏹️</span>
            <span>그만!</span>
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
              onClick={() => onRateChange(value)}
              className="flex flex-col items-center gap-1 py-3 px-5 rounded-2xl text-base font-bold transition-all"
              style={{
                backgroundColor: rate === value ? "#FFE599" : "#FFFBF5",
                border: rate === value ? "2px solid #FFD966" : "2px solid #e0d8c8",
                color: "#2D3561",
                transform: rate === value ? "scale(1.05)" : "scale(1)",
              }}
              aria-label={`속도: ${label}`}
              aria-pressed={rate === value}
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
              const voice = voices.find((v) => v.voiceURI === e.target.value);
              if (voice) onVoiceChange(voice);
            }}
            className="w-full text-lg font-semibold py-3 px-4 rounded-2xl outline-none cursor-pointer"
            style={{
              backgroundColor: "#FFFBF5",
              border: "2px solid #87CEEB",
              color: "#2D3561",
            }}
            aria-label="영어 목소리 선택"
          >
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
