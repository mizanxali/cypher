# Cypher

A real-time freestyle rap assistant that listens to your bars, transcribes them live, and suggests rhyming words for your next line.

## How it works

1. Click **Start Freestyle** and grant microphone access
2. Start rapping — your words appear as a live transcript
3. As you speak, rhyme suggestions update in real-time based on your last word
4. Suggestions are grouped by syllable count (1-syl, 2-syl, 3-syl) so you can pick words that fit your meter

## Tools used

- **Next.js** (App Router) — frontend framework
- **Deepgram Nova-2** — streaming speech-to-text via WebSocket
- **CMU Pronouncing Dictionary** — phoneme-based rhyme lookup (~125k words)
- **Tailwind CSS** — styling

## Run locally

```bash
# Install dependencies
npm install

# Add your Deepgram API key
cp .env.local.example .env.local
# Edit .env.local and add your key from https://console.deepgram.com

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
