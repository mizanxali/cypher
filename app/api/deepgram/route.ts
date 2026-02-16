import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPGRAM_API_KEY not configured" },
      { status: 500 }
    );
  }

  // Return the API key for the client to use directly with Deepgram WebSocket.
  // In production, use Deepgram's temporary token API instead.
  return NextResponse.json({ key: apiKey });
}
