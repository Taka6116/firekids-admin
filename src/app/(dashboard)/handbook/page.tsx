import type { Metadata } from "next";

import { DashboardHandbook } from "@/content/DashboardHandbook";

export const metadata: Metadata = { title: "説明書" };

export default function HandbookPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-stone-900">説明書</h1>
      <DashboardHandbook />
    </div>
  );
}
