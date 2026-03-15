"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { format, parseISO } from "date-fns";
import { getScoreColor } from "@/lib/colors";

interface Entry {
  date: string;
  score: number;
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: Entry;
}

function CustomDot({ cx, cy, payload }: CustomDotProps) {
  if (!cx || !cy || !payload) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={getScoreColor(payload.score)}
      stroke="#0F1117"
      strokeWidth={2}
    />
  );
}

interface TooltipPayloadItem {
  payload: Entry;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-[#1A1D2E] px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400">
        {format(parseISO(data.date), "MMM d, yyyy")}
      </p>
      <p
        className="text-lg font-bold"
        style={{ color: getScoreColor(data.score) }}
      >
        {data.score}/10
      </p>
    </div>
  );
}

export default function TrendChart({ entries }: { entries: Entry[] }) {
  const data = [...entries].reverse();

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-gray-500">
        No data yet. Start logging your vibes!
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818CF8" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#818CF8" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#2D3348" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#6B7280", fontSize: 11 }}
          tickFormatter={(val: string) => format(parseISO(val), "M/d")}
          axisLine={{ stroke: "#2D3348" }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 10]}
          ticks={[0, 2, 4, 6, 8, 10]}
          tick={{ fill: "#6B7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#818CF8"
          strokeWidth={2.5}
          fill="url(#scoreGradient)"
          dot={<CustomDot />}
          activeDot={{ r: 7, stroke: "#818CF8", strokeWidth: 2, fill: "#0F1117" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
