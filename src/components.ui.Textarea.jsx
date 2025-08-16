import React from "react";

export function Textarea({ value, onChange, placeholder = "", className = "", ...props }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-zinc-300 rounded resize-none outline-none focus:ring-2 focus:ring-emerald-400 ${className}`}
      {...props}
    />
  );
}
