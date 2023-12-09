"use client";

import { useLocalAudio, useRoom } from "@huddle01/react/hooks";
import { Visualizer } from "react-sound-visualizer";

interface Props {
  roomId: string;
  accessToken: string;
}

function AudioControls({ roomId, accessToken }: Props) {
  console.log({ roomId, accessToken });

  const { joinRoom, state } = useRoom();
  const {
    enableAudio,
    disableAudio,
    isAudioOn,
    stream: audioStream,
  } = useLocalAudio();

  return (
    <div>
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
