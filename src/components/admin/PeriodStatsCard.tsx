"use client";

import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { BarChart } from "./BarChart";
import { DEFAULT_PERIOD, PERIODS, formatFcfa, type Period, type SeriesPoint } from "@/lib/dashboard-stats";

export interface PeriodCardData {
  total: number;
  change: number | null;
  series: SeriesPoint[];
  /** Two mini widgets; an entry is hidden when its `value` is null. */
  minis: { value: string | null }[];
}

interface Props {
  title: string;
  titleNote?: string;
  subtitle: string;
  icon: ReactNode;
  iconTone: string;
  accent: { text: string; tabActive: string; bar: string };
  todayLabel: string; // "18 septembre 2026"
  data: Record<Period, PeriodCardData>;
  miniIcons: [ReactNode, ReactNode];
  miniLabels: Record<Period, [string, string]>;
}

const PERIOD_CAPTION: Record<Period, string> = {
  day: "Aujourd'hui",
  week: "7 derniers jours",
  month: "Ce mois-ci",
  year: "Cette année",
};
const CHANGE_CAPTION: Record<Period, string> = {
  day: "vs hier",
  week: "vs 7 jours précédents",
  month: "vs mois dernier",
  year: "vs année dernière",
};

/** Always opens on "Jour": the period lives only in component state (nothing persisted). */
export function PeriodStatsCard({
  title, titleNote, subtitle, icon, iconTone, accent, todayLabel, data, miniIcons, miniLabels,
}: Props) {
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);
  const current = data[period];
  const change = current.change;

  return (
    <section className="min-w-0 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconTone}`}>{icon}</div>
          <div className="min-w-0">
            <h2 className="font-black text-gray-900">
              {title} {titleNote && <span className="text-xs font-normal text-gray-400">{titleNote}</span>}
            </h2>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        {change !== null && (
          <div className={`shrink-0 text-right text-xs font-semibold ${change >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            <span className="inline-flex items-center gap-0.5">
              {change >= 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
              {change >= 0 ? "+" : ""}{change} %
            </span>
            <p className="font-normal text-gray-400">{CHANGE_CAPTION[period]}</p>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-1 rounded-xl bg-gray-100 p-1" role="tablist">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={period === key}
            onClick={() => setPeriod(key)}
            className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
              period === key ? `${accent.tabActive} text-white shadow-sm` : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className={`mt-4 text-3xl font-black ${accent.text}`}>{formatFcfa(current.total)}</p>
      <p className="text-xs text-gray-500">
        {PERIOD_CAPTION[period]}{period === "day" && <> • {todayLabel}</>}
      </p>

      <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-stretch">
        <div className="min-w-0 flex-1">
          <BarChart data={current.series} color={accent.bar} formatValue={formatFcfa} />
        </div>
        <div className="grid grid-cols-2 gap-3 xl:w-52 xl:grid-cols-1">
          {current.minis.map((mini, i) =>
            mini.value === null ? null : (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconTone}`}>{miniIcons[i]}</div>
                <div className="min-w-0">
                  <p className="break-words text-sm font-black text-gray-900 sm:text-base">{mini.value}</p>
                  <p className="text-[11px] leading-tight text-gray-500">{miniLabels[period][i]}</p>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
