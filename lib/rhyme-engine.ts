export interface RhymeResult {
  word: string;
  syllables: number;
}

interface CmuDict {
  words: Record<string, string[]>;
  rhymeTails: Record<string, string[]>;
}

let dictCache: CmuDict | null = null;

export async function loadDictionary(): Promise<CmuDict> {
  if (dictCache) return dictCache;
  const res = await fetch("/cmu-dict.json");
  dictCache = await res.json();
  return dictCache!;
}

function countSyllables(phonemes: string[]): number {
  // Vowels have stress markers (0, 1, 2)
  return phonemes.filter((p) => /[012]$/.test(p)).length;
}

function getRhymeTail(phonemes: string[]): string | null {
  let lastStressIdx = -1;
  for (let i = phonemes.length - 1; i >= 0; i--) {
    if (/[012]$/.test(phonemes[i])) {
      lastStressIdx = i;
      break;
    }
  }

  if (lastStressIdx === -1) {
    for (let i = phonemes.length - 1; i >= 0; i--) {
      if (/^(AA|AE|AH|AO|AW|AY|EH|ER|EY|IH|IY|OW|OY|UH|UW)/.test(phonemes[i])) {
        lastStressIdx = i;
        break;
      }
    }
  }

  if (lastStressIdx === -1) return null;

  return phonemes
    .slice(lastStressIdx)
    .map((p) => p.replace(/[012]/g, ""))
    .join(" ");
}

export async function findRhymes(
  word: string,
  maxResults: number = 12
): Promise<RhymeResult[]> {
  const dict = await loadDictionary();
  const normalized = word.toLowerCase().replace(/[^a-z'-]/g, "");

  const phonemes = dict.words[normalized];
  if (!phonemes) return [];

  const tail = getRhymeTail(phonemes);
  if (!tail) return [];

  const candidates = dict.rhymeTails[tail] || [];

  const results: RhymeResult[] = [];
  for (const candidate of candidates) {
    if (candidate === normalized) continue;
    const cPhonemes = dict.words[candidate];
    if (!cPhonemes) continue;

    results.push({
      word: candidate,
      syllables: countSyllables(cPhonemes),
    });
  }

  // Sort by syllable count, then alphabetically
  results.sort((a, b) => a.syllables - b.syllables || a.word.localeCompare(b.word));

  return results.slice(0, maxResults);
}
