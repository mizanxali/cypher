"use client";

import { RhymeResult } from "@/lib/rhyme-engine";

interface RhymeDisplayProps {
  targetWord: string;
  rhymes: RhymeResult[];
}

export default function RhymeDisplay({ targetWord, rhymes }: RhymeDisplayProps) {
  if (!targetWord) {
    return (
      <div className="px-6 py-4 border-t border-zinc-800">
        <p className="text-zinc-600 text-sm">Rhyme suggestions will appear here</p>
      </div>
    );
  }

  // Group by syllable count
  const grouped: Record<number, string[]> = {};
  for (const r of rhymes) {
    const key = r.syllables;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r.word);
  }

  const sortedKeys = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="px-6 py-4 border-t border-zinc-800">
      <p className="text-zinc-500 text-sm mb-3">
        Rhymes for: <span className="text-purple-400 font-bold uppercase">{targetWord}</span>
      </p>
      {sortedKeys.length === 0 ? (
        <p className="text-zinc-600 text-sm">No rhymes found</p>
      ) : (
        <div className="space-y-2">
          {sortedKeys.map((syllables) => (
            <div key={syllables} className="flex items-start gap-3">
              <span className="text-zinc-600 text-xs mt-1 w-12 shrink-0">
                {syllables}-syl
              </span>
              <div className="flex flex-wrap gap-2">
                {grouped[syllables].map((word) => (
                  <span
                    key={word}
                    className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-full text-sm text-zinc-200 hover:border-purple-500 hover:text-purple-300 transition-colors"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
