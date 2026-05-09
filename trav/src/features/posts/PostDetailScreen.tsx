import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Id } from "@/types";

type PostDetailScreenProps = {
  id: Id;
};

export function PostDetailScreen({ id }: PostDetailScreenProps) {
  return (
    <div className="space-y-6 px-4 pb-6 pt-4">
      <PageHeader
        title="Travel log"
        subtitle={`Post id: ${id}. Once Supabase is connected we will hydrate this page from the database.`}
      />

      <EmptyState
        title="Media + itinerary blocks incoming"
        description="Think stacked photo carousel, tagged friends, expandable map stops, remix references."
      />
    </div>
  );
}
