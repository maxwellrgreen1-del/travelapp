"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

type SavedLoadErrorProps = {
  message: string;
};

export function SavedLoadError({ message }: SavedLoadErrorProps) {
  const router = useRouter();

  return (
    <main className="pb-28 pt-2 sm:pt-5">
      <EmptyState
        title="Saved shelf did not sync"
        description={message}
        action={
          <Button type="button" variant="primary" size="md" onClick={() => router.refresh()}>
            Retry
          </Button>
        }
      />
    </main>
  );
}
