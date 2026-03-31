"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

type Stats = {
  models: { model: string; count: number }[];
  totalGenerations: number;
  totalSites: number;
  totalUsers: number;
  dailyUsage: { date: string; model: string; count: number }[];
  dailySites: { date: string; count: number }[];
};

const t = {
  en: {
    title: "Platform Stats",
    subtitle: "Real-time usage statistics for EasySite",
    totalGenerations: "AI Generations",
    totalSites: "Sites Created",
    totalUsers: "Users",
    modelUsage: "Model Usage",
    dailyActivity: "Daily Activity (30 days)",
    generations: "generations",
    sites: "sites",
    noData: "No data yet. Start creating sites to see stats!",
  },
  zh: {
    title: "平台统计",
    subtitle: "EasySite 实时使用统计",
    totalGenerations: "AI 生成次数",
    totalSites: "创建的网站",
    totalUsers: "用户数",
    modelUsage: "模型使用",
    dailyActivity: "每日活动（30 天）",
    generations: "次生成",
    sites: "个网站",
    noData: "暂无数据。开始创建网站来查看统计！",
  },
};

// Simple model name formatter
function formatModel(id: string) {
  const parts = id.split("/");
  return parts.length > 1 ? parts[1] : id;
}

// Simple bar chart component
function Bar({
  value,
  max,
  label,
  count,
  color,
}: {
  value: number;
  max: number;
  label: string;
  count: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-36 sm:w-48 text-sm truncate text-muted" title={label}>
        {label}
      </div>
      <div className="flex-1 h-8 rounded-md bg-card-bg overflow-hidden">
        <div
          className="h-full rounded-md transition-all duration-500"
          style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }}
        />
      </div>
      <div className="w-16 text-right text-sm font-medium">{count}</div>
    </div>
  );
}

const COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
];

export default function StatsClient({ locale }: { locale: Locale }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const d = t[locale];

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted">{d.noData}</p>
      </div>
    );
  }

  const maxModelCount = Math.max(...stats.models.map((m) => m.count), 1);

  // Aggregate daily usage for the mini chart
  const dailyMap = new Map<string, { generations: number; sites: number }>();
  for (const row of stats.dailyUsage) {
    const entry = dailyMap.get(row.date) || { generations: 0, sites: 0 };
    entry.generations += row.count;
    dailyMap.set(row.date, entry);
  }
  for (const row of stats.dailySites) {
    const entry = dailyMap.get(row.date) || { generations: 0, sites: 0 };
    entry.sites += row.count;
    dailyMap.set(row.date, entry);
  }
  const dailyData = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }));
  const maxDaily = Math.max(
    ...dailyData.map((d) => Math.max(d.generations, d.sites)),
    1
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:py-24">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">{d.title}</h1>
      <p className="text-muted mb-10">{d.subtitle}</p>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {[
          { label: d.totalGenerations, value: stats.totalGenerations, icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
          { label: d.totalSites, value: stats.totalSites, icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" },
          { label: d.totalUsers, value: stats.totalUsers, icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-card-border bg-card-bg p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={card.icon}
                  />
                </svg>
              </div>
              <span className="text-sm text-muted">{card.label}</span>
            </div>
            <p className="text-3xl font-bold">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Model usage chart */}
      <div className="rounded-xl border border-card-border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-6">{d.modelUsage}</h2>
        {stats.models.length > 0 ? (
          <div className="space-y-3">
            {stats.models.map((m, i) => (
              <Bar
                key={m.model}
                value={m.count}
                max={maxModelCount}
                label={formatModel(m.model)}
                count={m.count}
                color={COLORS[i % COLORS.length]}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm">{d.noData}</p>
        )}
      </div>

      {/* Daily activity chart */}
      {dailyData.length > 0 && (
        <div className="rounded-xl border border-card-border p-6">
          <h2 className="text-lg font-semibold mb-6">{d.dailyActivity}</h2>
          <div className="flex items-end gap-1 h-40">
            {dailyData.map((day) => {
              const genH = (day.generations / maxDaily) * 100;
              const siteH = (day.sites / maxDaily) * 100;
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-0.5 group relative"
                >
                  <div className="w-full flex flex-col items-center gap-0.5" style={{ height: "100%" }}>
                    <div className="w-full flex flex-col justify-end flex-1 gap-0.5">
                      {day.generations > 0 && (
                        <div
                          className="w-full rounded-t-sm bg-accent/70 min-h-[2px]"
                          style={{ height: `${Math.max(genH, 3)}%` }}
                        />
                      )}
                      {day.sites > 0 && (
                        <div
                          className="w-full rounded-t-sm bg-success/70 min-h-[2px]"
                          style={{ height: `${Math.max(siteH, 3)}%` }}
                        />
                      )}
                    </div>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-background border border-card-border rounded-lg px-3 py-2 text-xs shadow-lg whitespace-nowrap z-10">
                    <p className="font-medium">{day.date}</p>
                    <p className="text-accent">{day.generations} {d.generations}</p>
                    <p className="text-success">{day.sites} {d.sites}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-accent/70" />
              {d.generations}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-success/70" />
              {d.sites}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
