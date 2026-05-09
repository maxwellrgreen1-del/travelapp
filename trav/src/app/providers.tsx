"use client";

import type { ReactNode } from "react";

import { AuthSessionProvider } from "@/features/auth/AuthSessionProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
