import Link from "next/link";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export function SettingsScreen() {
  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 py-8">
      <PageHeader title="Settings" subtitle="Notifications, accessibility, downloads, logout." />

      <EmptyState title="Panels loading soon" description="Toggle push paths, mute cities, tweak map exports." />

      <p className="text-center text-xs text-neutral-400">
        <Link href="/profile" className="underline underline-offset-4 hover:text-neutral-700">
          Back to profile
        </Link>
      </p>
    </div>
  );
}
