"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";

import { cx } from "@/lib/utils";

type AuthOAuthRowProps = {
  /** Announced beside the SSO mock rail. */
  contextLabel: string;
};

/**
 * Apple / Google scaffold — clickable but mock-only (friendly inline notice).
 */
export function AuthOAuthRow({ contextLabel }: AuthOAuthRowProps) {
  const [notice, setNotice] = useState<string | null>(null);

  const showSoon = useCallback(() => {
    setNotice("Passport sign-in launches with Trav’s SSO drop — maps & mail still mocking for now.");
  }, []);

  return (
    <div className="space-y-5">
      <div className="relative flex items-center justify-center px-10">
        <span className="w-full shrink border-t border-neutral-200/95" aria-hidden />
        <span className="-mx-[10px] shrink-0 bg-white px-[14px] text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
          {contextLabel}
        </span>
        <span className="w-full shrink border-t border-neutral-200/95" aria-hidden />
      </div>

      <div className="grid grid-cols-2 gap-[10px]">
        <SsoGhostButton glyph={<AppleGlyph />} label="Apple" ariaLabel="Continue with Apple (coming soon)" onPress={showSoon} />
        <SsoGhostButton glyph={<GoogleGlyph />} label="Google" ariaLabel="Continue with Google (coming soon)" onPress={showSoon} />
      </div>

      {notice ? (
        <p
          role="status"
          className={cx(
            "rounded-2xl border border-primary/30 bg-primary/10 px-[14px] py-3 text-center text-[13px] font-medium leading-relaxed text-neutral-800",
          )}
        >
          {notice}
        </p>
      ) : (
        <p className="text-center text-[12px] text-neutral-500">SSO docks here — practise email flow today.</p>
      )}
    </div>
  );
}

function SsoGhostButton({
  glyph,
  label,
  ariaLabel,
  onPress,
}: {
  glyph: ReactNode;
  label: string;
  ariaLabel: string;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onPress}
      className={cx(
        "flex items-center justify-center gap-3 rounded-[18px] border border-neutral-200/92 bg-white/97 px-[14px] py-[13px]",
        "text-[14px] font-semibold text-neutral-800 shadow-[0_10px_28px_-12px_rgba(15,15,22,0.22)] backdrop-blur",
        "outline-none ring-primary/30 transition hover:border-primary/45 hover:shadow-xl hover:shadow-primary/12 focus-visible:ring-4",
        "active:brightness-[0.98]",
      )}
    >
      <span aria-hidden className="flex shrink-0 items-center">{glyph}</span>
      <span>{label}</span>
    </button>
  );
}

function AppleGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.364 13.008c-.03-3 2.489-4.446 2.594-4.519-1.429-2.086-3.642-2.363-4.397-2.373-1.835-.206-3.627 1.122-4.582 1.122-.974 0-2.446-1.104-4.036-1.072-2.063.029-4 1.266-5.069 3.173-2.207 3.834-.564 9.489 1.561 12.596 1.069 1.581 2.318 3.348 4.019 3.282 1.623-.069 2.231-1.078 4.219-1.078 1.969 0 2.547 1.078 4.267 1.037 1.769-.029 2.892-1.621 3.942-3.229 1.272-1.815 1.783-3.579 1.817-3.674-.036-.019-3.489-1.373-3.518-5.459zM13.924 6.758c.875-1.091 1.481-2.579 1.318-4.086-1.295.054-2.917.892-3.849 1.957-.783.896-1.486 2.373-1.303 3.759 1.408.098 2.865-.709 3.834-2.63z" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
