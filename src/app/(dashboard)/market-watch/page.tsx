import type { Metadata } from "next";

import { MarketWatchClient } from "./MarketWatchClient";

export const metadata: Metadata = { title: "市場価格ウォッチ" };

export default function MarketWatchPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-stone-900">市場価格ウォッチ</h1>
      <MarketWatchClient />
    </div>
  );
}
