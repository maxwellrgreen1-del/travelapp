import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useId } from "react";

import { cx } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
};

const fieldBaseClasses =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-base text-neutral-900 shadow-sm outline-none placeholder:text-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:pointer-events-none disabled:bg-neutral-100";

/** Mobile-friendly text field tuned for thumbs and clear focus rings. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, id: idProp, ...props },
  ref,
) {
  const uid = useId();
  const id = idProp ?? uid;

  const describedBy = cx(
    hint ? `${id}-hint` : false,
    error ? `${id}-error` : false,
  );

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-sm font-semibold text-neutral-800">
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={id}
        className={cx(fieldBaseClasses, error ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...props}
      />
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-neutral-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
