"use client";

import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TrendChart from "@/components/TrendChart";
import { getScoreColor } from "@/lib/colors";

interface Entry {
  id: number;
  score: number;
  note: string | null;
  date: string;
  created_at: string;
}

interface Stats {
  streak: number;
  totalEntries: number;
  averageScore: number;
  todayEntry: Entry | null;
}

function getUserId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("vibecheck-user-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("vibecheck-user-id", id);
  }
  return id;
}

const scoreLabels: Record<number, string> = {
  1: "Awful",
  2: "Bad",
  3: "Rough",
  4: "Meh",
  5: "Okay",
  6: "Decent",
  7: "Good",
  8: "Great",
  9: "Amazing",
  10: "Perfect",
};

export default function Home() {
  const [userId, setUserId] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    const headers = { "x-user-id": userId };

    const [statsRes, entriesRes] = await Promise.all([
      fetch("/api/entries/stats", { headers }),
      fetch("/api/entries?limit=30", { headers }),
    ]);

    const statsData = await statsRes.json();
    const entriesData = await entriesRes.json();

    setStats(statsData);
    setEntries(entriesData);
    setLoaded(true);
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    if (!selectedScore || !userId) return;
    setSubmitting(true);

    const today = format(new Date(), "yyyy-MM-dd");
    await fetch("/api/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify({
        score: selectedScore,
        note: note.trim() || null,
        date: today,
      }),
    });

    setSelectedScore(null);
    setNote("");
    setSubmitting(false);
    fetchData();
  };

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
      </div>
    );
  }

  const todayEntry = stats?.todayEntry;

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Vibe<span className="text-indigo-400">Check</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">How are you feeling today?</p>
      </div>

      {/* Section 1: Today's Vibe */}
      <Card className="mb-6 border-0 bg-[#1A1D2E] ring-white/5">
        <CardHeader>
          <CardTitle className="text-white">Today&apos;s Vibe</CardTitle>
        </CardHeader>
        <CardContent>
          {todayEntry ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white shadow-lg"
                style={{
                  backgroundColor: getScoreColor(todayEntry.score),
                  boxShadow: `0 0 30px ${getScoreColor(todayEntry.score)}40`,
                }}
              >
                {todayEntry.score}
              </div>
              <p className="text-lg font-medium text-gray-300">
                {scoreLabels[todayEntry.score]}
              </p>
              {todayEntry.note && (
                <p className="text-sm text-gray-500 italic">
                  &ldquo;{todayEntry.note}&rdquo;
                </p>
              )}
              <p className="mt-2 text-xs text-gray-600">
                Come back tomorrow!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Score Buttons */}
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
                  const isSelected = selectedScore === score;
                  return (
                    <button
                      key={score}
                      onClick={() => setSelectedScore(score)}
                      className="group relative flex h-12 w-full items-center justify-center rounded-full text-lg font-bold transition-all duration-200 hover:scale-110 active:scale-95 sm:h-14"
                      style={{
                        backgroundColor: isSelected
                          ? getScoreColor(score)
                          : `${getScoreColor(score)}20`,
                        color: isSelected ? "white" : getScoreColor(score),
                        boxShadow: isSelected
                          ? `0 0 20px ${getScoreColor(score)}50`
                          : "none",
                      }}
                    >
                      {score}
                    </button>
                  );
                })}
              </div>

              {selectedScore && (
                <p className="text-center text-sm font-medium" style={{ color: getScoreColor(selectedScore) }}>
                  {scoreLabels[selectedScore]}
                </p>
              )}

              {/* Note */}
              {selectedScore && (
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note (optional)..."
                  className="w-full resize-none rounded-lg border border-white/10 bg-[#0F1117] px-3 py-2 text-sm text-gray-300 placeholder-gray-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  rows={2}
                />
              )}

              {/* Submit */}
              {selectedScore && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Log Vibe"}
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="border-0 bg-[#1A1D2E] ring-white/5">
          <CardContent className="pt-0">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-400">
                {stats?.streak ?? 0}
              </p>
              <p className="text-xs text-gray-500">Day Streak</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-[#1A1D2E] ring-white/5">
          <CardContent className="pt-0">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">
                {stats?.totalEntries ?? 0}
              </p>
              <p className="text-xs text-gray-500">Total Entries</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-[#1A1D2E] ring-white/5">
          <CardContent className="pt-0">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">
                {stats?.averageScore?.toFixed(1) ?? "0.0"}
              </p>
              <p className="text-xs text-gray-500">Avg Score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Trend Chart */}
      <Card className="mb-6 border-0 bg-[#1A1D2E] ring-white/5">
        <CardHeader>
          <CardTitle className="text-white">30-Day Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart entries={entries} />
        </CardContent>
      </Card>

      {/* Section 4: History */}
      <Card className="border-0 bg-[#1A1D2E] ring-white/5">
        <CardHeader>
          <CardTitle className="text-white">Recent History</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-600">
              No entries yet. Log your first vibe above!
            </p>
          ) : (
            <div className="space-y-2">
              {entries.slice(0, 14).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 rounded-lg bg-[#0F1117]/60 px-3 py-2.5"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: getScoreColor(entry.score) }}
                  >
                    {entry.score}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-300">
                      {format(parseISO(entry.date), "EEEE, MMM d")}
                    </p>
                    {entry.note && (
                      <p className="truncate text-xs text-gray-600">
                        {entry.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mt-8 pb-4 text-center text-xs text-gray-700">
        VibeCheck -- your daily mood, visualized.
      </p>
    </div>
  );
}
