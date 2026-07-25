"use client";

import {
  Users,
  Stethoscope,
  Activity,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Database,
  RefreshCw,
} from "lucide-react";
import { useGetDashboardStatsQuery, useSeedDatabaseMutation } from "@/store/services/apiService";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  AdmissionTrendChart,
  DoctorWorkloadChart,
  DonutChart,
} from "@/components/dashboard/Charts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { data, isLoading, refetch } = useGetDashboardStatsQuery();
  const [seed, { isLoading: isSeeding }] = useSeedDatabaseMutation();

  const stats = data?.stats;
  const charts = data?.charts;

  const handleSeed = async () => {
    await seed();
    refetch();
  };

  const statCards = [
    {
      title: "Total Doctors",
      value: stats?.totalDoctors ?? 0,
      subtitle: "Registered practitioners",
      icon: Stethoscope,
      gradient: "linear-gradient(135deg, oklch(0.52 0.18 220), oklch(0.45 0.18 230))",
      trend: { value: 12, positive: true },
    },
    {
      title: "Total Patients",
      value: stats?.totalPatients ?? 0,
      subtitle: "All registered patients",
      icon: Users,
      gradient: "linear-gradient(135deg, oklch(0.62 0.16 160), oklch(0.55 0.16 170))",
      trend: { value: 8, positive: true },
    },
    {
      title: "Active Admissions",
      value: stats?.activePatients ?? 0,
      subtitle: "Currently admitted",
      icon: Activity,
      gradient: "linear-gradient(135deg, oklch(0.72 0.15 80), oklch(0.65 0.15 90))",
    },
    {
      title: "Critical Cases",
      value: stats?.criticalPatients ?? 0,
      subtitle: "Needs immediate attention",
      icon: AlertTriangle,
      gradient: "linear-gradient(135deg, oklch(0.6 0.2 30), oklch(0.55 0.22 25))",
    },
    {
      title: "Discharged",
      value: stats?.dischargedPatients ?? 0,
      subtitle: "Successfully treated",
      icon: UserCheck,
      gradient: "linear-gradient(135deg, oklch(0.65 0.18 300), oklch(0.58 0.18 310))",
    },
    {
      title: "Avg Patients/Doctor",
      value: stats?.avgPatientsPerDoctor ?? 0,
      subtitle: "Workload distribution",
      icon: TrendingUp,
      gradient: "linear-gradient(135deg, oklch(0.58 0.17 260), oklch(0.52 0.17 270))",
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time healthcare administration insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            id="refresh-dashboard-btn"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            id="seed-database-btn"
            onClick={handleSeed}
            disabled={isSeeding}
            className="gap-2"
          >
            <Database className="w-4 h-4" />
            {isSeeding ? "Seeding..." : "Seed Data"}
          </Button>
        </div>
      </div>

      {/* Status bar */}
      {!isLoading && stats && (
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="text-xs gap-1"
            style={{ borderColor: "oklch(0.62 0.16 160 / 0.4)", color: "oklch(0.55 0.16 160)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            System Online
          </Badge>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </Badge>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} loading={isLoading} />
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <div className="h-80 rounded-xl bg-muted animate-pulse" />
            <div className="h-80 rounded-xl bg-muted animate-pulse" />
          </>
        ) : (
          <>
            <AdmissionTrendChart data={charts?.admissionTrend ?? []} />
            <DoctorWorkloadChart data={charts?.doctorWorkload ?? []} />
          </>
        )}
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <div className="h-72 rounded-xl bg-muted animate-pulse" />
            <div className="h-72 rounded-xl bg-muted animate-pulse" />
            <div className="h-72 rounded-xl bg-muted animate-pulse" />
          </>
        ) : (
          <>
            <DonutChart
              data={charts?.patientsByCondition ?? []}
              title="Patient Conditions"
            />
            <DonutChart
              data={charts?.patientsByStatus ?? []}
              title="Patient Status"
            />
            <DonutChart
              data={charts?.patientsByGender ?? []}
              title="Gender Distribution"
            />
          </>
        )}
      </div>
    </div>
  );
}
