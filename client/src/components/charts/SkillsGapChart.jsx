import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#1F4E79","#2E75B6","#4A90D9","#27AE60","#8E44AD","#E67E22","#E74C3C","#16A085","#F39C12","#2C3E50"];

export default function SkillsGapChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="skill" tick={{ fontSize: 10 }} width={140} />
        <Tooltip
          formatter={(val) => [`${val} alumni`, "Count"]}
          contentStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="count" radius={[0,4,4,0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
