import Link from "next/link";
import type { ReactNode } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { MockTravelerSocialProfile } from "@/features/profile/mockTravelerProfile";
import { cx } from "@/lib/utils";

type ProfileHeaderProps = {
  traveler: MockTravelerSocialProfile;
  /** `visitor` swaps edit/settings for `visitorActions` (e.g. Follow). */
  variant?: "self" | "visitor";
  visitorActions?: ReactNode;
  editHref?: string;
  settingsHref?: string;
  heroEyebrow?: string;
  className?: string;
};

/** Narrative-heavy identity capsule layered like a dusk passport spread. */
export function ProfileHeader({
  traveler,
  variant = "self",
  visitorActions,
  editHref = "/profile/edit",
  settingsHref = "/settings",
  heroEyebrow = "Wayfinding soul",
  className,
}: ProfileHeaderProps) {
  return (
    <Card
      tone="muted"
      padding="lg"
      className={cx("relative isolate overflow-hidden border-transparent bg-transparent shadow-none", className)}
    >
      <div className="relative isolate overflow-hidden rounded-[32px] border border-white/35 bg-neutral-950 shadow-[0_35px_80px_-50px_rgba(15,118,110,1)] ring-1 ring-white/55">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/65 via-transparent to-transparent" />

        <div aria-hidden className="pointer-events-none absolute inset-x-[-20%] bottom-[-30%] h-[460px] rounded-full bg-primary/55 blur-[150px]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-[-10%] top-[-15%] h-[520px] rounded-full bg-teal-500/55 blur-[150px]" />
        <div className="absolute inset-x-6 top-[18%] h-48 rounded-[40px] border border-white/15 bg-black/55 blur-3xl" aria-hidden />

        <div className="relative space-y-6 px-6 pb-7 pt-7 text-white sm:px-7 sm:pb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <Badge
                tone="neutral"
                className="border-white/35 bg-black/55 text-[10px] font-semibold uppercase tracking-[0.45em] text-white/92"
              >
                {heroEyebrow}
              </Badge>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/82">{traveler.memberSinceCopy}</p>
            </div>
            <Badge tone="primary" className="border-transparent bg-white/95 text-neutral-950">
              Field verified
            </Badge>
          </div>

          <div className="flex flex-wrap items-start gap-5">
            <Avatar
              size="lg"
              className="size-[94px] border-[4px] border-white shadow-2xl shadow-black/85 sm:size-[106px]"
              initials={traveler.initialsFallback}
              src={traveler.avatarUrl}
              alt={traveler.avatarAlt}
            />

            <div className="min-w-0 flex-1 space-y-4">
              <div className="space-y-2">
                <h1 className="text-[32px] font-semibold tracking-tight text-white drop-shadow-[0_24px_40px_rgba(0,0,0,0.38)]">
                  {traveler.displayName}
                </h1>
                <p className="text-[16px] font-semibold tracking-tight text-primary drop-shadow-[0_12px_25px_rgba(0,0,0,0.45)]">
                  @{traveler.username}
                </p>
              </div>
              <p className="text-[15px] leading-relaxed text-white/90 sm:max-w-2xl">{traveler.bio}</p>

              {variant === "visitor" && visitorActions ? (
                <div className="flex flex-wrap gap-3 pt-1">{visitorActions}</div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={editHref}
                    className={buttonClassName({
                      variant: "primary",
                      size: "md",
                      fullWidth: true,
                      className: "shadow-lg shadow-neutral-950/65 sm:flex-1 sm:min-w-[165px]",
                    })}
                  >
                    Edit profile
                  </Link>
                  <Link
                    href={settingsHref}
                    className={buttonClassName({
                      variant: "secondary",
                      size: "md",
                      fullWidth: true,
                      className:
                        "border-white/55 bg-transparent text-white shadow-none hover:bg-white/12 sm:flex-1 sm:min-w-[165px]",
                    })}
                  >
                    Settings
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
