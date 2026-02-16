"use client";

interface TranscriptDisplayProps {
  lines: string[];
  interimText: string;
}

export default function TranscriptDisplay({ lines, interimText }: TranscriptDisplayProps) {
  // Show last 6 lines
  const visibleLines = lines.slice(-6);

  return (
    <div className="flex-1 flex flex-col justify-end px-6 py-4 min-h-[200px]">
      {visibleLines.length === 0 && !interimText && (
        <p className="text-zinc-600 text-center text-lg">
          Start freestyling and your bars will appear here...
        </p>
      )}
      {visibleLines.map((line, i) => (
        <p
          key={i}
          className={`text-lg leading-relaxed transition-opacity duration-300 ${
            i === visibleLines.length - 1 && !interimText
              ? "text-white"
              : "text-zinc-500"
          }`}
        >
          {line}
        </p>
      ))}
      {interimText && (
        <p className="text-lg leading-relaxed text-purple-400">
          {interimText}
        </p>
      )}
    </div>
  );
}
