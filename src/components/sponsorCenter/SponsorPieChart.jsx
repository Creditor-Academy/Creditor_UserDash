import React from "react";
import { ResponsiveContainer, Pie, PieChart, Cell, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#2563eb", "#f97316", "#10b981", "#ec4899", "#6366f1"];

const SponsorPieChart = ({ data }) => {
  return (
    <Card className="rounded-xl border border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Ad Type Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SponsorPieChart;
