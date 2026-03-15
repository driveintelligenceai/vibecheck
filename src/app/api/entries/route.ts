import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  const limit = Number(request.nextUrl.searchParams.get("limit") ?? 30);
  const db = getDb();

  const entries = db
    .prepare(
      "SELECT id, score, note, date, created_at FROM entries WHERE user_id = ? ORDER BY date DESC LIMIT ?"
    )
    .all(userId, limit);

  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  const body = await request.json();
  const { score, note, date } = body as {
    score: number;
    note?: string;
    date: string;
  };

  if (!score || score < 1 || score > 10) {
    return NextResponse.json({ error: "Score must be 1-10" }, { status: 400 });
  }

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  const db = getDb();

  const stmt = db.prepare(`
    INSERT INTO entries (user_id, score, note, date)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET
      score = excluded.score,
      note = excluded.note,
      created_at = datetime('now')
  `);

  stmt.run(userId, score, note ?? null, date);

  const entry = db
    .prepare(
      "SELECT id, score, note, date, created_at FROM entries WHERE user_id = ? AND date = ?"
    )
    .get(userId, date);

  return NextResponse.json(entry, { status: 201 });
}
