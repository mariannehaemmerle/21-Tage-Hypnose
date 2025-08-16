import React from "react";
export function Button({ children, type="button", onClick, variant="primary", className="" }) {
  const style = { cursor:"pointer", padding:"10px 14px", borderRadius:8, border:"1px solid #ddd",
                  background: variant==="primary" ? "#10b981" : "#eee", color: variant==="primary" ? "#fff" : "#111" };
  return <button type={type} onClick={onClick} style={style} className={className}>{children}</button>;
}
