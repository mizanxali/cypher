import AudioControls from "@/components/AudioControls";
import HuddleWrapper from "@/components/HuddleWrapper";
import { CreateRoomResponse, Huddle01Response } from "@/types";
import { AccessToken, Role } from "@huddle01/server-sdk/auth";

export default async function Home() {
  const { accessToken, roomId }: Huddle01Response = await getHuddle01Data();

  return (
    <HuddleWrapper>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <h1 className="text-center font-semibold text-gray-400">cypher</h1>
        <AudioControls accessToken={accessToken} roomId={roomId} />
      </main>
    </HuddleWrapper>
  );
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
    cache: "no-store",
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
