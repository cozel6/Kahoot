import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm";
}

export function Button({ variant = "primary", size, className, children, ...rest }: ButtonProps) {
  const cls = ["btn", `btn--${variant}`, size === "sm" ? "btn--sm" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
