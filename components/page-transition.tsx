import { ViewTransition } from "react";

/** Wrap each page's content so route changes fade/rise instead of cutting. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
