import { DestinationPreviewCard } from "@/features/profile/components/DestinationPreviewCard";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ProfilePostGrid } from "@/features/profile/components/ProfilePostGrid";
import { ProfileStats } from "@/features/profile/components/ProfileStats";
import { TravelMapPreview } from "@/features/profile/components/TravelMapPreview";
import {
  mockAtlasPins,
  mockProfileTrailPosts,
  mockSavedDestinationBoard,
  mockTravelerSocial,
} from "@/features/profile/mockTravelerProfile";

export function ProfileScreen() {
  return (
    <div className="min-h-[100vh] bg-gradient-to-b from-[#fcfbf9] via-white to-neutral-50 text-neutral-900">
      <main className="space-y-9 px-4 pb-28 pt-6 sm:px-5">
        <ProfileHeader traveler={mockTravelerSocial} />

        <ProfileStats
          stats={{
            followersCount: mockTravelerSocial.followersCount,
            followingCount: mockTravelerSocial.followingCount,
            postsPublished: mockTravelerSocial.postsPublished,
          }}
          footnote="Numbers mock nightly sync — Supabase pulses land once auth ships."
        />

        <TravelMapPreview pins={mockAtlasPins} />

        <ProfilePostGrid posts={mockProfileTrailPosts} />

        <section aria-labelledby="saved-strip-heading" className="space-y-4 pb-8">
          <div className="space-y-1 px-2">
            <h2 id="saved-strip-heading" className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
              Saved destinations dossier
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-neutral-600">
              Pull-to-snap dossier mirrors what Instagram collections wish they felt like — cobalt coasts queued for remix.
            </p>
          </div>

          <div className="-mx-4 px-4 sm:-mx-5 sm:px-5">
            <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 pl-1 pr-6">
              {mockSavedDestinationBoard.map((hub) => (
                <li key={hub.id} className="snap-start">
                  <DestinationPreviewCard destination={hub} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
