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
        [
          expense.date,
          expense.category,
          expense.amount,
          expense.currency || "INR",
        ].join(",")
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
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-semibold mb-6">Download Monthly Expenses</h2>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:flex-wrap">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-auto"
          placeholder="Select month"
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow transition-colors md:w-auto"
          onClick={downloadCSV}
          disabled={loading}
        >
          Download CSV
        </button>
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow transition-colors md:w-auto"
          onClick={downloadPDF}
          disabled={loading}
        >
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600">Total Expenses</h3>
          <p className="text-2xl font-bold text-blue-900">{filteredExpenses.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-600">Total Amount</h3>
          <p className="text-2xl font-bold text-green-900">
            Rs.{filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-600">Period</h3>
          <p className="text-2xl font-bold text-purple-900">{month || "All Time"}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading expenses...</p>
        </div>
      ) : filteredExpenses.length > 0 ? (
        <div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Rs.{expense.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No expenses found for the selected period</p>
          <p className="text-sm text-gray-400 mt-2">
            Try selecting a different month or upload some receipts first
          </p>
        </div>
      )}
    </div>
  );

  return theme === "dark" ? (
    <BorderGlow {...darkModeGlowProps}>
      {cardContent}
    </BorderGlow>
  ) : (
    cardContent
  );
}
