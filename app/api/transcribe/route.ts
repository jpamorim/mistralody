import { NextResponse } from "next/server";
import { getMistralClient } from "@/lib/ai/mistralClient";
import { MAX_RECORDING_BYTES } from "@/lib/audio/recording";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File)) {
      return NextResponse.json(
        { error: "Audio file is required." },
        { status: 400 },
      );
    }

    if (audio.size > MAX_RECORDING_BYTES) {
      return NextResponse.json(
        { error: "Audio file exceeds 10 MB limit." },
        { status: 413 },
      );
    }

    const client = getMistralClient();
    const result = await client.audio.transcriptions.complete({
      model: "voxtral-mini-latest",
      file: audio,
    });

    return NextResponse.json({
      text: result.text ?? "",
      usage: result.usage ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not transcribe audio.",
      },
      { status: 500 },
    );
  }
}

