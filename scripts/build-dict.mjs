/**
 * Processes the CMU Pronouncing Dictionary into a compact JSON format
 * optimized for rhyme lookup.
 *
 * Output format:
 * {
 *   words: { [word]: phonemes[] },
 *   rhymeTails: { [tail]: word[] }  // pre-computed rhyme tail index
 * }
 */

import { readFileSync, writeFileSync } from "fs";

// Common English words to keep (filter out obscure entries)
// We'll use word length and format as a heuristic instead of a full frequency list
const raw = readFileSync("/tmp/cmudict.dict", "utf-8");

const words = {};
const rhymeTails = {};

for (const line of raw.split("\n")) {
  if (!line || line.startsWith(";;;")) continue;

  const parts = line.trim().split(/\s+/);
  let word = parts[0].toLowerCase();
  const phonemes = parts.slice(1);

  // Skip entries with special characters, numbers, or variant pronunciations like word(2)
  if (/[^a-z'-]/.test(word)) continue;
  if (word.startsWith("'")) continue;

  // Skip very short or very long words
  if (word.length < 2 || word.length > 15) continue;

  words[word] = phonemes;

  // Compute rhyme tail: from the last stressed vowel onward
  const tail = getRhymeTail(phonemes);
  if (tail) {
    const tailKey = tail.join(" ");
    if (!rhymeTails[tailKey]) rhymeTails[tailKey] = [];
    rhymeTails[tailKey].push(word);
  }
}

function getRhymeTail(phonemes) {
  // Find the last vowel with primary or secondary stress (ends with 1 or 2)
  // Vowels in CMU dict: AA, AE, AH, AO, AW, AY, EH, ER, EY, IH, IY, OW, OY, UH, UW
  let lastStressIdx = -1;
  for (let i = phonemes.length - 1; i >= 0; i--) {
    if (/[012]$/.test(phonemes[i])) {
      lastStressIdx = i;
      break;
    }
  }

  if (lastStressIdx === -1) {
    // No stressed vowel found, use last vowel
    for (let i = phonemes.length - 1; i >= 0; i--) {
      if (/^(AA|AE|AH|AO|AW|AY|EH|ER|EY|IH|IY|OW|OY|UH|UW)/.test(phonemes[i])) {
        lastStressIdx = i;
        break;
      }
    }
  }

  if (lastStressIdx === -1) return null;

  // Strip stress markers for matching
  return phonemes.slice(lastStressIdx).map((p) => p.replace(/[012]/g, ""));
}

// Stats
const wordCount = Object.keys(words).length;
const tailCount = Object.keys(rhymeTails).length;
console.log(`Processed ${wordCount} words, ${tailCount} unique rhyme tails`);

// Write output
const output = { words, rhymeTails };
const json = JSON.stringify(output);
writeFileSync("public/cmu-dict.json", json);
console.log(`Written to public/cmu-dict.json (${(json.length / 1024 / 1024).toFixed(1)}MB)`);
