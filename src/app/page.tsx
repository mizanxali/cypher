import AudioControls from "@/components/AudioControls";
import HuddleWrapper from "@/components/HuddleWrapper";
import REVAIListener from "@/components/REVAIListener";
import { CreateRoomResponse, Huddle01Response, REVAIResponse } from "@/types";
import { AccessToken, Role } from "@huddle01/server-sdk/auth";

export default async function Home() {
  const { ingestion_url, read_url, stream_name }: REVAIResponse =
    await getREVAIData();

  const { accessToken, roomId }: Huddle01Response = await getHuddle01Data();

  return (
    <HuddleWrapper>
      <REVAIListener readURL={read_url} />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <h1 className="text-center font-semibold text-gray-400">cypher</h1>
        <AudioControls accessToken={accessToken} roomId={roomId} />
      </main>
    </HuddleWrapper>
  );
}

async function getREVAIData() {
  const res = await fetch(
    `https://api.rev.ai/speechtotext/v1/live_stream/rtmp`,
    {
      method: "POST",
      headers: new Headers({
        Authorization: `Bearer ${process.env.REVAI_ACCESS_TOKEN}`,
      }),
    }
  );
  const data: REVAIResponse = await res.json();
  return data;
}

async function getHuddle01Data() {
  const res = await fetch(`https://api.huddle01.com/api/v1/create-room`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-api-key": process.env.HUDDLE01_API_KEY!,
    }),
    body: JSON.stringify({
      title: "Cypher Room",
      hostWallets: [],
    }),
  });

  const { data }: CreateRoomResponse = await res.json();

  const accessToken = new AccessToken({
    apiKey: process.env.HUDDLE01_API_KEY!,
    roomId: data.roomId,
    role: Role.HOST,
    permissions: {
      admin: true,
    },
  });

  const token = await accessToken.toJwt();

  return {
    accessToken: token,
    roomId: data.roomId,
  };
}
