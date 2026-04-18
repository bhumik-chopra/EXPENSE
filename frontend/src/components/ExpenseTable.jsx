import React, { useState, useEffect, useCallback } from "react";
import { motion as Motion } from "framer-motion";
import { Filter, RefreshCw } from "lucide-react";
import BorderGlow from "./BorderGlow";
import { darkModeGlowProps } from "./borderGlowTheme";
import { useTheme } from "./ThemeContext";
import { formatDateInfo, getCurrentLocalDate } from "../utils/dateUtils";
import { fetchExpenses as fetchExpensesRequest } from "../utils/api";

export default function ExpenseTable() {
  const { theme } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [availableCategories, setAvailableCategories] = useState(["All Categories"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("All Categories");
  const [date, setDate] = useState("");
  const [currentDate, setCurrentDate] = useState(getCurrentLocalDate());

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExpensesRequest({
        category,
        start_date: date,
      });
      setExpenses(data.expenses || []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError(err.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, [category, date]);

  const fetchAvailableCategories = useCallback(async () => {
    try {
      const data = await fetchExpensesRequest();
      const nextCategories = [
        "All Categories",
        ...new Set((data.expenses || []).map((expense) => expense.category).filter(Boolean)),
      ];
      setAvailableCategories(nextCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
    fetchAvailableCategories();

    const handleExpenseChange = () => {
      setTimeout(() => {
        fetchExpenses();
        fetchAvailableCategories();
      }, 500);
    };

    window.addEventListener("expenseAdded", handleExpenseChange);
    window.addEventListener("expenseDeleted", handleExpenseChange);
    window.addEventListener("backendRecovered", handleExpenseChange);

    return () => {
      window.removeEventListener("expenseAdded", handleExpenseChange);
      window.removeEventListener("expenseDeleted", handleExpenseChange);
      window.removeEventListener("backendRecovered", handleExpenseChange);
    };
  }, [fetchAvailableCategories, fetchExpenses]);

  useEffect(() => {
    const syncCurrentDate = () => {
      setCurrentDate((previousDate) => {
        const nextDate = getCurrentLocalDate();
        return previousDate === nextDate ? previousDate : nextDate;
      });
    };

    syncCurrentDate();
    const intervalId = window.setInterval(syncCurrentDate, 60000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const filtered = expenses.filter(
    (expense) =>
      (!category || category === "All Categories" || expense.category === category) &&
      (!date || expense.date === date)
  );

  const formatCurrency = (amount, currency = "INR") => {
    const numericAmount = Number(amount || 0).toFixed(2);
    if (currency === "INR") {
      return `Rs.${numericAmount}`;
    }
    return `$${numericAmount}`;
  };

  const cardContent = (
    <Motion.div
      className="rounded-2xl bg-white p-4 shadow sm:p-5 lg:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Expense History</h3>
        <button
          onClick={fetchExpenses}
          className="self-end rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 sm:self-auto"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="mb-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <select
            className="w-full rounded-xl border px-3 py-2.5 text-sm"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {availableCategories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="w-full rounded-xl border px-3 py-2.5 text-sm"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          <button
            className="flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-3 py-2.5 text-blue-700 sm:col-span-2 xl:col-span-1"
            onClick={fetchExpenses}
          >
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="hidden sm:table-header-group">
            <tr className="border-b text-gray-500">
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="py-8 text-center">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="mr-2 animate-spin" size={16} />
                    Loading expenses...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-red-500">
                  <div>
                    <p>{error}</p>
                    <button
                      onClick={fetchExpenses}
                      className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      Retry
                    </button>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-400">
                  {expenses.length === 0 ? "No expenses found." : "No expenses match your filters."}
                </td>
              </tr>
            ) : (
              filtered.map((expense) => (
                <tr
                  key={expense.id}
                  className="block border-b px-4 py-3 last:border-b-0 hover:bg-gray-50 sm:table-row sm:px-0 sm:py-0"
                >
                  <td className="flex items-center justify-between py-1 text-green-600 sm:table-cell sm:px-4 sm:py-3 sm:font-semibold">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400 sm:hidden">
                      Amount
                    </span>
                    {formatCurrency(expense.amount, expense.currency)}
                  </td>
                  <td className="flex items-center justify-between py-1 sm:table-cell sm:px-4 sm:py-3">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400 sm:hidden">
                      Category
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="flex items-center justify-between py-1 text-gray-600 sm:table-cell sm:px-4 sm:py-3">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400 sm:hidden">
                      Date
                    </span>
                    {(() => {
                      const dateInfo = formatDateInfo(expense.date, currentDate);
                      return (
                        <span className={dateInfo.isToday ? "font-medium text-green-600" : ""}>
                          {dateInfo.formatted}
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {filtered.length} of {expenses.length} expenses
        </div>
      ) : null}
    </Motion.div>
  );

  return theme === "dark" ? (
    <BorderGlow {...darkModeGlowProps}>{cardContent}</BorderGlow>
  ) : (
    cardContent
  );
}
