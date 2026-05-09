import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "@/lib/utils";

type BadgeTone = "neutral" | "primary" | "outline";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-neutral-100 text-neutral-800",
  primary: "bg-primary/15 text-emerald-900",
  outline: "border border-primary bg-white text-primary",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: BadgeTone;
};

/** Compact label for statuses, streaks, and trip tags on small screens. */
export function Badge({ children, tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
