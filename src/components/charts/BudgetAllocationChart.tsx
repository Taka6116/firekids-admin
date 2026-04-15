"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ChannelBarRow = {
  name: string;
  現在: number;
  推奨: number;
};

export function BudgetAllocationChart({ data }: { data: ChannelBarRow[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#525252", fontSize: 11 }} />
          <YAxis
            tick={{ fill: "#525252", fontSize: 11 }}
            unit="%"
            domain={[0, "auto"]}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: 6,
              fontSize: 12,
              color: "#171717",
            }}
            labelStyle={{ color: "#171717" }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#525252" }} />
          <Bar dataKey="現在" fill="#64748b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="推奨" fill="#8B0000" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
