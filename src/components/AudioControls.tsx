"use client";

import { useLocalAudio, useRoom } from "@huddle01/react/hooks";
import { useEffect, useRef, useState } from "react";
import { Visualizer } from "react-sound-visualizer";

interface Props {
  roomId: string;
  accessToken: string;
}

function AudioControls({ roomId, accessToken }: Props) {
  const [captions, setCaptions] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  const { joinRoom, state } = useRoom();
  const {
    enableAudio,
    disableAudio,
    isAudioOn,
    stream: audioStream,
  } = useLocalAudio();

  useEffect(() => {
    if (!audioStream) return;

    wsRef.current = new WebSocket(`
    wss://api.rev.ai/speechtotext/v1/stream?access_token=${process.env.NEXT_PUBLIC_REVAI_ACCESS_TOKEN}&content_type=audio/webm;layout=interleaved;rate=16000;format=S16LE;channels=1&skip_postprocessing=true&priority=speed`);

    const mediaRecorder = new MediaRecorder(audioStream, {
      mimeType: "audio/webm",
    });

    wsRef.current.onopen = () => {
      console.log("Socket connection opened");

      mediaRecorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          const buffer = await e.data.arrayBuffer();
          wsRef.current?.send(buffer);
        }
      };
    };

    wsRef.current.onmessage = (event) => {
      console.log("Socket message received!", event.data);

      const data = JSON.parse(event.data);
      console.log({ type: data.type, elements: data.elements });

      if (data.type === "partial") {
        let text = "";
        data.elements.forEach((textObj: any) => {
          text = text + " " + textObj.value;
        });
        setCaptions(text);
      }
    };

    mediaRecorder.start();

    setInterval(() => {
      if (mediaRecorder?.state === "recording") {
        mediaRecorder.requestData();
      }
    }, 1000);
  }, [audioStream]);

  return (
    <div>
      <div className="text-white text-2xl text-center">{captions}</div>

      {isAudioOn && (
        <Visualizer audio={audioStream} strokeColor="#fff" autoStart>
          {({ canvasRef }) => (
            <canvas ref={canvasRef} width={500} height={100} />
          )}
        </Visualizer>
      )}

      {state === "idle" && (
        <button
          type="button"
          className="bg-blue-500 p-2 mx-2"
          onClick={async () => {
            await joinRoom({
              roomId,
              token: accessToken,
            });
          }}
        >
          Join Room
        </button>
      )}

      {state === "connected" && (
        <>
          <button
            className="bg-blue-500 p-2 mx-2"
            onClick={async () => {
              await enableAudio();
            }}
          >
            Enable Audio
          </button>
          <button
            className="bg-blue-500 p-2 mx-2"
            onClick={async () => {
              await disableAudio();
            }}
          >
            Disable Audio
          </button>
        </>
      )}
    </div>
  );
}

export default AudioControls;
