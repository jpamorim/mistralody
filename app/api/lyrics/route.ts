import { NextResponse } from "next/server";
import { getMistralClient } from "@/lib/ai/mistralClient";
import type { LyricTimingContext } from "@/lib/lyrics/timingContext";

type Payload = {
  prompt?: string;
  timing: LyricTimingContext;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload;
    if (!payload.timing) {
      return NextResponse.json(
        { error: "LyricTimingContext is required." },
        { status: 400 },
      );
    }

    const client = getMistralClient();
    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content:
            "Generate concise singable lyrics for electronic music. Output plain text only, no markdown.",
        },
        {
          role: "user",
          content: [
            `Prompt: ${payload.prompt ?? "Create a short atmospheric lyric phrase."}`,
            `BPM: ${payload.timing.bpm}`,
            `CPS: ${payload.timing.cps}`,
            `Bars: ${payload.timing.barCount}`,
            `Target duration seconds: ${payload.timing.targetDurationSeconds}`,
            `Target syllables: ${payload.timing.targetSyllables ?? "N/A"}`,
          ].join("\n"),
        },
      ],
      temperature: 0.7,
    });

    const rawContent = response.choices?.[0]?.message?.content;
    const lyrics =
      typeof rawContent === "string"
        ? rawContent.trim()
        : rawContent
            ?.map((chunk) => ("text" in chunk ? chunk.text : ""))
            .join("")
            .trim();
    if (!lyrics) {
      return NextResponse.json({ error: "No lyrics generated." }, { status: 502 });
    }

    return NextResponse.json({ lyrics });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not generate lyrics.",
      },
      { status: 500 },
    );
  }
}

