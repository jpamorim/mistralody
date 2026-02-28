import { NextResponse } from "next/server";
import { elevenLabsFetch } from "@/lib/ai/elevenLabsClient";

type Payload = {
  lyric: string;
  voiceId: string;
  speed?: number;
  outputFormat?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload;
    if (!payload.lyric?.trim() || !payload.voiceId?.trim()) {
      return NextResponse.json(
        { error: "Both lyric and voiceId are required." },
        { status: 400 },
      );
    }

    const outputFormat = payload.outputFormat ?? "mp3_44100_128";
    const response = await elevenLabsFetch(
      `/text-to-speech/${payload.voiceId}?output_format=${encodeURIComponent(
        outputFormat,
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: payload.lyric,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            speed: payload.speed ?? 1,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `ElevenLabs synthesis failed: ${errorText}` },
        { status: 502 },
      );
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return NextResponse.json({
      audioBase64: base64,
      mimeType: outputFormat.startsWith("wav") ? "audio/wav" : "audio/mpeg",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not synthesize voice.",
      },
      { status: 500 },
    );
  }
}

