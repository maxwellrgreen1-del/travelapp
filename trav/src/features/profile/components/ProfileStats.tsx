import { formatSocialCount } from "@/lib/formatSocialCount";
import { cx } from "@/lib/utils";

export type ProfileStatsPayload = {
  followersCount: number;
  followingCount: number;
  postsPublished: number;
};

type ProfileStatKey = keyof ProfileStatsPayload;

type ProfileStat = {
  id: ProfileStatKey;
  eyebrow: string;
  helper: string;
};

const blueprint: ProfileStat[] = [
  { id: "postsPublished", eyebrow: "Stories", helper: "field logs" },
  { id: "followersCount", eyebrow: "Dreamers", helper: "watching arcs" },
  { id: "followingCount", eyebrow: "Hosts", helper: "you uplift" },
];

type ProfileStatsProps = {
  stats: ProfileStatsPayload;
  footnote?: string;
  className?: string;
};

/** Three tactile stat columns that feel like etched compass ticks. */
export function ProfileStats({ stats, footnote, className }: ProfileStatsProps) {
  return (
    <section aria-label="Travel engagement stats" className={cx("space-y-4", className)}>
      <div className="rounded-[28px] border border-neutral-200/85 bg-white/94 p-[1px] shadow-[0_25px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur">
        <ul className="grid grid-cols-3 divide-x divide-neutral-100 rounded-[inherit] px-2 py-5 text-center sm:py-6">
          {blueprint.map((slot) => (
            <li key={slot.id} className="px-3 py-2">
              <StatColumn eyebrow={slot.eyebrow} helper={slot.helper}>
                {formatSocialCount(stats[slot.id])}
              </StatColumn>
            </li>
          ))}
        </ul>
      </div>

      {footnote ? (
        <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-neutral-400">{footnote}</p>
      ) : null}
    </section>
  );
}

function StatColumn({
  children,
  eyebrow,
  helper,
}: {
  children: string;
  eyebrow: string;
  helper: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/95">{eyebrow}</p>
      <p className="text-3xl font-semibold tabular-nums tracking-tight text-neutral-950">{children}</p>
      <p className="text-[13px] text-neutral-600">{helper}</p>
    </div>
  );
}
