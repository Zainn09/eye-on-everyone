"use client"

import type { StatusTagConfig } from "@/types/platform"

interface StatusTagProps {
  tag: StatusTagConfig | null
}

export function StatusTag({ tag }: StatusTagProps) {
  if (!tag || !tag.label) return null

  return (
    <span
      className="badge"
      style={{
        color: tag.color,
        background: tag.bgColor,
        border: `1px solid ${tag.color}40`,
        fontWeight: 600,
        fontSize: "0.68rem",
        letterSpacing: "0.04em",
        padding: "0.15rem 0.5rem",
        borderRadius: "var(--radius-full, 9999px)",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        whiteSpace: "nowrap",
      }}
    >
      {tag.label === "Blocked" && "🚫"}
      {tag.label === "Overdue" && "⏰"}
      {tag.label === "Needs Assistance" && "⚠️"}
      {tag.label === "In Review" && "👁"}
      {tag.label === "Pending" && "⏳"}
      {tag.label}
    </span>
  )
}
