import type { ReactNode } from "react";

type TouchButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
};

export function TouchButton({
  children,
  onClick,
  variant = "secondary",
  disabled = false
}: TouchButtonProps) {
  const className =
    variant === "primary"
      ? "button-primary"
      : variant === "danger"
        ? "button-danger"
        : "button-secondary";

  return (
    <button
      className={className}
      disabled={disabled}
      onClick={onClick}
      style={{
        minHeight: 46,
        minWidth: 46,
        opacity: disabled ? 0.42 : 1
      }}
      type="button"
    >
      {children}
    </button>
  );
}
