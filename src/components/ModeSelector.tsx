"use client";

export type AppMode = "read-aloud" | "shadowing";

interface ModeSelectorProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div
      className="flex w-full max-w-sm rounded-2xl p-1 gap-1"
      style={{ backgroundColor: "#EDE8FF" }}
      role="tablist"
      aria-label="학습 모드 선택"
    >
      <button
        role="tab"
        aria-selected={mode === "read-aloud"}
        onClick={() => onChange("read-aloud")}
        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-lg font-bold transition-all"
        style={{
          backgroundColor: mode === "read-aloud" ? "#FF8FAB" : "transparent",
          color: mode === "read-aloud" ? "#fff" : "#7a6ab0",
          boxShadow:
            mode === "read-aloud"
              ? "0 2px 10px rgba(255,143,171,0.4)"
              : "none",
        }}
      >
        <span className="text-2xl">🔊</span>
        <span>읽어주기</span>
      </button>

      <button
        role="tab"
        aria-selected={mode === "shadowing"}
        onClick={() => onChange("shadowing")}
        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-lg font-bold transition-all"
        style={{
          backgroundColor: mode === "shadowing" ? "#87CEEB" : "transparent",
          color: mode === "shadowing" ? "#fff" : "#7a6ab0",
          boxShadow:
            mode === "shadowing"
              ? "0 2px 10px rgba(135,206,235,0.4)"
              : "none",
        }}
      >
        <span className="text-2xl">🎤</span>
        <span>따라 읽기</span>
      </button>
    </div>
  );
}
