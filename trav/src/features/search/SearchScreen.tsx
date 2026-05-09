import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export function SearchScreen() {
  return (
    <div className="space-y-6 px-4 pb-6 pt-4">
      <PageHeader
        title="Search"
        subtitle="Find places, itineraries, or travelers once search is wired up."
      />

      <EmptyState title="Nothing to search yet" description="Trending regions, trip tags, and friend filters plug in once data exists." />
    </div>
  );
}
