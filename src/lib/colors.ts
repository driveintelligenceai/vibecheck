export function getScoreColor(score: number): string {
  const colors: Record<number, string> = {
    1: "#EF4444",
    2: "#F87171",
    3: "#FB923C",
    4: "#FBBF24",
    5: "#F59E0B",
    6: "#38BDF8",
    7: "#60A5FA",
    8: "#34D399",
    9: "#4ADE80",
    10: "#818CF8",
  };
  return colors[score] ?? "#6B7280";
}

export function getScoreBg(score: number): string {
  const bgs: Record<number, string> = {
    1: "bg-red-500",
    2: "bg-red-400",
    3: "bg-orange-400",
    4: "bg-amber-400",
    5: "bg-amber-500",
    6: "bg-sky-400",
    7: "bg-blue-400",
    8: "bg-emerald-400",
    9: "bg-green-400",
    10: "bg-indigo-400",
  };
  return bgs[score] ?? "bg-gray-500";
}
