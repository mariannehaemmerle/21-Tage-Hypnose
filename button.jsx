import React from "react";

export function Button({ children, type = "button", onClick, variant = "primary", className = "" }) {
  const styles = {
    primary: "px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700",
    secondary: "px-3 py-2 rounded bg-zinc-200 hover:bg-zinc-300",
    outline: "px-3 py-2 rounded border border-zinc-300 hover:bg-zinc-100",
    destructive: "px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600"
  };

  return (
    <button type={type} onClick={onClick} className={`${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}
