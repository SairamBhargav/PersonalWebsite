"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";
import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

function ScrollReset() {
  const lenis = useLenis();
  const pathname = usePathname();
  // Keep Lenis' internal scroll target in sync after client-side navigation.
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname, lenis]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MotionConfig reducedMotion="user">
        {!reduced && (
          <ReactLenis root options={{ lerp: 0.1, anchors: { offset: -80 } }}>
            <ScrollReset />
          </ReactLenis>
        )}
        {children}
      </MotionConfig>
    </ThemeProvider>
  );
}
