import Link from "next/link";

import { Button, buttonClassName } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";

export function OnboardingScreen() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-10 px-4 py-8">
      <PageHeader
        title="Welcome to Trav"
        subtitle="A three-step onboarding carousel will greet new travelers soon."
      />

      <div className="rounded-3xl bg-neutral-50 p-8 text-center text-sm leading-relaxed text-neutral-600 shadow-inner shadow-black/10">
        While we wire onboarding, Trav already shares the spinner below for slow Supabase hops.
      </div>

      <LoadingState message="Preparing onboarding tour…" />

      <Button variant="ghost" disabled className="w-full">
        Swipe placeholders coming next sprint
      </Button>

      <Link href="/" className={buttonClassName({ variant: "primary", size: "lg", fullWidth: true })}>
        Skip for now → feed preview
      </Link>
    </div>
  );
}
