import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { format, subDays, parseISO } from "date-fns";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  const db = getDb();
  const today = format(new Date(), "yyyy-MM-dd");

  // Today's entry
  const todayEntry = db
    .prepare(
      "SELECT id, score, note, date, created_at FROM entries WHERE user_id = ? AND date = ?"
    )
    .get(userId, today) as { id: number; score: number; note: string | null; date: string; created_at: string } | undefined;

  // Total entries
  const totalResult = db
    .prepare("SELECT COUNT(*) as count FROM entries WHERE user_id = ?")
    .get(userId) as { count: number };
  const totalEntries = totalResult.count;

  // Average score
  const avgResult = db
    .prepare("SELECT AVG(score) as avg FROM entries WHERE user_id = ?")
    .get(userId) as { avg: number | null };
  const averageScore = avgResult.avg ? Math.round(avgResult.avg * 10) / 10 : 0;

  // Streak calculation
  let streak = 0;
  const dates = db
    .prepare(
      "SELECT date FROM entries WHERE user_id = ? ORDER BY date DESC"
    )
    .all(userId) as { date: string }[];

  if (dates.length > 0) {
    let checkDate = today;
    // If today isn't logged, start from yesterday
    if (dates[0].date !== today) {
      checkDate = format(subDays(new Date(), 1), "yyyy-MM-dd");
    }

    for (const row of dates) {
      if (row.date === checkDate) {
        streak++;
        checkDate = format(
          subDays(parseISO(checkDate), 1),
          "yyyy-MM-dd"
        );
      } else {
        break;
      }
    }
  }

  return NextResponse.json({
    streak,
    totalEntries,
    averageScore,
    todayEntry: todayEntry ?? null,
  });
}
