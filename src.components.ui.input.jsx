import React from "react";

export function Input({ value, onChange, placeholder = "", type = "text", className = "", ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-zinc-300 rounded outline-none focus:ring-2 focus:ring-emerald-400 ${className}`}
      {...props}
    />
  );
}
