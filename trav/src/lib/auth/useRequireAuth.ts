"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthSession } from "@/features/auth/AuthSessionProvider";

type UseRequireAuthOptions = {
  /** Where anonymous visitors land (defaults to email rehearsal screen). */
  loginPath?: string;
};

/**
 * Lightweight gate for future screens — waits for hydration then redirects when no session exists.
 * Example: `const { user } = useRequireAuth()` inside a Client Component that should be members-only.
 */
export function useRequireAuth(options?: UseRequireAuthOptions) {
  const loginPath = options?.loginPath ?? "/login";
  const { user, isLoading, session } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(loginPath);
    }
  }, [isLoading, user, router, loginPath]);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: Boolean(user),
  };
}
