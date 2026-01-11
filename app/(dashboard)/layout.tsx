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

  return (
    <div className="relative flex flex-col h-screen bg-background text-foreground">
      <Toaster dir="ltr" position="top-center" duration={700} />
      <div className="flex-1 overflow-hidden relative">{children}</div>
    </div>
  );
}
