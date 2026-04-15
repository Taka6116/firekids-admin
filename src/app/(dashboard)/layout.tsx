import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth/server";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => fetchAuthSession(contextSpec),
  });

  if (!session.tokens?.idToken) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#F7F7F7] font-mincho text-foreground">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header />
        <main className="min-h-0 flex-1 overflow-auto bg-[#F7F7F7] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
