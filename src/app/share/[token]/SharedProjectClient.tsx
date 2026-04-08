"use client"

import {
  CheckCircle2, Clock, GitBranch, Calendar, FileText
} from "lucide-react"
import { Badge } from "@/components/ui"
import {
  getPhaseLabel, getPhaseColor, calculateProjectProgress, 
  getDaysUntilDeadline, formatDate
} from "@/lib/utils"
import { PHASES_ORDER } from "@/lib/workflow"

export function SharedProjectClient({ project }: { project: any }) {
  const progress = calculateProjectProgress(project)
  const daysLeft = getDaysUntilDeadline(project.deadline)

  return (
    <div className="animate-fade-in pb-12">
      <div className="flex items-center gap-2 mb-8">
        <div style={{
          width: 32, height: 32, borderRadius: 8, 
          background: "linear-gradient(135deg, var(--color-primary-light), #c084fc)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 700, fontSize: 18
        }}>
          F
        </div>
        <span className="font-display font-bold text-lg tracking-tight">FlowDesk</span>
        <Badge variant="muted" style={{ marginLeft: "auto" }}>Client Preview View</Badge>
      </div>

      <div className="card glass mb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="text-secondary text-sm mb-2">{project.clientName}</div>
              <h1 className="font-display text-3xl font-bold">{project.name}</h1>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <div className="text-xs text-muted mb-1">Status</div>
                <Badge variant={project.status === "COMPLETED" ? "success" : "info"} dot>
                  {project.status.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="w-px bg-[var(--color-border)]" />
              <div className="text-right">
                <div className="text-xs text-muted mb-1">Due Date</div>
                <div className="text-sm font-medium">{formatDate(project.deadline)}</div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-bg-elevated)] p-5 rounded-lg border border-[var(--color-border)] mb-8">
            <h3 className="text-sm font-semibold mb-2">Project Brief</h3>
            <p className="text-secondary text-sm leading-relaxed whitespace-pre-wrap">
              {project.brief}
            </p>
          </div>

          <div className="mb-2">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-semibold">Workflow Progress</span>
              <span className="text-2xl font-display font-bold text-primary">{progress}%</span>
            </div>
            
            <div className="workflow-stepper mt-4" style={{ overflowX: "visible" }}>
              {PHASES_ORDER.map((phase, i) => {
                if (!project.designQAEnabled && phase === "DESIGN_QA") return null
                
                const isCompleted = PHASES_ORDER.indexOf(project.currentPhase) > i
                const isActive = project.currentPhase === phase
                const color = getPhaseColor(phase)

                return (
                  <div key={phase} style={{ display: "contents" }}>
                    {i > 0 && (
                      <div
                        className={`workflow-step-connector ${isCompleted ? "completed" : ""}`}
                        style={isCompleted ? { background: color } : {}}
                      />
                    )}
                    <div className="workflow-step">
                      <div
                        className={`workflow-step-dot ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                        style={isActive || isCompleted ? { borderColor: color, background: `${color}20`, color } : {}}
                      >
                        {isCompleted ? <CheckCircle2 size={16} /> : i + 1}
                      </div>
                      <span className={`workflow-step-label ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                        style={isActive ? { color } : {}}>
                        {getPhaseLabel(phase)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
        <FileText size={20} className="text-primary" /> Deliverables List
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.pages.length === 0 ? (
          <div className="col-span-full p-8 text-center border dashed border-[var(--color-border)] rounded-lg text-muted">
            No specific deliverables outlined yet
          </div>
        ) : (
          project.pages.map((page: any) => (
            <div key={page.id} className="card p-5 hover:border-[var(--color-border-light)] transition-colors">
              <div className="font-semibold text-base mb-1">{page.name}</div>
              <div className="text-xs text-muted mb-4">{page.type.replace(/_/g, " ")}</div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Design</span>
                  <Badge variant={page.designStatus === "COMPLETED" ? "success" : page.designStatus === "IN_PROGRESS" ? "info" : "muted"}>
                    {page.designStatus.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Development</span>
                  <Badge variant={page.devStatus === "COMPLETED" ? "success" : page.devStatus === "IN_PROGRESS" ? "info" : "muted"}>
                    {page.devStatus.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
