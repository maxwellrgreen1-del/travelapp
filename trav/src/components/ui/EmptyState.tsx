import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { cx } from "@/lib/utils";

export type EmptyStateProps = {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  /** Primary call-to-action (usually a Trav `Button` or `next/link`). */
  action?: ReactNode;
  className?: string;
};

/** Friendly blocker when timelines, bookmarks, or search results render nothing yet. */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <Card
      aria-live="polite"
      tone="muted"
      padding="lg"
      className={cx("text-center shadow-none", className)}
    >
      {icon ? <div className="mb-4 flex justify-center text-primary">{icon}</div> : null}
      <p className="text-base font-semibold text-neutral-900">{title}</p>
      {description ? <div className="mt-2 text-sm leading-relaxed text-neutral-600">{description}</div> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </Card>
  );
}
