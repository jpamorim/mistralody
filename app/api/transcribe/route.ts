import { NextResponse } from "next/server";
import { getMistralClient } from "@/lib/ai/mistralClient";
import { MAX_RECORDING_BYTES } from "@/lib/audio/recording";

const DEBUG = true;
const log = (...args: unknown[]) =>
  DEBUG && console.log("[transcribe API]", ...args);

export async function POST(request: Request) {
  log("POST received");
  try {
    const formData = await request.formData();
    const audio = formData.get("audio");

    log("FormData keys:", [...formData.keys()]);
    log("Audio field:", audio instanceof File ? `File ${audio.size} bytes, type ${audio.type}` : audio);

    if (!(audio instanceof File)) {
      log("ERROR: audio is not a File, got:", typeof audio);
      return NextResponse.json(
        { error: "Audio file is required." },
        { status: 400 },
      );
    }

    if (audio.size > MAX_RECORDING_BYTES) {
      log("ERROR: file too large:", audio.size);
      return NextResponse.json(
        { error: "Audio file exceeds 10 MB limit." },
        { status: 413 },
      );
    }

    log("Calling Mistral API, model: voxtral-mini-2602 (batch), language: en");
    const client = getMistralClient();
    const result = await client.audio.transcriptions.complete({
      model: "voxtral-mini-2602",
      file: audio,
      language: "en",
    });

    const text = (result.text ?? "").trim();
    log("Mistral full response:", {
      textLength: text.length,
      textPreview: text.slice(0, 80),
      usage: result.usage,
      segmentsCount: (result as { segments?: unknown[] }).segments?.length ?? 0,
    });
    return NextResponse.json({
      text,
      usage: result.usage ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not transcribe audio.";
    console.error("[transcribe API] ERROR:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

