"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Amplify } from "aws-amplify";
import { useState } from "react";

import { Toaster } from "@/components/ui/sonner";
import { getAmplifyResourcesConfig } from "@/lib/amplify-config";

export function AppProviders({ children }: { children: React.ReactNode }) {
  if (typeof window !== "undefined") {
    Amplify.configure(getAmplifyResourcesConfig(), { ssr: true });
  }

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
