"use client"

import Link from "next/link"
import { ListChecks } from "lucide-react"
import type { ChecklistSummaryWidgetProps } from "@/types/platform"

function completionPct(items: { completed: boolean }[]): number {
  if (items.length === 0) return 0
  return Math.round((items.filter(i => i.completed).length / items.length) * 100)
}

export function ChecklistSummaryWidget({ checklists }: ChecklistSummaryWidgetProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="font-semibold" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}>
          <ListChecks size={16} style={{ color: "#a78bfa" }} />
          Checklists
        </h3>
        <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
          {checklists.length} total
        </span>
      </div>

      <div className="card-body" style={{ padding: 0, maxHeight: "320px", overflowY: "auto" }}>
        {checklists.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
            <ListChecks size={32} style={{ margin: "0 auto 0.5rem", opacity: 0.3 }} />
            <div style={{ fontSize: "0.82rem" }}>No checklists yet</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {checklists.map(checklist => {
              const pct = completionPct(checklist.items)
              const row = (
                <div style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid var(--color-border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                  transition: "background 0.12s",
                }}
                  className="checklist-widget-row"
                >
                  {/* Title + project label */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {checklist.title}
                    </span>
                    <span style={{
                      fontSize: "0.68rem",
                      color: checklist.projectId ? "#a78bfa" : "var(--color-text-muted)",
                      background: checklist.projectId ? "rgba(139,92,246,0.1)" : "rgba(107,114,128,0.1)",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "9999px",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}>
                      {checklist.projectName ?? "Global"}
                    </span>
                  </div>

                  {/* Progress bar + percentage */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div className="progress progress-sm" style={{ flex: 1 }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${pct}%`,
                          background: pct === 100
                            ? "linear-gradient(90deg, #10b981, #34d399)"
                            : "linear-gradient(90deg, #8b5cf6, #a78bfa)",
                        }}
                      />
                    </div>
                    <span style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      minWidth: "32px",
                      textAlign: "right",
                      color: pct === 100 ? "#34d399" : "var(--color-text-secondary)",
                    }}>
                      {pct}%
                    </span>
                  </div>
                </div>
              )

              // Project-linked: wrap in Link for navigation
              if (checklist.projectId) {
                return (
                  <Link key={checklist.id} href={`/projects/${checklist.projectId}`} style={{ display: "block" }}>
                    {row}
                  </Link>
                )
              }

              return <div key={checklist.id}>{row}</div>
            })}
          </div>
        )}
      </div>

      <style>{`
        .checklist-widget-row:hover {
          background: var(--color-bg-elevated);
        }
        .checklist-widget-row:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  )
}
