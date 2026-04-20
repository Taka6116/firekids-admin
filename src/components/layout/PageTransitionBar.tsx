"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageTransitionBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(0);

    const t1 = setTimeout(() => setProgress(30), 50);
    const t2 = setTimeout(() => setProgress(60), 200);
    const t3 = setTimeout(() => setProgress(85), 500);
    const t4 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setVisible(false), 300);
    }, 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[9999] h-[2px]">
      <div
        className="h-full bg-[#8B0000] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 8px rgba(139, 0, 0, 0.6), 0 0 2px rgba(139, 0, 0, 0.4)",
        }}
      />
    </div>
  );
}
