import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Textarea } from "@/components/ui/Textarea";

export function CreatePostScreen() {
  return (
    <div className="space-y-6 px-4 pb-6 pt-4">
      <PageHeader
        title="Create a travel log"
        subtitle="Compose photos, captions, pins, or route notes."
      />

      <Textarea label="Thought preview (disabled demo)" hint="Publishing flow ties into Supabase next." placeholder="Morning hike + breakfast spot…" disabled />

      <EmptyState
        title="Composer blocks land here soon"
        description="Media carousel, tagging friends, pinning maps—the layout will assemble around this Trav textarea primitive."
      />
    </div>
  );
}
