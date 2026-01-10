import React, { useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { SeasonalThemeContext } from "@/contexts/SeasonalThemeContext";

const monthlyData = [
  { name: "Jan", hours: 20, courses: 2 },
  { name: "Feb", hours: 25, courses: 3 },
  { name: "Mar", hours: 30, courses: 2 },
  { name: "Apr", hours: 28, courses: 4 },
  { name: "May", hours: 35, courses: 3 },
  { name: "Jun", hours: 32, courses: 5 },
];

export function MonthlyProgress() {
  const { activeTheme } = useContext(SeasonalThemeContext);
  const isNewYear = activeTheme === "newYear";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className={`w-full ${isNewYear ? "dashboard-newyear-card" : ""}`}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Study Hours</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isNewYear ? "#e2e8f0" : "#e5e7eb"}
              />
              <XAxis
                dataKey="name"
                stroke={isNewYear ? "#64748b" : "#6b7280"}
              />
              <YAxis stroke={isNewYear ? "#64748b" : "#6b7280"} />
              <Tooltip
                contentStyle={
                  isNewYear
                    ? {
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid rgba(30, 41, 59, 0.2)",
                        borderRadius: "8px",
                      }
                    : {}
                }
              />
              <Bar
                dataKey="hours"
                fill={isNewYear ? "url(#newyearGradient)" : "#9b87f5"}
                radius={[4, 4, 0, 0]}
              />
              {isNewYear && (
                <defs>
                  <linearGradient
                    id="newyearGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="50%" stopColor="#87ceeb" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                </defs>
              )}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className={`w-full ${isNewYear ? "dashboard-newyear-card" : ""}`}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Completed Courses
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isNewYear ? "#e2e8f0" : "#e5e7eb"}
              />
              <XAxis
                dataKey="name"
                stroke={isNewYear ? "#64748b" : "#6b7280"}
              />
              <YAxis stroke={isNewYear ? "#64748b" : "#6b7280"} />
              <Tooltip
                contentStyle={
                  isNewYear
                    ? {
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid rgba(30, 41, 59, 0.2)",
                        borderRadius: "8px",
                      }
                    : {}
                }
              />
              <Line
                type="monotone"
                dataKey="courses"
                stroke={isNewYear ? "#1e293b" : "#7E69AB"}
                strokeWidth={2}
                dot={{
                  fill: isNewYear ? "#1e293b" : "#7E69AB",
                  strokeWidth: 2,
                  r: 4,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default MonthlyProgress;
