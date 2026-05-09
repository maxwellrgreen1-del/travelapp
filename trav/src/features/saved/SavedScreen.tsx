import { SavedDestinationsExperience } from "@/features/saved/SavedDestinationsExperience";

export function SavedScreen() {
  return (
    <div className="min-h-[100vh] bg-gradient-to-b from-[#f4fbf1] via-white to-[#fcfbf9] text-neutral-900">
      <div className="mx-auto max-w-lg px-4 sm:max-w-xl sm:px-5">
        <SavedDestinationsExperience />
      </div>
    </div>
  );
}
