"use client";

import { LoadingState } from "@/components/ui/LoadingState";
import { CreatePostForm } from "@/features/create/CreatePostForm";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";

export function CreatePostScreen() {
  const { user, isLoading } = useRequireAuth();

  if (isLoading || !user) {
    return (
      <div className="min-h-[100vh] bg-gradient-to-b from-neutral-50 via-white to-neutral-50 text-neutral-900">
        <div className="px-3 pb-10 pt-6 sm:px-4">
          <LoadingState message="Checking your traveller session…" className="py-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-neutral-50 via-white to-neutral-50 text-neutral-900">
      <CreatePostForm user={user} />
    </div>
  );
}
