import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageTransitionBar } from "@/components/layout/PageTransitionBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F7F7F7] font-mincho text-foreground">
      <PageTransitionBar />
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header />
        <main className="page-fadein min-h-0 flex-1 overflow-auto bg-[#F7F7F7] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
