import React from "react";

export function Progress({ value = 0, className = "" }) {
  return (
    <div className={`w-full h-2 bg-zinc-200 rounded ${className}`}>
      <div
        className="h-2 bg-emerald-500 rounded"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
