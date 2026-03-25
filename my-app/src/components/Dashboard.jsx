import React from "react";
import { motion as Motion } from "framer-motion";
import UploadCard from "./UploadCard";
import ExpenseTable from "./ExpenseTable";
import PieChartCard from "./PieChartCard";
import LineChartCard from "./LineChartCard";
import BudgetProgressCard from "./BudgetProgressCard";

export default function Dashboard() {
  return (
    <Motion.div
      className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6"
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
      {[<UploadCard key="upload" />, <PieChartCard key="pie" />, <ExpenseTable key="table" />, <LineChartCard key="line" />, <BudgetProgressCard key="budget" />].map((card) => (
        <Motion.div
          key={card.key}
          variants={{
            hidden: { opacity: 0, y: 18 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          {card}
        </Motion.div>
      ))}
    </Motion.div>
  );
}
