import type { HTMLAttributes } from "react";

import { cx } from "@/lib/utils";

export type LoadingStateProps = HTMLAttributes<HTMLDivElement> & {
  /** Short sentence read by assistive tech while suspense loads. */
  message?: string;
};

/**
 * Centered spinner wired for suspense boundaries and slow network states.
 */
export function LoadingState({ message = "Loading…", className, ...props }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cx("flex flex-col items-center gap-4 py-14 text-neutral-700", className)}
      {...props}
    >
      <div
        className="size-10 animate-spin rounded-full border-4 border-neutral-200 border-t-primary shadow-sm shadow-primary/20"
        role="presentation"
        aria-hidden
      />
      <p className="text-sm font-medium text-neutral-600">{message}</p>
    </div>
  );
}
