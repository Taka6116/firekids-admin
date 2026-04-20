import type { Metadata } from "next";

import { UnrealizedGainClient } from "./UnrealizedGainClient";

export const metadata: Metadata = { title: "含み益トラッカー" };

export default function UnrealizedGainPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-stone-900">含み益トラッカー</h1>
      <UnrealizedGainClient />
    </div>
  );
}
