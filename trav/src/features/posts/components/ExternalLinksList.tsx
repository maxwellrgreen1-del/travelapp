import { Badge } from "@/components/ui/Badge";
import { cx } from "@/lib/utils";

type ExternalLinksListProps = {
  links: { label: string; url: string }[];
  className?: string;
};

export function ExternalLinksList({ links, className }: ExternalLinksListProps) {
  if (!links.length) {
    return null;
  }

  return (
    <section aria-labelledby="external-links-heading" className={cx("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <h2 id="external-links-heading" className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
          External breadcrumbs
        </h2>
        <Badge tone="neutral" className="text-[10px] font-semibold">
          Opens securely in a fresh tab · mock-only anchors
        </Badge>
      </div>
      <ul className="space-y-[10px]" role="list">
        {links.map((link, idx) => (
          <li key={`${idx}-${link.label}-${link.url}`}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
              className={cx(
                "flex flex-col gap-2 rounded-[20px] border border-neutral-200/90 px-[18px] py-[13px]",
                "text-neutral-950 outline-none ring-primary/35 transition hover:border-primary/80 hover:bg-primary/5 hover:text-primary focus-visible:ring-4",
              )}
            >
              <span className="text-[16px] font-semibold">{link.label}</span>
              <span className="break-all text-[13px] text-neutral-500">{link.url}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
