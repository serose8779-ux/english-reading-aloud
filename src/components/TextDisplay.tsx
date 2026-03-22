"use client";

interface TextDisplayProps {
  words: string[];
  currentWordIndex: number;
  isPlaying: boolean;
}

export default function TextDisplay({
  words,
  currentWordIndex,
  isPlaying,
}: TextDisplayProps) {
  if (words.length === 0) return null;

  return (
    <div
      className="w-full rounded-3xl p-6 min-h-24 flex flex-wrap gap-x-3 gap-y-2 items-start"
      style={{ backgroundColor: "#FFFBF5", border: "2px solid #FFE599" }}
    >
      {words.map((word, index) => (
        <span
          key={index}
          className="text-2xl font-bold transition-all duration-200 rounded-lg px-1"
          style={{
            color: index === currentWordIndex ? "#2D3561" : "#5a6080",
            backgroundColor:
              index === currentWordIndex ? "#FFE599" : "transparent",
            transform:
              index === currentWordIndex && isPlaying ? "scale(1.1)" : "scale(1)",
            display: "inline-block",
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}
