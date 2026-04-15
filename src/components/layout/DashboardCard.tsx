import * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const dashboardSurface =
  "border-0 bg-white shadow-sm ring-1 ring-slate-200/90 transition-shadow duration-200 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:shadow-sm";

export function DashboardCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return <Card className={cn(dashboardSurface, className)} {...props} />;
}
