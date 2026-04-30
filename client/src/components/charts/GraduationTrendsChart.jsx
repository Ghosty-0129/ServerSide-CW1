import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

export default function GraduationTrendsChart({ data = [] }) {
  const formatted = data.map(d => ({ year: String(d.year), graduates: d.count }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={formatted} margin={{ left: 0, right: 20 }}>
        <defs>
          <linearGradient id="gradGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#1F4E79" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#1F4E79" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(val) => [`${val} graduates`, "Graduates"]}
          contentStyle={{ fontSize: 12 }}
        />
        <Area
          type="monotone"
          dataKey="graduates"
          stroke="#1F4E79"
          strokeWidth={2.5}
          fill="url(#gradGradient)"
          dot={{ fill: "#1F4E79", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
