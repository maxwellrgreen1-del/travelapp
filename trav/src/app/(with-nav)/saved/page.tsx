import { redirect } from "next/navigation";

import { SavedScreen } from "@/features/saved/SavedScreen";
import { SavedDestinationsExperience } from "@/features/saved/SavedDestinationsExperience";
import { SavedLoadError } from "@/features/saved/SavedLoadError";
import { loadSavedDestinationPinsForUser } from "@/features/saved/loadSavedDestinationPins";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await loadSavedDestinationPinsForUser(supabase, user.id);

  if (!result.ok) {
    return (
      <SavedScreen>
        <SavedLoadError message={result.message} />
      </SavedScreen>
    );
  }

  return (
    <SavedScreen>
      <SavedDestinationsExperience initialPins={result.pins} />
    </SavedScreen>
  );
}
