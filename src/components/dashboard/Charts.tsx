"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

const CHART_COLORS = [
  "oklch(0.52 0.18 220)",
  "oklch(0.62 0.16 160)",
  "oklch(0.72 0.15 80)",
  "oklch(0.65 0.18 300)",
  "oklch(0.6 0.2 30)",
  "oklch(0.58 0.17 260)",
];

interface AdmissionTrendProps {
  data: { date: string; admissions: number }[];
}

export function AdmissionTrendChart({ data }: AdmissionTrendProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: (() => {
      try {
        return format(parseISO(d.date), "MMM d");
      } catch {
        return d.date;
      }
    })(),
  }));

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Admission Trend</CardTitle>
        <p className="text-sm text-muted-foreground">Patient admissions over the last 30 days</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="admissionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.52 0.18 220)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.52 0.18 220)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 210)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "oklch(0.5 0.02 230)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "oklch(0.5 0.02 230)" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.15 0.015 255)",
                border: "1px solid oklch(1 0 0 / 10%)",
                borderRadius: "10px",
                color: "oklch(0.95 0.005 220)",
                fontSize: "13px",
              }}
            />
            <Area
              type="monotone"
              dataKey="admissions"
              stroke="oklch(0.52 0.18 220)"
              strokeWidth={2.5}
              fill="url(#admissionGrad)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface DoctorWorkloadProps {
  data: { name: string; specialization: string; patients: number }[];
}

export function DoctorWorkloadChart({ data }: DoctorWorkloadProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Doctor Workload</CardTitle>
        <p className="text-sm text-muted-foreground">Patients assigned per doctor</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 210)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "oklch(0.5 0.02 230)" }}
              tickLine={false}
              axisLine={false}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "oklch(0.5 0.02 230)" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.15 0.015 255)",
                border: "1px solid oklch(1 0 0 / 10%)",
                borderRadius: "10px",
                color: "oklch(0.95 0.005 220)",
                fontSize: "13px",
              }}
              cursor={{ fill: "oklch(0.52 0.18 220 / 0.08)" }}
            />
            <Bar
              dataKey="patients"
              fill="oklch(0.52 0.18 220)"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface ConditionPieProps {
  data: { name: string; value: number }[];
  title: string;
}

export function DonutChart({ data, title }: ConditionPieProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">Distribution breakdown</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "oklch(0.15 0.015 255)",
                border: "1px solid oklch(1 0 0 / 10%)",
                borderRadius: "10px",
                color: "oklch(0.95 0.005 220)",
                fontSize: "13px",
              }}
              formatter={(value: number) => [`${value} (${Math.round((value / total) * 100)}%)`, ""]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ fontSize: "12px", color: "oklch(0.5 0.02 230)" }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
