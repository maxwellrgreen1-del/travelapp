import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";

export function SignupScreen() {
  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 py-8">
      <PageHeader title="Create account" subtitle="Starter fields will land here shortly." />

      <form className="space-y-4">
        <Input disabled label="Trail name" name="handle" placeholder="wanderlust-tj" hint="Letters, dots, underscores only soon." />
        <Input disabled label="Email" name="signup-email" type="email" placeholder="trail@planet.com" />
        <Button type="submit" variant="outlinePrimary" fullWidth disabled>
          Preview signup shell
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-600">
        Already onboard?{" "}
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
