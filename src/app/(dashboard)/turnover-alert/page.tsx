import type { Metadata } from "next";

import { TurnoverAlertClient } from "./TurnoverAlertClient";

export const metadata: Metadata = { title: "回転率アラート" };

export default function TurnoverAlertPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-stone-900">回転率アラート</h1>
      <TurnoverAlertClient />
    </div>
  );
}
