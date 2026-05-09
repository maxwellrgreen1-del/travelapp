import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";

export function ProfileEditScreen() {
  return (
    <div className="space-y-6 px-4 pb-6 pt-4">
      <PageHeader
        title="Edit profile"
        subtitle="Name, traveler tagline, timezone, pinned places."
        trailing={
          <Link
            href="/profile"
            className="rounded-xl px-2 py-1 text-sm font-semibold text-primary underline-offset-4 outline-none ring-primary/30 hover:underline focus-visible:ring-4"
          >
            Done
          </Link>
        }
        showBackNavigation={false}
      />

      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-600">
        Form stack placeholder · swap for Trav `Input` fields next.
      </div>
    </div>
  );
}
