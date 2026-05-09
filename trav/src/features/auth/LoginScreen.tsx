import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";

export function LoginScreen() {
  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 py-8">
      <PageHeader title="Log in" subtitle="Authenticate with Trav once Supabase connects." />

      <form className="space-y-4">
        <Input
          disabled
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          placeholder="you@trailpath.com"
        />
        <Input
          disabled
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          placeholder="············"
        />
        <Button type="submit" variant="primary" fullWidth disabled>
          Continue soon
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-600">
        Need an account?{" "}
        <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
          Sign up
        </Link>
      </p>

      <p className="text-center text-xs text-neutral-400">
        <Link href="/" className="underline underline-offset-4 hover:text-neutral-700">
          Back to feed
        </Link>
      </p>
    </div>
  );
}
