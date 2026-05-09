import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import { cx } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outlinePrimary";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-md shadow-primary/25 hover:brightness-95 active:brightness-90 disabled:pointer-events-none",
  secondary:
    "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 disabled:pointer-events-none",
  ghost: "text-neutral-800 hover:bg-neutral-100 disabled:pointer-events-none",
  outlinePrimary:
    "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 disabled:pointer-events-none",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm rounded-xl gap-2",
  md: "min-h-11 px-4 text-sm rounded-xl gap-2",
  lg: "min-h-12 px-5 text-base rounded-2xl gap-2",
};

const baseClasses =
  "inline-flex cursor-pointer items-center justify-center font-semibold outline-none ring-primary/30 transition disabled:opacity-50 focus-visible:ring-4";

type ButtonClassComposer = Pick<ButtonProps, "variant" | "size" | "fullWidth" | "className">;

/** Share tript button sizing with `<Link>` or custom elements when you can't use `<Button>`. */
export function buttonClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonClassComposer): string {
  return cx(baseClasses, variantClasses[variant], sizeClasses[size], fullWidth ? "w-full" : "", className);
}

/**
 * Buttons use tript's primary `#85BB65` by default (`variant="primary"`).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", fullWidth = false, className, disabled, type, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      disabled={disabled}
      className={buttonClassName({ variant, size, fullWidth, className })}
      {...props}
    />
  );
});
