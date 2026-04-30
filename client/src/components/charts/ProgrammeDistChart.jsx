import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#8E44AD","#9B59B6","#A569BD","#BB8FCE","#1F4E79","#2E75B6","#27AE60","#E67E22","#E74C3C","#16A085"];

export default function ProgrammeDistChart({ data = [] }) {
  const formatted = data.map(d => ({ name: d.programme, value: d.count }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={formatted}
          cx="50%" cy="45%"
          outerRadius={95}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) =>
            percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
          }
        >
          {formatted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(val) => [`${val} alumni`, "Count"]} contentStyle={{ fontSize: 12 }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
