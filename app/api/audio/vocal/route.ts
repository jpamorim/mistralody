import { NextResponse } from "next/server";
import { storeVocalAudio } from "@/lib/audio/vocalCache";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      audioBase64?: string;
      mimeType?: string;
    };
    if (!body.audioBase64 || !body.mimeType) {
      return NextResponse.json(
        { error: "audioBase64 and mimeType are required." },
        { status: 400 },
      );
    }
    const id = storeVocalAudio(body.audioBase64, body.mimeType);
    const origin = new URL(request.url).origin;
    return NextResponse.json({
      id,
      url: `${origin}/api/audio/vocal/${id}`,
      baseUrl: `${origin}/api/audio/vocal/`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not store vocal audio.",
      },
      { status: 500 },
    );
  }
}
