import Link from "next/link";

import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonClassName } from "@/components/ui/Button";

export function ProfileScreen() {
  return (
    <div className="space-y-6 px-4 pb-6 pt-4">
      <PageHeader title="Your profile" subtitle="Avatar, traveler bio, and pin map live here soon." />

      <div className="flex items-center gap-4">
        <Avatar initials="TJ" alt="Placeholder traveler avatar" size="lg" />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-neutral-900">Travel Journalist</p>
          <p className="text-sm text-neutral-600">@placeholder · joined soon</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/profile/edit" className={buttonClassName({ variant: "primary", size: "md" })}>
          Edit profile
        </Link>
        <Link href="/settings" className={buttonClassName({ variant: "secondary", size: "md" })}>
          Settings
        </Link>
      </div>

      <EmptyState title="Trail highlights populate here" description="Pins, playlists, recap posts, collaborators." />
    </div>
  );
}
