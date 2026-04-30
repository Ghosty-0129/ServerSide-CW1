import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#1F4E79","#2E75B6","#27AE60","#E67E22","#8E44AD","#E74C3C","#16A085","#F39C12","#4A90D9","#2C3E50"];

export default function IndustryChart({ data = [] }) {
  const formatted = data.map(d => ({ name: d.industry, value: d.count }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={formatted}
          cx="50%" cy="45%"
          innerRadius={55}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
          labelLine={false}
        >
          {formatted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(val) => [`${val} alumni`, "Count"]} contentStyle={{ fontSize: 12 }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
