"use client"

import { useState, useRef, useEffect } from "react"
import {
  Palette, CheckCircle2, ThumbsUp, Code, Bug, Monitor, Rocket,
  AlertTriangle, RotateCcw, ZoomIn, ZoomOut, Maximize2
} from "lucide-react"
import { PHASES_ORDER, type Phase } from "@/lib/workflow"
import { getPhaseLabel, getPhaseColor } from "@/lib/utils"
import type { WorkflowDiagramProps, PhaseNodeData } from "@/types/platform"

const PHASE_ICONS: Record<Phase, React.ReactNode> = {
  DESIGN: <Palette size={18} />,
  DESIGN_QA: <CheckCircle2 size={18} />,
  DESIGN_APPROVAL: <ThumbsUp size={18} />,
  DEVELOPMENT: <Code size={18} />,
  DEV_QA: <Bug size={18} />,
  CLIENT_PREVIEW: <Monitor size={18} />,
  DELIVERED: <Rocket size={18} />,
}

const MS_PER_DAY = 86_400_000

/**
 * Pure function: builds phase node data from project activities and revisions.
 * Returns one PhaseNodeData per phase in PHASES_ORDER.
 */
export function buildPhaseNodeData(
  activities: Array<{ action: string; details: string | null; createdAt: Date | string }>,
  revisions: Array<{ type: string; createdAt: Date | string }>,
  currentPhase: string,
  status: string,
  skippedDesignQA: boolean
): PhaseNodeData[] {
  const currentIdx = PHASES_ORDER.indexOf(currentPhase as Phase)

  // Count phase occurrences (cycle detection)
  const phaseCounts: Record<string, number> = {}
  for (const activity of activities) {
    if (activity.action === "phase_changed" && activity.details) {
      const match = activity.details.match(/to (\w+)/)
      if (match) {
        const toPhase = match[1]
        phaseCounts[toPhase] = (phaseCounts[toPhase] || 0) + 1
      }
    }
  }

  // Compute avg days per phase from consecutive phase_changed activities
  const phaseChanges = activities
    .filter(a => a.action === "phase_changed")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const phaseDurations: Record<string, number[]> = {}
  for (let i = 1; i < phaseChanges.length; i++) {
    const prev = phaseChanges[i - 1]
    const curr = phaseChanges[i]
    const days = (new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime()) / MS_PER_DAY
    const match = prev.details?.match(/from (\w+) to/)
    if (match) {
      const fromPhase = match[1]
      if (!phaseDurations[fromPhase]) phaseDurations[fromPhase] = []
      phaseDurations[fromPhase].push(days)
    }
  }

  // Count revisions per phase group
  const revisionCounts: Record<string, number> = {
    DESIGN: 0,
    DESIGN_QA: 0,
    DESIGN_APPROVAL: 0,
    DEVELOPMENT: 0,
    DEV_QA: 0,
    CLIENT_PREVIEW: 0,
    DELIVERED: 0,
  }
  for (const rev of revisions) {
    if (rev.type === "design") {
      revisionCounts.DESIGN++
      revisionCounts.DESIGN_QA++
      revisionCounts.DESIGN_APPROVAL++
    } else if (rev.type === "development") {
      revisionCounts.DEVELOPMENT++
      revisionCounts.DEV_QA++
    } else if (rev.type === "post-delivery") {
      revisionCounts.DELIVERED++
    }
  }

  return PHASES_ORDER.map((phase, idx) => {
    let state: PhaseNodeData["state"] = "pending"

    if (skippedDesignQA && phase === "DESIGN_QA") {
      state = "skipped"
    } else if (status === "COMPLETED") {
      state = "completed"
    } else if (idx < currentIdx) {
      state = "completed"
    } else if (idx === currentIdx) {
      state = "active"
    }

    const avgDays = phaseDurations[phase]?.length > 0
      ? Math.round((phaseDurations[phase].reduce((a, b) => a + b, 0) / phaseDurations[phase].length) * 10) / 10
      : null

    return {
      phase,
      state,
      revisionCount: revisionCounts[phase] || 0,
      avgDays,
      cycleCount: phaseCounts[phase] || 0,
    }
  })
}

export function WorkflowDiagram({ project }: WorkflowDiagramProps) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const phaseData = buildPhaseNodeData(
    project.activities,
    project.revisions,
    project.currentPhase,
    project.status,
    project.skippedDesignQA
  )

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(2.0, prev.scale + delta)),
    }))
  }

  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true)
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y })
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }))
  }

  function handleMouseUp() {
    setIsDragging(false)
  }

  function resetTransform() {
    setTransform({ x: 0, y: 0, scale: 1 })
  }

  function zoomIn() {
    setTransform(prev => ({ ...prev, scale: Math.min(2.0, prev.scale + 0.2) }))
  }

  function zoomOut() {
    setTransform(prev => ({ ...prev, scale: Math.max(0.5, prev.scale - 0.2) }))
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Controls */}
      <div style={{
        position: "absolute", top: "0.5rem", right: "0.5rem", zIndex: 10,
        display: "flex", gap: "0.35rem",
      }}>
        <button
          onClick={zoomIn}
          className="btn btn-secondary btn-sm btn-icon"
          title="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={zoomOut}
          className="btn btn-secondary btn-sm btn-icon"
          title="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={resetTransform}
          className="btn btn-secondary btn-sm btn-icon"
          title="Reset view"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Diagram container */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: "100%",
          height: "280px",
          overflow: "hidden",
          background: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          cursor: isDragging ? "grabbing" : "grab",
          position: "relative",
        }}
      >
        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.15s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "100%",
            minHeight: "100%",
            padding: "2rem",
          }}
        >
          {/* Phase nodes */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {phaseData.map((node, idx) => {
              const color = getPhaseColor(node.phase)
              const isActive = node.state === "active"
              const isCompleted = node.state === "completed"
              const isSkipped = node.state === "skipped"
              const isPending = node.state === "pending"

              let bgColor = "rgba(107,114,128,0.1)"
              let borderColor = "#374151"
              let textColor = "#6b7280"

              if (isCompleted) {
                bgColor = `${color}20`
                borderColor = color
                textColor = color
              } else if (isActive) {
                bgColor = `${color}30`
                borderColor = color
                textColor = color
              } else if (isSkipped) {
                bgColor = "rgba(245,158,11,0.1)"
                borderColor = "#f59e0b"
                textColor = "#f59e0b"
              }

              return (
                <div key={node.phase} style={{ display: "flex", alignItems: "center" }}>
                  {/* Node */}
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "0.5rem", minWidth: "100px",
                  }}>
                    <div style={{
                      width: "56px", height: "56px",
                      borderRadius: "50%",
                      border: isSkipped ? `2px dashed ${borderColor}` : `2px solid ${borderColor}`,
                      background: bgColor,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: textColor,
                      position: "relative",
                      boxShadow: isActive ? `0 0 20px ${color}60` : "none",
                      animation: isActive ? "pulse-ring 2s infinite" : "none",
                    }}>
                      {isCompleted && !isSkipped && <CheckCircle2 size={20} />}
                      {isActive && PHASE_ICONS[node.phase]}
                      {isPending && PHASE_ICONS[node.phase]}
                      {isSkipped && <AlertTriangle size={20} />}

                      {/* Cycle badge */}
                      {node.cycleCount > 1 && (
                        <div style={{
                          position: "absolute", top: "-4px", right: "-4px",
                          width: "20px", height: "20px",
                          borderRadius: "50%",
                          background: "#f59e0b",
                          color: "#fff",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          border: "2px solid var(--color-bg-secondary)",
                        }}>
                          <RotateCcw size={10} />
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <div style={{ textAlign: "center" }}>
                      <div style={{
                        fontSize: "0.75rem", fontWeight: 600,
                        color: isActive || isCompleted ? textColor : "#6b7280",
                      }}>
                        {getPhaseLabel(node.phase)}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>
                        {isSkipped && "Skipped"}
                        {isCompleted && !isSkipped && "Done"}
                        {isActive && "Active"}
                        {isPending && "Pending"}
                      </div>

                      {/* Metrics */}
                      {(node.revisionCount > 0 || node.avgDays !== null) && (
                        <div style={{
                          fontSize: "0.65rem", color: "var(--color-text-muted)",
                          marginTop: "0.25rem", display: "flex", flexDirection: "column", gap: "0.1rem",
                        }}>
                          {node.revisionCount > 0 && <div>📝 {node.revisionCount} rev</div>}
                          {node.avgDays !== null && <div>⏱ {node.avgDays}d</div>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connector */}
                  {idx < phaseData.length - 1 && (
                    <div style={{
                      width: "40px", height: "3px",
                      background: isCompleted
                        ? `linear-gradient(90deg, ${color}, ${color}80)`
                        : "#32324a",
                      borderRadius: "9999px",
                      flexShrink: 0,
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% {
            box-shadow: 0 0 0 0 currentColor;
          }
          50% {
            box-shadow: 0 0 0 8px transparent;
          }
        }
      `}</style>
    </div>
  )
}
