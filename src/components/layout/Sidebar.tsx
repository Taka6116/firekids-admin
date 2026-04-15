import { SidebarNav } from "@/components/layout/SidebarNav";

export function Sidebar() {
  return (
    <aside className="no-print flex w-[240px] shrink-0 flex-col border-r border-border bg-card px-3 py-6 print:hidden">
      <div className="mb-8 px-2 font-brand text-sm font-semibold tracking-tight text-[#8B0000]">
        FIRE KIDS
      </div>
      <SidebarNav />
    </aside>
  );
}
