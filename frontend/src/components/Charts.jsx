import React, { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { BarChart3, CalendarRange, ChartColumn, ChevronDown, Filter, RefreshCw } from "lucide-react";
import BorderGlow from "./BorderGlow";
import { darkModeGlowProps } from "./borderGlowTheme";
import { useTheme } from "./ThemeContext";
import { fetchExpenses as fetchExpensesRequest } from "../utils/api";

const CHART_OPTIONS = [
  { value: "category-pie", label: "Category Pie" },
  { value: "category-bar", label: "Category Bar" },
  { value: "daily-bar", label: "Daily Bar" },
  { value: "monthly-line", label: "Monthly Line" },
];

const COLORS = ["#2563eb", "#0f766e", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#65a30d"];

function buildCategoryData(expenses) {
  const totals = expenses.reduce((acc, expense) => {
    const key = expense.category || "Other";
    acc[key] = (acc[key] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});

  return Object.entries(totals)
    .sort((left, right) => right[1] - left[1])
    .map(([label, amount], index) => ({
      label,
      amount,
      color: COLORS[index % COLORS.length],
    }));
}

function buildDailyData(expenses) {
  const totals = expenses.reduce((acc, expense) => {
    const key = expense.date || "Unknown";
    acc[key] = (acc[key] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});

  return Object.entries(totals)
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([label, amount], index) => ({
      label,
      shortLabel: label.slice(5),
      amount,
      color: COLORS[index % COLORS.length],
    }));
}

function buildMonthlyData(expenses) {
  const totals = expenses.reduce((acc, expense) => {
    const key = (expense.date || "").slice(0, 7) || "Unknown";
    acc[key] = (acc[key] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});

  return Object.entries(totals)
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([label, amount], index) => ({
      label,
      shortLabel: label,
      amount,
      color: COLORS[index % COLORS.length],
    }));
}

function PieChart({ data, theme }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const centerFill = theme === "dark" ? "#14121c" : "#ffffff";
  const centerLabelColor = theme === "dark" ? "#c4b5fd" : "#6b7280";
  const centerValueColor = theme === "dark" ? "#f5e8ff" : "#111827";
  const itemClassName =
    theme === "dark"
      ? "flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
      : "flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3";
  const itemLabelClassName = "font-medium";
  const itemValueClassName = "font-semibold";
  const itemLabelColor = theme === "dark" ? "#e2e8f0" : "#334155";
  const itemValueColor = theme === "dark" ? "#ffffff" : "#0f172a";
  let cumulative = 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Motion.svg
        viewBox="0 0 120 120"
        className="mx-auto h-64 w-64 -rotate-90"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {data.map((segment) => {
          const fraction = segment.amount / total;
          const dash = fraction * 251.2;
          const gap = 251.2 - dash;
          const offset = -cumulative * 251.2;
          cumulative += fraction;

          return (
            <circle
              key={segment.label}
              cx="60"
              cy="60"
              r="40"
              fill="transparent"
              stroke={segment.color}
              strokeWidth="18"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
            />
          );
        })}
        <circle cx="60" cy="60" r="24" fill={centerFill} />
        <text x="60" y="56" textAnchor="middle" fill={centerLabelColor} className="text-[7px] rotate-90 origin-center">
          Total
        </text>
        <text x="60" y="66" textAnchor="middle" fill={centerValueColor} className="text-[8px] font-semibold rotate-90 origin-center">
          Rs.{total.toFixed(0)}
        </text>
      </Motion.svg>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className={itemClassName}>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></span>
              <span className={itemLabelClassName} style={{ color: itemLabelColor }}>{item.label}</span>
            </div>
            <span className={itemValueClassName} style={{ color: itemValueColor }}>Rs.{item.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerticalBarChart({ data, titleColor, gridColor, theme }) {
  const maxAmount = Math.max(...data.map((item) => item.amount), 1);
  const shellClassName =
    theme === "dark"
      ? "flex h-72 items-end gap-3 overflow-x-auto rounded-3xl border border-white/10 bg-gradient-to-br from-[#171427] to-[#0f1320] p-4"
      : "flex h-72 items-end gap-3 overflow-x-auto rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4";
  const hintClassName =
    theme === "dark"
      ? "rounded-2xl border p-3 text-xs text-slate-300"
      : "rounded-2xl border p-3 text-xs text-slate-500";
  const labelClassName = "max-w-[72px] text-center text-xs font-medium";
  const labelColor = theme === "dark" ? "#94a3b8" : "#64748b";
  const hintColor = theme === "dark" ? "#cbd5e1" : "#64748b";

  return (
    <div className="space-y-4">
      <div className={shellClassName}>
        {data.map((item) => (
          <div key={item.label} className="flex min-w-[72px] flex-1 flex-col items-center justify-end gap-3">
            <span className="text-xs font-semibold" style={{ color: titleColor }}>
              Rs.{item.amount.toFixed(0)}
            </span>
            <Motion.div
              className="w-full rounded-t-2xl"
              style={{
                height: `${Math.max((item.amount / maxAmount) * 180, 12)}px`,
                background: `linear-gradient(180deg, ${item.color} 0%, ${item.color}cc 100%)`,
                boxShadow: `0 10px 25px ${item.color}33`,
              }}
              initial={{ height: 0, opacity: 0.7 }}
              animate={{ height: `${Math.max((item.amount / maxAmount) * 180, 12)}px`, opacity: 1 }}
            />
            <span className={labelClassName} style={{ color: labelColor }}>{item.shortLabel || item.label}</span>
          </div>
        ))}
      </div>
      <div className={hintClassName} style={{ borderColor: gridColor, color: hintColor }}>
        Higher bars indicate larger total spending in that period or category.
      </div>
    </div>
  );
}

function LineChart({ data, theme }) {
  const maxAmount = Math.max(...data.map((item) => item.amount), 1);
  const stroke = theme === "dark" ? "#8b5cf6" : "#2563eb";
  const axisColor = theme === "dark" ? "rgba(196, 181, 253, 0.32)" : "rgba(37, 99, 235, 0.15)";
  const labelColor = theme === "dark" ? "#f5e8ff" : "#0f172a";
  const mutedColor = theme === "dark" ? "#c4b5fd" : "#94a3b8";
  const rowClassName =
    theme === "dark"
      ? "flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
      : "flex items-center justify-between rounded-2xl border border-slate-200/80 px-4 py-3";
  const rowLabelClassName = "font-medium";
  const rowLabelColor = theme === "dark" ? "#cbd5e1" : "#475569";

  const points = data.map((point, index) => {
    const x = data.length === 1 ? 60 : 14 + (index * 92) / (data.length - 1);
    const y = 96 - (point.amount / maxAmount) * 68;
    return { ...point, x, y };
  });

  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="space-y-4">
      <svg width={280} height={180} viewBox="0 0 120 120" className="mx-auto overflow-visible">
        <line x1="14" y1="96" x2="106" y2="96" stroke={axisColor} strokeWidth="1.2" />
        <line x1="14" y1="20" x2="14" y2="96" stroke={axisColor} strokeWidth="1.2" />
        {points.length > 1 ? (
          <>
            <polyline
              points={polylinePoints}
              fill="none"
              stroke={stroke}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((point) => (
              <circle key={point.label} cx={point.x} cy={point.y} r={4.2} fill={stroke} />
            ))}
          </>
        ) : points.length === 1 ? (
          <>
            <line x1="60" y1="96" x2="60" y2={points[0].y} stroke={stroke} strokeWidth="3" strokeLinecap="round" />
            <circle cx="60" cy={points[0].y} r={6} fill={stroke} />
          </>
        ) : null}
        {points.length === 0 && (
          <text x="60" y="60" textAnchor="middle" fill={mutedColor}>
            No data
          </text>
        )}
      </svg>

      <div className="space-y-2">
        {points.map((point) => (
          <div key={point.label} className={rowClassName}>
            <span className={rowLabelClassName} style={{ color: rowLabelColor }}>{point.label}</span>
            <span style={{ color: labelColor }} className="font-semibold">
              Rs.{point.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Charts() {
  const { theme } = useTheme();
  const [chartType, setChartType] = useState("category-pie");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadChartData = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchExpensesRequest({
        start_date: startDate,
        end_date: endDate,
      });
      setExpenses(data.expenses || []);
    } catch (err) {
      console.error("Error loading chart data:", err);
      setError(err.message || "Failed to load chart data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChartData();
  }, []);

  useEffect(() => {
    const handleExpenseChange = () => {
      loadChartData();
    };

    window.addEventListener("expenseAdded", handleExpenseChange);
    window.addEventListener("expenseDeleted", handleExpenseChange);

    return () => {
      window.removeEventListener("expenseAdded", handleExpenseChange);
      window.removeEventListener("expenseDeleted", handleExpenseChange);
    };
  }, [startDate, endDate]);

  const chartData = useMemo(() => {
    if (chartType === "category-pie" || chartType === "category-bar") {
      return buildCategoryData(expenses);
    }
    if (chartType === "daily-bar") {
      return buildDailyData(expenses);
    }
    return buildMonthlyData(expenses);
  }, [chartType, expenses]);

  const summary = useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const categories = new Set(expenses.map((expense) => expense.category || "Other")).size;
    return {
      total,
      count: expenses.length,
      categories,
    };
  }, [expenses]);

  const titleColor = theme === "dark" ? "#f5e8ff" : "#0f172a";
  const heroTitleColor = theme === "dark" ? "#f8fafc" : "#0f172a";
  const heroTextColor = theme === "dark" ? "#d8dee9" : "#475569";
  const fieldLabelColor = theme === "dark" ? "#a5b4fc" : "#64748b";
  const refreshButtonColor = theme === "dark" ? "#d8dee9" : "#64748b";
  const visualTitleColor = theme === "dark" ? "#f8fafc" : "#0f172a";
  const visualTextColor = theme === "dark" ? "#cbd5e1" : "#64748b";
  const pillColor = theme === "dark" ? "#d8dee9" : "#475569";
  const emptyTextColor = theme === "dark" ? "#94a3b8" : "#64748b";
  const summarySubtleColor = "#cbd5e1";
  const summaryStrongColor = "#ffffff";
  const cardClassName =
    theme === "dark"
      ? "rounded-[28px] border border-white/10 bg-[#11131a] p-6 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
      : "rounded-[28px] bg-white p-6 shadow-sm";
  const heroClassName =
    theme === "dark"
      ? `${cardClassName} bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_26%),linear-gradient(180deg,#151826_0%,#0f1118_100%)]`
      : `${cardClassName} bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_36%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]`;
  const heroBadgeClassName =
    theme === "dark"
      ? "inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200"
      : "inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700";
  const heroTitleClassName = "text-3xl font-semibold tracking-tight";
  const heroTextClassName = "text-sm leading-6";
  const fieldLabelClassName = "text-xs font-semibold uppercase tracking-[0.16em]";
  const inputClassName =
    theme === "dark"
      ? "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100 shadow-sm outline-none transition focus:border-blue-400"
      : "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400";
  const refreshButtonClassName =
    theme === "dark"
      ? "inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-white/20"
      : "inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-slate-300";
  const visualTitleClassName = "text-lg font-semibold";
  const visualTextClassName = "text-sm";
  const pillClassName =
    theme === "dark"
      ? "inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-2 text-xs font-medium"
      : "inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-medium";
  const emptyClassName =
    theme === "dark"
      ? "flex h-72 items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.03]"
      : "flex h-72 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50";
  const errorClassName =
    theme === "dark"
      ? "flex h-72 flex-col items-center justify-center gap-4 rounded-3xl border border-red-500/30 bg-red-500/10 text-red-300"
      : "flex h-72 flex-col items-center justify-center gap-4 rounded-3xl border border-red-200 bg-red-50 text-red-500";
  const summaryCardClassName =
    theme === "dark"
      ? "rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#17142a_0%,#101827_100%)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
      : "rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,#0f172a_0%,#1e293b_100%)] p-6 shadow-sm";
  const summaryBadgeClassName =
    theme === "dark"
      ? "mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.2em]"
      : "mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em]";
  const summaryLabelClassName = "text-sm";
  const summaryValueClassName = "text-3xl font-semibold tracking-tight";
  const summaryStatCardClassName =
    theme === "dark"
      ? "rounded-2xl border border-white/10 bg-white/8 p-4"
      : "rounded-2xl border border-white/10 bg-white/8 p-4";
  const summaryStatLabelClassName = "text-xs uppercase tracking-[0.16em]";
  const summaryStatValueClassName = "mt-2 text-2xl font-semibold";

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className={emptyClassName} style={{ color: emptyTextColor }}>
          No chart data available for the selected dates.
        </div>
      );
    }

    if (chartType === "category-pie") {
      return <PieChart data={chartData} theme={theme} />;
    }

    if (chartType === "category-bar" || chartType === "daily-bar") {
      return <VerticalBarChart data={chartData} titleColor={titleColor} gridColor={theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(148, 163, 184, 0.25)"} theme={theme} />;
    }

    return <LineChart data={chartData} theme={theme} />;
  };

  const cardContent = (
    <Motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={heroClassName}>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className={heroBadgeClassName}>
              <ChartColumn size={14} />
              Charts
            </div>
            <h2 className={heroTitleClassName} style={{ color: heroTitleColor }}>Explore your expense patterns visually</h2>
            <p className={heroTextClassName} style={{ color: heroTextColor }}>
              Switch between chart types and narrow the timeframe to inspect category mix, daily spikes, and monthly momentum.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[520px]">
            <label className="space-y-2">
              <span className={fieldLabelClassName} style={{ color: fieldLabelColor }}>Chart Type</span>
              <div className="relative">
                <select
                  value={chartType}
                  onChange={(event) => setChartType(event.target.value)}
                  className={`${inputClassName} appearance-none pr-10`}
                >
                  {CHART_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />
              </div>
            </label>

            <label className="space-y-2">
              <span className={fieldLabelClassName} style={{ color: fieldLabelColor }}>Start Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={inputClassName}
              />
            </label>

            <label className="space-y-2">
              <span className={fieldLabelClassName} style={{ color: fieldLabelColor }}>End Date</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className={inputClassName}
              />
            </label>

            <div className="flex items-end gap-3">
              <button
                type="button"
                onClick={loadChartData}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                style={{ color: "#ffffff" }}
              >
                <Filter size={16} />
                Apply Filter
              </button>
              <button
                type="button"
                onClick={loadChartData}
                className={refreshButtonClassName}
                style={{ color: refreshButtonColor }}
                title="Refresh chart data"
              >
                <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className={cardClassName}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className={visualTitleClassName} style={{ color: visualTitleColor }}>Visual Report</h3>
              <p className={visualTextClassName} style={{ color: visualTextColor }}>Filtered by the dates you selected.</p>
            </div>
            <div className={pillClassName} style={{ color: pillColor }}>
              <CalendarRange size={14} />
              {startDate || endDate ? `${startDate || "Start"} to ${endDate || "Now"}` : "All dates"}
            </div>
          </div>

          {loading ? (
            <div className="flex h-72 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className={errorClassName}>
              <p>{error}</p>
              <button
                type="button"
                onClick={loadChartData}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                style={{ color: "#ffffff" }}
              >
                Retry
              </button>
            </div>
          ) : (
            renderChart()
          )}
        </div>

        <div className="space-y-5">
          <div className={summaryCardClassName}>
            <div className={summaryBadgeClassName} style={{ color: summarySubtleColor }}>
              <BarChart3 size={14} />
              Summary
            </div>
            <div className="space-y-5">
              <div>
                <p className={summaryLabelClassName} style={{ color: summarySubtleColor }}>Total Spend</p>
                <p className={summaryValueClassName} style={{ color: summaryStrongColor }}>Rs.{summary.total.toFixed(2)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className={summaryStatCardClassName}>
                  <p className={summaryStatLabelClassName} style={{ color: summarySubtleColor }}>Entries</p>
                  <p className={summaryStatValueClassName} style={{ color: summaryStrongColor }}>{summary.count}</p>
                </div>
                <div className={summaryStatCardClassName}>
                  <p className={summaryStatLabelClassName} style={{ color: summarySubtleColor }}>Categories</p>
                  <p className={summaryStatValueClassName} style={{ color: summaryStrongColor }}>{summary.categories}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Motion.div>
  );

  return theme === "dark" ? (
    <BorderGlow {...darkModeGlowProps}>{cardContent}</BorderGlow>
  ) : (
    cardContent
  );
}
