import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import BorderGlow from "./BorderGlow";
import { darkModeGlowProps } from "./borderGlowTheme";
import { useTheme } from "./ThemeContext";
import { fetchExpenses as fetchExpensesRequest } from "../utils/api";

export default function Reports() {
  const { theme } = useTheme();
  const [month, setMonth] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  useEffect(() => {
    fetchExpenses();

    const handleBackendRecovered = () => {
      fetchExpenses();
    };

    window.addEventListener("backendRecovered", handleBackendRecovered);

    return () => {
      window.removeEventListener("backendRecovered", handleBackendRecovered);
    };
  }, []);

  useEffect(() => {
    if (month) {
      const filtered = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        const selectedMonth = new Date(`${month}-01`);
        return (
          expenseDate.getFullYear() === selectedMonth.getFullYear() &&
          expenseDate.getMonth() === selectedMonth.getMonth()
        );
      });
      setFilteredExpenses(filtered);
      return;
    }

    setFilteredExpenses(expenses);
  }, [month, expenses]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await fetchExpensesRequest();
      setExpenses(data.expenses || []);
      setFilteredExpenses(data.expenses || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (filteredExpenses.length === 0) {
      alert("No expenses found for the selected period");
      return;
    }

    const headers = ["Date", "Category", "Amount", "Currency"];
    const csvContent = [
      headers.join(","),
      ...filteredExpenses.map((expense) =>
        [expense.date, expense.category, expense.amount, expense.currency || "INR"].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `expenses_${month || "all"}.csv`;
    link.click();
  };

  const downloadPDF = () => {
    if (filteredExpenses.length === 0) {
      alert("No expenses found for the selected period");
      return;
    }

    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const reportLabel = month || "All Time";
    const fileName = `expenses_${month || "all"}.pdf`;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 40;
    const headerY = 48;
    const rowHeight = 24;
    const colX = {
      date: marginX,
      category: 180,
      amount: 340,
      currency: 450,
    };
    let y = 110;

    const drawHeader = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("Expense Tracker Report", marginX, headerY);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Period: ${reportLabel}`, marginX, headerY + 22);
      doc.text(`Generated: ${new Date().toLocaleString()}`, marginX, headerY + 40);

      doc.setDrawColor(220, 220, 220);
      doc.line(marginX, 92, pageWidth - marginX, 92);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Date", colX.date, y);
      doc.text("Category", colX.category, y);
      doc.text("Amount", colX.amount, y);
      doc.text("Currency", colX.currency, y);

      y += 14;
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
    };

    drawHeader();

    filteredExpenses.forEach((expense) => {
      if (y > pageHeight - 70) {
        doc.addPage();
        y = 110;
        drawHeader();
      }

      doc.text(String(new Date(expense.date).toLocaleDateString()), colX.date, y);
      doc.text(String(expense.category || "-"), colX.category, y, { maxWidth: 140 });
      doc.text(`Rs.${Number(expense.amount || 0).toFixed(2)}`, colX.amount, y);
      doc.text(String(expense.currency || "INR"), colX.currency, y);
      y += rowHeight;
    });

    if (y > pageHeight - 70) {
      doc.addPage();
      y = 110;
    }

    doc.setDrawColor(220, 220, 220);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 24;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(
      `Total: Rs.${totalAmount.toFixed(2)} ${filteredExpenses[0]?.currency || "INR"}`,
      marginX,
      y
    );

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank", "noopener,noreferrer");

    const downloadLink = document.createElement("a");
    downloadLink.href = pdfUrl;
    downloadLink.download = fileName;
    downloadLink.click();

    window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
  };

  const cardContent = (
    <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white p-4 shadow sm:p-6">
      <h2 className="mb-6 text-xl font-semibold sm:text-2xl">Download Monthly Expenses</h2>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:flex-wrap">
        <input
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-auto"
          placeholder="Select month"
        />
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white shadow transition-colors hover:bg-blue-600 md:w-auto"
          onClick={downloadCSV}
          disabled={loading}
        >
          Download CSV
        </button>
        <button
          className="rounded bg-green-500 px-4 py-2 text-white shadow transition-colors hover:bg-green-600 md:w-auto"
          onClick={downloadPDF}
          disabled={loading}
        >
          Download PDF
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-blue-50 p-4">
          <h3 className="text-sm font-medium text-blue-600">Total Expenses</h3>
          <p className="text-2xl font-bold text-blue-900">{filteredExpenses.length}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <h3 className="text-sm font-medium text-green-600">Total Amount</h3>
          <p className="text-2xl font-bold text-green-900">
            Rs.{filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-purple-50 p-4">
          <h3 className="text-sm font-medium text-purple-600">Period</h3>
          <p className="text-2xl font-bold text-purple-900">{month || "All Time"}</p>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading expenses...</p>
        </div>
      ) : filteredExpenses.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="hidden bg-gray-50 sm:table-header-group">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredExpenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="block px-4 py-4 hover:bg-gray-50 sm:table-row sm:px-0 sm:py-0"
                >
                  <td className="flex items-center justify-between py-1 text-sm text-gray-900 sm:table-cell sm:px-6 sm:py-4 sm:whitespace-nowrap">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400 sm:hidden">
                      Date
                    </span>
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="flex items-center justify-between py-1 sm:table-cell sm:px-6 sm:py-4 sm:whitespace-nowrap">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400 sm:hidden">
                      Category
                    </span>
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="flex items-center justify-between py-1 text-sm font-medium text-gray-900 sm:table-cell sm:px-6 sm:py-4 sm:whitespace-nowrap">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400 sm:hidden">
                      Amount
                    </span>
                    Rs.{expense.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-gray-500">No expenses found for the selected period</p>
          <p className="mt-2 text-sm text-gray-400">
            Try selecting a different month or upload some receipts first
          </p>
        </div>
      )}
    </div>
  );

  return theme === "dark" ? (
    <BorderGlow {...darkModeGlowProps}>{cardContent}</BorderGlow>
  ) : (
    cardContent
  );
}
