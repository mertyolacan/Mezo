"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

type DataPoint = { date: string; revenue: number; orderCount: number };
type Period = "7d" | "30d" | "90d";

export default function RevenueChart() {
  const [period, setPeriod] = useState<Period>("30d");
  const [series, setSeries] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?period=${period}`)
      .then((r) => r.json())
      .then((json) => {
        setSeries(json.data?.series ?? []);
        setLoading(false);
      });
  }, [period]);

  const maxRevenue = Math.max(...series.map((d) => d.revenue), 1);
  const totalRevenue = series.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = series.reduce((s, d) => s + d.orderCount, 0);

  const W = 600;
  const H = 140;
  const PAD = { top: 10, right: 8, bottom: 24, left: 8 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  function xOf(i: number) {
    return PAD.left + (i / Math.max(series.length - 1, 1)) * chartW;
  }
  function yOf(v: number) {
    return PAD.top + chartH - (v / maxRevenue) * chartH;
  }

  const pathD = series.length < 2
    ? ""
    : series
        .map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(d.revenue).toFixed(1)}`)
        .join(" ");

  const areaD = series.length < 2
    ? ""
    : `${pathD} L${xOf(series.length - 1).toFixed(1)},${(PAD.top + chartH).toFixed(1)} L${PAD.left.toFixed(1)},${(PAD.top + chartH).toFixed(1)} Z`;

  const labelStep = series.length <= 7 ? 1 : series.length <= 30 ? 5 : 15;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">Gelir Grafiği</h2>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{formatPrice(totalRevenue)}</span>
            <span className="text-xs text-zinc-400">{totalOrders} sipariş</span>
          </div>
        </div>
        <div className="flex gap-1">
          {(["7d", "30d", "90d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                period === p
                  ? "bg-brand-primary text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {p === "7d" ? "7 Gün" : p === "30d" ? "30 Gün" : "90 Gün"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[164px] flex items-center justify-center text-xs text-zinc-400">Yükleniyor…</div>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          preserveAspectRatio="none"
          style={{ height: H }}
        >
          <defs>
            <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Area */}
          {areaD && <path d={areaD} fill="url(#rev-grad)" />}
          {/* Line */}
          {pathD && <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
          {/* Dots */}
          {series.map((d, i) => (
            d.revenue > 0 && (
              <circle key={i} cx={xOf(i)} cy={yOf(d.revenue)} r="3" fill="#6366f1" />
            )
          ))}
          {/* X labels */}
          {series.map((d, i) => {
            if (i % labelStep !== 0 && i !== series.length - 1) return null;
            const label = d.date.slice(5); // MM-DD
            return (
              <text
                key={i}
                x={xOf(i)}
                y={H - 4}
                textAnchor="middle"
                fontSize="9"
                fill="#a1a1aa"
              >
                {label}
              </text>
            );
          })}
        </svg>
      )}
    </div>
  );
}
