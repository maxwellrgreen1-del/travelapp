import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export function NotificationsScreen() {
  return (
    <div className="space-y-6 px-4 pb-6 pt-4">
      <PageHeader
        title="Notifications"
        subtitle="Mentions, friend requests, remix invites arrive here eventually."
      />

      <EmptyState
        title="You are all caught up"
        description="New likes, collaborator edits, host replies, map invites—each will land on this muted panel."
      />
    </div>
  );
}
