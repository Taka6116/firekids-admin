import type { Metadata } from "next";
import { Inter, Noto_Sans_JP, Noto_Serif_JP, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
  preload: false,
});

/** ログイン等の見出し用（セリフ・ラグジュアリー寄り） */
const notoSerifJp = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
  preload: false,
});

/** 英字ブランド名用 */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-brand",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "FIRE KIDS 仕入れ補助",
  description: "社内向け仕入れ補助ツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={cn(
        inter.variable,
        notoSansJp.variable,
        notoSerifJp.variable,
        playfair.variable,
        "antialiased",
      )}
    >
      <body className="min-h-screen bg-background font-sans text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
