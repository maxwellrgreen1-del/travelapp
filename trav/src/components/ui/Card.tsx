import type { HTMLAttributes } from "react";

import { cx } from "@/lib/utils";

type CardPadding = "none" | "sm" | "md" | "lg";

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

type CardTone = "default" | "muted";

const toneClasses: Record<CardTone, string> = {
  default: "border-neutral-200 bg-white",
  muted: "border-neutral-100 bg-neutral-50",
};

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Inner padding presets so cards stay roomy on phones. */
  padding?: CardPadding;
  tone?: CardTone;
};

/** Simple surface primitive for stacks, placeholders, feed tiles, forms. */
export function Card({
  padding = "md",
  tone = "default",
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cx(
        "rounded-2xl border shadow-sm shadow-black/5",
        toneClasses[tone],
        paddingClasses[padding],
        className,
      )}
      {...props}
    />
  );
}
