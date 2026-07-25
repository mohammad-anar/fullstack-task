"use client";

import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  trend,
  loading,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-8 bg-muted rounded w-16" />
              <div className="h-3 bg-muted rounded w-32" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                  )}
                >
                  {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0",
              "group-hover:scale-110 transition-transform duration-300"
            )}
            style={{ background: gradient }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
          style={{ background: gradient }}
        />
      </CardContent>
    </Card>
  );
}
