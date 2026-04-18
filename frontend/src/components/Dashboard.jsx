import React from "react";
import { motion as Motion } from "framer-motion";
import UploadCard from "./UploadCard";
import ExpenseTable from "./ExpenseTable";
import PieChartCard from "./PieChartCard";
import LineChartCard from "./LineChartCard";
import BudgetProgressCard from "./BudgetProgressCard";

export default function Dashboard() {
  const cards = [
    { key: "upload", content: <UploadCard /> },
    { key: "pie", content: <PieChartCard /> },
    { key: "table", content: <ExpenseTable />, className: "lg:col-span-2" },
    { key: "line", content: <LineChartCard /> },
    { key: "budget", content: <BudgetProgressCard /> },
  ];

  return (
    <Motion.div
      className="mx-auto mb-6 grid w-full max-w-7xl grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
    >
      {cards.map((card) => (
        <Motion.div
          key={card.key}
          className={card.className || ""}
          variants={{
            hidden: { opacity: 0, y: 18 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          {card.content}
        </Motion.div>
      ))}
    </Motion.div>
  );
}
