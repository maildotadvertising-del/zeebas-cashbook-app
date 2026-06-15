"use client";
import dynamic from "next/dynamic";

const ReportsCharts = dynamic(() => import("@/components/ReportsCharts"), { ssr: false });

export default function ReportsChartsWrapper() {
  return <ReportsCharts />;
}
