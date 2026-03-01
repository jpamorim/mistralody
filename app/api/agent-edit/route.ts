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
          content: `You are a Strudel code editor assistant. Return JSON only with keys: intent, explanation, codePatch, params (optional).
- intent: "edit_code" for normal Strudel edits, "add_voice_sample" when the user wants ElevenLabs singing/vocals (e.g. "add vocal", "sing let it go", "voice sample", "add singing", lyrics requests).
- When intent is "add_voice_sample": set params.lyricPrompt to the user's lyric idea if they mentioned one (e.g. "let it go" -> "let it go"); otherwise omit params or leave lyricPrompt empty.
- codePatch: complete valid Strudel code. Only use samples from the preloaded dirt-samples pack (bd, sd, hh, cp, etc.). NEVER invent sample names like s("letitgo"), s("vocal"), s("lyrics")—if the user wants singing, use intent "add_voice_sample" instead.
- When intent is "add_voice_sample", codePatch is ignored; the app will run the ElevenLabs singing flow.`,
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

    const rawJson = content.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawJson);
    } catch {
      return NextResponse.json(
        { error: "Agent returned invalid JSON." },
        { status: 502 },
      );
    }

    const obj =
      typeof parsedJson === "object" && parsedJson !== null
        ? (parsedJson as Record<string, unknown>)
        : {};
    const normalized = {
      intent:
        obj.intent ?? obj.Intent ?? "edit_code",
      params: obj.params ?? obj.Params,
      codePatch: obj.codePatch ?? obj.code,
      explanation: obj.explanation ?? obj.message,
    };

    const parsed = agentIntentSchema.safeParse(normalized);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      return NextResponse.json(
        { error: `Invalid model response shape: ${issues}` },
        { status: 502 },
      );
    }

    return NextResponse.json({
      message: parsed.data.explanation ?? "Applied requested change.",
      code: parsed.data.codePatch ?? payload.code,
      intent: parsed.data.intent,
      params: parsed.data.params,
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

