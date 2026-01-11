"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, [pathname, router]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="flex items-center justify-center gap-2 text-black text-2xl font-employed">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen bg-white text-black">
      <Toaster dir="ltr" position="top-center" duration={700} />
      <div className="flex-1 overflow-hidden relative">{children}</div>
    </div>
  );
}
