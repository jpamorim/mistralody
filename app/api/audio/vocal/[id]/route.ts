import { NextResponse } from "next/server";
import { getVocalAudio } from "@/lib/audio/vocalCache";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const entry = getVocalAudio(id);
  if (!entry) {
    return new NextResponse("Not found", { status: 404 });
  }
  return new NextResponse(new Uint8Array(entry.buffer), {
    headers: {
      "Content-Type": entry.mimeType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
