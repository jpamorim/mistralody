import { NextResponse } from "next/server";
import { getMistralClient } from "@/lib/ai/mistralClient";
import { agentIntentSchema } from "@/lib/commands/commandSchema";

type Payload = {
  instruction: string;
  code: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload;
    if (!payload.instruction?.trim()) {
      return NextResponse.json(
        { error: "Instruction is required." },
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
            "You are a Strudel code editor assistant. Return JSON only with keys: intent, explanation, codePatch. codePatch must be complete valid Strudel code. Respect bounded and safe edits.",
        },
        {
          role: "user",
          content: JSON.stringify({
            instruction: payload.instruction,
            currentCode: payload.code,
          }),
        },
      ],
      responseFormat: { type: "json_object" },
      temperature: 0.2,
    });

    const rawContent = response.choices?.[0]?.message?.content;
    const content =
      typeof rawContent === "string"
        ? rawContent
        : rawContent?.map((chunk) => ("text" in chunk ? chunk.text : "")).join("");

    if (!content) {
      return NextResponse.json(
        { error: "Empty model response." },
        { status: 502 },
      );
    }

    const parsed = agentIntentSchema.safeParse(JSON.parse(content));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid model response shape." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      message: parsed.data.explanation ?? "Applied requested change.",
      code: parsed.data.codePatch ?? payload.code,
      intent: parsed.data.intent,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not process instruction.",
      },
      { status: 500 },
    );
  }
}

