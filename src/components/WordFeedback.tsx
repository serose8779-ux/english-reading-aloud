"use client";

import { WordResult } from "@/hooks/useSpeechRecognition";

interface WordFeedbackProps {
  wordResults: WordResult[];
  isListening: boolean;
}

const STATUS_STYLE: Record<WordResult["status"], React.CSSProperties> = {
  correct: {
    color: "#fff",
    backgroundColor: "#3B82F6",
    borderRadius: "8px",
    padding: "2px 6px",
  },
  incorrect: {
    color: "#fff",
    backgroundColor: "#EF4444",
    borderRadius: "8px",
    padding: "2px 6px",
    textDecoration: "line-through",
  },
  pending: {
    color: "#2D3561",
    backgroundColor: "transparent",
  },
};

export default function WordFeedback({ wordResults, isListening }: WordFeedbackProps) {
  if (wordResults.length === 0) return null;

  const correctCount = wordResults.filter((w) => w.status === "correct").length;
  const total = wordResults.length;
  const score = Math.round((correctCount / total) * 100);

  const allDone = wordResults.every((w) => w.status !== "pending");

  return (
    <div className="flex flex-col gap-3">
      {/* 단어 피드백 */}
      <div
        className="w-full rounded-2xl p-5 flex flex-wrap gap-x-3 gap-y-3"
        style={{ backgroundColor: "#FFFBF5", border: "2px solid #C9B8F5" }}
        aria-live="polite"
        aria-label="따라 읽기 피드백"
      >
        {wordResults.map((result, i) => (
          <span
            key={i}
            className="text-2xl font-bold transition-all duration-200"
            style={STATUS_STYLE[result.status]}
          >
            {result.word}
          </span>
        ))}
      </div>

      {/* 마이크 활성 표시 */}
      {isListening && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl animate-pulse">🎙️</span>
          <span className="text-lg font-bold" style={{ color: "#EF4444" }}>
            듣고 있어요... 따라 말해봐요!
          </span>
        </div>
      )}

      {/* 점수 표시 (완료 후) */}
      {allDone && !isListening && (
        <div
          className="rounded-2xl p-4 text-center"
          style={{
            backgroundColor:
              score >= 80 ? "#D1FAE5" : score >= 50 ? "#FEF3C7" : "#FEE2E2",
            border: `2px solid ${
              score >= 80 ? "#34D399" : score >= 50 ? "#FCD34D" : "#FCA5A5"
            }`,
          }}
        >
          <p className="text-3xl font-black" style={{ color: "#2D3561" }}>
            {score >= 80 ? "🎉" : score >= 50 ? "👍" : "💪"}{" "}
            {score}점!
          </p>
          <p className="text-lg font-bold mt-1" style={{ color: "#5a6080" }}>
            {total}개 단어 중 {correctCount}개 정확해요!
            {score >= 80 && " 정말 잘했어요!"}
            {score >= 50 && score < 80 && " 조금만 더 연습해봐요!"}
            {score < 50 && " 다시 한 번 도전해봐요!"}
          </p>
        </div>
      )}

      {/* 범례 */}
      <div className="flex justify-center gap-4 text-base font-semibold flex-wrap">
        <span className="flex items-center gap-1">
          <span
            className="rounded px-2 py-0.5 text-white"
            style={{ backgroundColor: "#3B82F6" }}
          >
            단어
          </span>
          정확해요!
        </span>
        <span className="flex items-center gap-1">
          <span
            className="rounded px-2 py-0.5 text-white"
            style={{ backgroundColor: "#EF4444" }}
          >
            단어
          </span>
          틀렸어요
        </span>
        <span className="flex items-center gap-1">
          <span
            className="rounded px-2 py-0.5"
            style={{ color: "#2D3561", border: "1px solid #ccc" }}
          >
            단어
          </span>
          아직이에요
        </span>
      </div>
    </div>
  );
}
