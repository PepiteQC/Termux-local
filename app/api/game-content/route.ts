import { NextResponse } from "next/server";
import { loadGameContent } from "../../../lib/server/gameContent";

export async function GET() {
  try {
    const content = await loadGameContent();
    return NextResponse.json(content, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load game content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
