import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import BorderGlow from "./BorderGlow";
import { darkModeGlowProps } from "./borderGlowTheme";
import { useTheme } from "./ThemeContext";

export default function LineChartCard() {
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5000/api/analytics");
      const result = await response.json();

      if (result.success) {
        setData(result.monthlyData || []);
      } else {
        setError("Failed to fetch analytics data");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    const handleExpenseChange = () => {
      setTimeout(fetchAnalytics, 500);
    };

    window.addEventListener("expenseAdded", handleExpenseChange);
    window.addEventListener("expenseDeleted", handleExpenseChange);

    return () => {
      window.removeEventListener("expenseAdded", handleExpenseChange);
      window.removeEventListener("expenseDeleted", handleExpenseChange);
    };
  }, []);

  const max = data.length > 0 ? Math.max(...data.map((point) => point.amount), 1) : 0;
  const chartStroke = theme === "dark" ? "#8b5cf6" : "#6366f1";
  const axisColor = theme === "dark" ? "rgba(196, 181, 253, 0.32)" : "rgba(99, 102, 241, 0.18)";
  const labelColor = theme === "dark" ? "#f5e8ff" : "#1f2937";
  const mutedColor = theme === "dark" ? "#c4b5fd" : "#9ca3af";

  const chartPoints =
    data.length > 0
      ? data.map((point, index) => {
          const x = data.length === 1 ? 60 : 14 + (index * 92) / (data.length - 1);
          const y = 96 - (point.amount / max) * 68;
          return { ...point, x, y };
        })
      : [];

  const polylinePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");

  const cardContent = (
    <Motion.div
      className="bg-white rounded-xl shadow p-6 flex flex-col gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="mb-2 font-semibold">Monthly Expenses</h2>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex h-32 items-center justify-center text-red-500">
          <div className="text-center">
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="mt-2 rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          <svg width={220} height={150} viewBox="0 0 120 120" className="mx-auto">
            <line x1="14" y1="96" x2="106" y2="96" stroke={axisColor} strokeWidth="1.2" />
            <line x1="14" y1="20" x2="14" y2="96" stroke={axisColor} strokeWidth="1.2" />

            {chartPoints.length > 1 ? (
              <>
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke={chartStroke}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {chartPoints.map((point) => (
                  <circle key={point.month} cx={point.x} cy={point.y} r={4.2} fill={chartStroke} />
                ))}
              </>
            ) : chartPoints.length === 1 ? (
              <>
                <line x1="60" y1="96" x2="60" y2={chartPoints[0].y} stroke={chartStroke} strokeWidth="3" strokeLinecap="round" />
                <circle cx="60" cy={chartPoints[0].y} r={6} fill={chartStroke} />
                <text
                  x="60"
                  y={Math.max(chartPoints[0].y - 8, 16)}
                  textAnchor="middle"
                  fill={labelColor}
                  fontSize="8"
                  fontWeight="600"
                >
                  Rs.{chartPoints[0].amount.toFixed(0)}
                </text>
              </>
            ) : (
              <text x="60" y="60" textAnchor="middle" fill={mutedColor}>
                No data
              </text>
            )}
          </svg>

          <ul className="mt-2 text-sm">
            {data.length === 0 ? (
              <li className="text-gray-400">No data available.</li>
            ) : (
              data.map((point) => (
                <li key={point.month} className="flex items-center justify-between gap-3">
                  <span>{point.month}</span>
                  <span style={{ color: labelColor }}>Rs.{point.amount.toFixed(0)}</span>
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </Motion.div>
  );

  return theme === "dark" ? <BorderGlow {...darkModeGlowProps}>{cardContent}</BorderGlow> : cardContent;
}
