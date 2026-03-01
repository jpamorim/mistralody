import { NextResponse } from "next/server";
import { extractTimingContext } from "@/lib/lyrics/timingContext";
import { getSettings } from "@/lib/settings/serverSettingsStore";
import { DEFAULT_SINGING_VOICE_ID } from "@/lib/voice/defaultVoice";

type Payload = {
  code: string;
  prompt?: string;
  voiceId?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload;
    if (!payload.code) {
      return NextResponse.json(
        { error: "Code is required." },
        { status: 400 },
      );
    }

    const voiceId =
      payload.voiceId ??
      getSettings().elevenlabsVoiceId ??
      process.env.ELEVENLABS_VOICE_ID ??
      DEFAULT_SINGING_VOICE_ID;

    const timing = extractTimingContext(payload.code);
    const origin = new URL(request.url).origin;

    const lyricResponse = await fetch(`${origin}/api/lyrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: payload.prompt ?? "Create a short vocal line for this groove.",
        timing,
      }),
    });
    if (!lyricResponse.ok) {
      const text = await lyricResponse.text();
      return NextResponse.json(
        { error: `Lyric generation failed: ${text}` },
        { status: 502 },
      );
    }

    const lyricData = (await lyricResponse.json()) as { lyrics: string };
    const singingResponse = await fetch(`${origin}/api/singing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lyric: lyricData.lyrics,
        voiceId,
      }),
    });

    if (!singingResponse.ok) {
      const text = await singingResponse.text();
      return NextResponse.json(
        { error: `Singing synthesis failed: ${text}` },
        { status: 502 },
      );
    }

    const singingData = (await singingResponse.json()) as {
      audioBase64: string;
      mimeType: string;
    };

    return NextResponse.json({
      timing,
      lyric: lyricData.lyrics,
      ...singingData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not orchestrate voice sample generation.",
      },
      { status: 500 },
    );
  }
}

