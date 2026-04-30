import React from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function ProfDevRadarChart({ data = null }) {
  if (!data) return null;

  const formatted = [
    { subject: "Certifications",    value: data.certifications     || 0 },
    { subject: "Degrees",           value: data.degrees            || 0 },
    { subject: "Licences",          value: data.licences           || 0 },
    { subject: "Short Courses",     value: data.courses            || 0 },
    { subject: "Employment Records",value: data.employment_records || 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={formatted} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis tick={{ fontSize: 10 }} />
        <Radar
          name="Alumni Activity"
          dataKey="value"
          stroke="#8E44AD"
          fill="#8E44AD"
          fillOpacity={0.35}
          strokeWidth={2}
        />
        <Tooltip formatter={(val) => [`${val} records`, "Count"]} contentStyle={{ fontSize: 12 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
