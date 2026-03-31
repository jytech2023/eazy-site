import { NextResponse } from "next/server";
import { webSearch } from "@/lib/web-search";

export async function POST(request: Request) {
  const { query } = await request.json();

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  if (!process.env.SERPER_API_KEY) {
    return NextResponse.json(
      { error: "Web search not configured" },
      { status: 500 }
    );
  }

  try {
    const results = await webSearch(query, 5);
    return NextResponse.json(results);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
