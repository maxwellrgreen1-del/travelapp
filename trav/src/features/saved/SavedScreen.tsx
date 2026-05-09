import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export function SavedScreen() {
  return (
    <div className="space-y-6 px-4 pb-6 pt-4">
      <PageHeader title="Saved" subtitle="Keeps itineraries, eateries, hikes, hosts, maps you loved." />

      <EmptyState
        title="No saved drops yet"
        description="Bookmark a trip recap or map pack and Trav will tuck it neatly into this stash."
      />
    </div>
  );
}
