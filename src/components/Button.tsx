import * as React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500 disabled:bg-blue-400",
  secondary:
    "bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-400",
  outline:
    "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 focus-visible:ring-blue-500 disabled:border-slate-200 disabled:text-slate-300",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400 disabled:text-slate-300",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-400",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs gap-1.5",
  md: "h-11 px-4 py-2 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
};

const Spinner = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    className={`animate-spin ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      type = "button",
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading}
        className={[
          "inline-flex select-none items-center justify-center rounded-lg font-medium transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {loading ? (
          <>
            <Spinner />
            <span>{loadingText ?? children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
