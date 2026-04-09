import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { AlertTriangle, BrainCircuit, CalendarRange, RefreshCw, Sparkles, Target, TrendingUp } from "lucide-react";
import BorderGlow from "./BorderGlow";
import { darkModeGlowProps } from "./borderGlowTheme";
import { useTheme } from "./ThemeContext";
import { fetchPredictions } from "../utils/api";

const riskTone = {
  safe: {
    icon: Target,
    label: "On Track",
    light: "border-green-300 bg-green-100 text-green-800",
    dark: "border-green-400/35 bg-green-500/20 text-green-100",
    lightCard: "border-green-300 bg-gradient-to-br from-green-100 via-emerald-100 to-lime-50",
    darkCard: "border-green-400/35 bg-gradient-to-br from-green-500/25 via-emerald-500/20 to-lime-400/15",
  },
  warning: {
    icon: TrendingUp,
    label: "Watch Closely",
    light: "border-yellow-200 bg-yellow-50 text-yellow-700",
    dark: "border-yellow-400/20 bg-yellow-400/10 text-yellow-200",
    lightCard: "border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50",
    darkCard: "border-yellow-400/20 bg-gradient-to-br from-yellow-500/10 to-amber-400/10",
  },
  overspending: {
    icon: AlertTriangle,
    label: "High Risk",
    light: "border-red-300 bg-red-100 text-red-800",
    dark: "border-red-400/35 bg-red-500/20 text-red-100",
    lightCard: "border-red-300 bg-gradient-to-br from-red-100 via-rose-100 to-orange-50",
    darkCard: "border-red-400/35 bg-gradient-to-br from-red-500/25 via-rose-500/20 to-orange-400/15",
  },
};

function formatCurrency(amount) {
  return `Rs.${Number(amount || 0).toFixed(2)}`;
}

export default function Bhavishyvani() {
  const { theme } = useTheme();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPredictions = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchPredictions();
      setPayload(data);
    } catch (err) {
      console.error("Error loading predictions:", err);
      setError(err.message || "Failed to load predictions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();

    const handleRefresh = () => {
      loadPredictions();
    };

    window.addEventListener("expenseAdded", handleRefresh);
    window.addEventListener("expenseDeleted", handleRefresh);
    window.addEventListener("budgetUpdated", handleRefresh);
    window.addEventListener("backendRecovered", handleRefresh);

    return () => {
      window.removeEventListener("expenseAdded", handleRefresh);
      window.removeEventListener("expenseDeleted", handleRefresh);
      window.removeEventListener("budgetUpdated", handleRefresh);
      window.removeEventListener("backendRecovered", handleRefresh);
    };
  }, []);

  const cardClassName =
    theme === "dark"
      ? "rounded-[28px] border border-white/10 bg-[#11131a] p-6 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
      : "rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm";
  const heroClassName =
    theme === "dark"
      ? `${cardClassName} bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_26%),linear-gradient(180deg,#121620_0%,#0d1117_100%)]`
      : `${cardClassName} bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.15),_transparent_34%),linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)]`;
  const heroTitleColor = theme === "dark" ? "#f8fafc" : "#0f172a";
  const heroTextColor = theme === "dark" ? "#dbe4ee" : "#475569";
  const subtitleColor = theme === "dark" ? "#cbd5e1" : "#64748b";
  const mutedPanelClassName =
    theme === "dark"
      ? "rounded-2xl border border-white/10 bg-white/[0.04] p-4"
      : "rounded-2xl border border-slate-200 bg-slate-50 p-4";
  const insightClassName =
    theme === "dark"
      ? "rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-slate-200"
      : "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700";

  const forecast = payload?.forecast;
  const risk = payload?.risk;
  const meta = payload?.meta;
  const insights = payload?.insights || [];
  const tone = riskTone[risk?.label] || riskTone.safe;
  const RiskIcon = tone.icon;
  const riskCardClassName =
    theme === "dark"
      ? `rounded-[28px] border p-6 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${tone.darkCard}`
      : `rounded-[28px] border p-6 shadow-sm ${tone.lightCard}`;

  const content = (
    <Motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={heroClassName}>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${theme === "dark" ? "bg-white/10 text-emerald-200" : "bg-emerald-100 text-emerald-700"}`}>
              <Sparkles size={14} />
              BHAVISHYVANI
            </div>
            <h2 className="text-3xl font-semibold tracking-tight" style={{ color: heroTitleColor }}>
              Future expense prediction for your current month
            </h2>
            <p className="text-sm leading-6" style={{ color: heroTextColor }}>
              This view combines your recent expense history, current month spending pace, and saved budget to estimate where the month is heading.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium ${theme === "dark" ? "bg-white/8 text-slate-200" : "bg-slate-100 text-slate-700"}`}>
              <CalendarRange size={14} />
              Current month forecast
            </div>
            <button
              type="button"
              onClick={loadPredictions}
              className={`inline-flex items-center justify-center rounded-2xl border p-3 transition ${theme === "dark" ? "border-white/10 bg-white/[0.04] text-slate-200 hover:border-white/20" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
              title="Refresh prediction"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={`${cardClassName} flex h-72 items-center justify-center`}>
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className={`${cardClassName} flex h-72 flex-col items-center justify-center gap-4 text-center`}>
          <AlertTriangle size={24} className="text-red-500" />
          <p className={theme === "dark" ? "text-red-200" : "text-red-600"}>{error}</p>
          <button
            type="button"
            onClick={loadPredictions}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
            style={{ color: "#ffffff" }}
          >
            Retry
          </button>
        </div>
      ) : !forecast || !risk ? (
        <div className={`${cardClassName} flex h-72 items-center justify-center text-center`} style={{ color: subtitleColor }}>
          Prediction data is not available yet.
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div className={cardClassName}>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">
                  <TrendingUp size={14} />
                  Month-End Spend
                </div>
                <p className="text-3xl font-semibold" style={{ color: heroTitleColor }}>
                  {formatCurrency(forecast.predicted_month_end_spend)}
                </p>
                <p className="mt-2 text-sm" style={{ color: subtitleColor }}>
                  Current spend is {formatCurrency(risk.current_spend)} and the model projects the full month from your current pace.
                </p>
              </div>

              <div className={cardClassName}>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
                  <CalendarRange size={14} />
                  Next 7 Days
                </div>
                <p className="text-3xl font-semibold" style={{ color: heroTitleColor }}>
                  {formatCurrency(forecast.predicted_next_7_days_spend)}
                </p>
                <p className="mt-2 text-sm" style={{ color: subtitleColor }}>
                  Short-term estimate based on recent spend behavior and the remaining month trajectory.
                </p>
              </div>

              <div className={cardClassName}>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-purple-500">
                  <BrainCircuit size={14} />
                  Top Category
                </div>
                <p className="text-2xl font-semibold" style={{ color: heroTitleColor }}>
                  {forecast.predicted_top_category || "Other"}
                </p>
                <p className="mt-2 text-sm" style={{ color: subtitleColor }}>
                  This is the category most likely to lead your spending by month end.
                </p>
              </div>
            </div>

            <div className={cardClassName}>
              <h3 className="text-lg font-semibold" style={{ color: heroTitleColor }}>
                Insights
              </h3>
              <div className="mt-4 space-y-3">
                {insights.map((insight, index) => (
                  <div key={`${insight}-${index}`} className={insightClassName}>
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className={riskCardClassName}>
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${theme === "dark" ? tone.dark : tone.light}`}>
                <RiskIcon size={14} />
                {tone.label}
              </div>
              <div className="mt-5 space-y-4">
                <div className={mutedPanelClassName}>
                  <p className="text-sm" style={{ color: subtitleColor }}>Risk Label</p>
                  <p className="mt-2 text-2xl font-semibold capitalize" style={{ color: heroTitleColor }}>
                    {risk.label}
                  </p>
                </div>

                <div className={mutedPanelClassName}>
                  <p className="text-sm" style={{ color: subtitleColor }}>Budget</p>
                  <p className="mt-2 text-2xl font-semibold" style={{ color: heroTitleColor }}>
                    {formatCurrency(risk.budget)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Motion.div>
  );

  return theme === "dark" ? <BorderGlow {...darkModeGlowProps}>{content}</BorderGlow> : content;
}
