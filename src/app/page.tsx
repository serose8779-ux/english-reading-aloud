"use client";

import { useState } from "react";
import ModeSelector, { AppMode } from "@/components/ModeSelector";
import ReadAloudMode from "@/components/ReadAloudMode";
import ShadowingMode from "@/components/ShadowingMode";

export default function Home() {
  const [mode, setMode] = useState<AppMode>("read-aloud");
  const [inputText, setInputText] = useState("");

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4 py-8 gap-6"
      style={{ backgroundColor: "#FFF8F0" }}
    >
      {/* 헤더 */}
      <header className="text-center">
        <div className="text-5xl mb-1">🔊</div>
        <h1 className="text-4xl font-black" style={{ color: "#2D3561" }}>
          English Reading Aloud
        </h1>
        <p className="text-lg font-semibold mt-1" style={{ color: "#7a85b0" }}>
          영어 문장을 듣고, 따라 말해봐요!
        </p>
      </header>

      {/* 모드 선택 탭 */}
      <ModeSelector mode={mode} onChange={setMode} />

      <div className="w-full max-w-2xl flex flex-col gap-6">
        {/* 텍스트 입력 */}
        <section>
          <label
            htmlFor="english-input"
            className="block text-lg font-bold mb-2"
            style={{ color: "#2D3561" }}
          >
            📝 영어 문장을 입력하세요
          </label>
          <textarea
            id="english-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type English sentences here... (마침표로 문장을 구분해요)"
            rows={4}
            className="w-full text-xl font-semibold p-4 rounded-2xl outline-none resize-none"
            style={{
              backgroundColor: "#FFFBF5",
              border: "2px solid #87CEEB",
              color: "#2D3561",
              lineHeight: "1.8",
            }}
            onFocus={(e) => (e.target.style.border = "2px solid #5BB8E0")}
            onBlur={(e) => (e.target.style.border = "2px solid #87CEEB")}
            aria-label="영어 문장 입력"
          />
          <p
            className="text-right text-base font-semibold mt-1"
            style={{ color: "#7a85b0" }}
          >
            {inputText.length}자
          </p>
        </section>

        {/* 모드별 기능 패널 */}
        <section
          className="rounded-3xl p-6"
          style={{
            backgroundColor: "#FFFBF5",
            boxShadow: "0 4px 20px rgba(135,206,235,0.25)",
          }}
        >
          {mode === "read-aloud" ? (
            <ReadAloudMode text={inputText} />
          ) : (
            <ShadowingMode text={inputText} />
          )}
        </section>

        {/* 모드 설명 */}
        <div
          className="rounded-2xl p-4 text-base font-semibold"
          style={{
            backgroundColor:
              mode === "read-aloud" ? "#FFF0F5" : "#EFF8FF",
            border: `2px solid ${mode === "read-aloud" ? "#FFB3C6" : "#BAE6FD"}`,
            color: "#5a6080",
          }}
        >
          {mode === "read-aloud" ? (
            <p>
              🔊 <strong>읽어주기 모드</strong>: 원어민 목소리로 천천히 읽어줘요.
              읽는 단어가 파란색으로 표시돼요!
            </p>
          ) : (
            <p>
              🎤 <strong>따라 읽기 모드</strong>: 문장을 듣고 → 따라 말하면 →{" "}
              <span style={{ color: "#3B82F6", fontWeight: 700 }}>파란색</span>은 정확,{" "}
              <span style={{ color: "#EF4444", fontWeight: 700 }}>빨간색</span>은 틀린 부분이에요!
              (Chrome 전용)
            </p>
          )}
        </div>
      </div>

      <footer
        className="text-center text-base font-semibold mt-2"
        style={{ color: "#a0a8c8" }}
      >
        🌟 초등학생을 위한 영어 읽기 도우미
      </footer>
    </main>
  );
}
