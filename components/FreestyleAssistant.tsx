"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { findRhymes, loadDictionary, RhymeResult } from "@/lib/rhyme-engine";
import TranscriptDisplay from "./TranscriptDisplay";
import RhymeDisplay from "./RhymeDisplay";

export default function FreestyleAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [interimText, setInterimText] = useState("");
  const [targetWord, setTargetWord] = useState("");
  const [rhymes, setRhymes] = useState<RhymeResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dictLoaded, setDictLoaded] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Pre-load dictionary on mount
  useEffect(() => {
    loadDictionary().then(() => setDictLoaded(true));
  }, []);

  // Update rhymes when target word changes
  useEffect(() => {
    if (!targetWord) {
      setRhymes([]);
      return;
    }
    findRhymes(targetWord, 12).then(setRhymes);
  }, [targetWord]);

  const extractLastWord = useCallback((text: string): string => {
    const words = text.trim().split(/\s+/);
    const lastWord = words[words.length - 1];
    return lastWord?.replace(/[^a-zA-Z'-]/g, "").toLowerCase() || "";
  }, []);

  const stopListening = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (mediaRecorderRef.current) {
      const recorder = mediaRecorderRef.current as unknown as {
        audioContext: AudioContext;
        processor: ScriptProcessorNode;
        source: MediaStreamAudioSourceNode;
      };
      recorder.processor.disconnect();
      recorder.source.disconnect();
      recorder.audioContext.close();
      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    setError(null);

    // Get Deepgram API key from server
    let apiKey: string;
    try {
      const res = await fetch("/api/deepgram");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      apiKey = data.key;
    } catch (e) {
      setError(`Failed to get Deepgram key: ${e instanceof Error ? e.message : e}`);
      return;
    }

    // Get microphone access
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch {
      setError("Microphone access denied");
      return;
    }

    // Connect to Deepgram WebSocket
    const ws = new WebSocket(
      `wss://api.deepgram.com/v1/listen?model=nova-2&punctuate=true&interim_results=true&endpointing=300&encoding=linear16&sample_rate=16000`,
      ["token", apiKey]
    );

    socketRef.current = ws;

    ws.onopen = () => {
      setIsListening(true);

      const audioContext = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        ws.send(pcm16.buffer);
      };

      mediaRecorderRef.current = { audioContext, processor, source } as unknown as MediaRecorder;
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.channel?.alternatives?.[0]) return;

      const transcript = data.channel.alternatives[0].transcript;
      if (!transcript) return;

      const isFinal = data.is_final;

      if (isFinal) {
        setLines((prev) => [...prev, transcript]);
        setInterimText("");
        const lastWord = extractLastWord(transcript);
        if (lastWord) setTargetWord(lastWord);
      } else {
        setInterimText(transcript);
        // Update rhymes even on interim for faster feedback
        const lastWord = extractLastWord(transcript);
        if (lastWord) setTargetWord(lastWord);
      }
    };

    ws.onerror = () => {
      setError("WebSocket connection error");
      stopListening();
    };

    ws.onclose = () => {
      setIsListening(false);
    };
  }, [extractLastWord, stopListening]);

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Header */}
      <header className="px-6 py-5 border-b border-zinc-800">
        <h1 className="text-2xl font-bold tracking-widest text-center">
          <span className="text-purple-400">CYPHER</span>
        </h1>
        <p className="text-zinc-600 text-xs text-center mt-1">
          real-time freestyle assistant
        </p>
      </header>

      {/* Transcript */}
      <TranscriptDisplay lines={lines} interimText={interimText} />

      {/* Rhymes */}
      <RhymeDisplay targetWord={targetWord} rhymes={rhymes} />

      {/* Controls */}
      <div className="px-6 py-6 border-t border-zinc-800 flex flex-col items-center gap-3">
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={!dictLoaded}
          className={`px-8 py-3 rounded-full text-sm font-bold tracking-wider transition-all ${
            isListening
              ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
              : dictLoaded
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          }`}
        >
          {!dictLoaded
            ? "Loading dictionary..."
            : isListening
            ? "STOP"
            : "START FREESTYLE"}
        </button>
        {isListening && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-zinc-500 text-xs">Listening...</span>
          </div>
        )}
      </div>
    </div>
  );
}
