"use client"

import { useMemo } from "react"
import {
  Users, TrendingUp, AlertTriangle, CheckCircle2, Clock,
  Zap, Target, BarChart2, Activity, Shield, Bug, Code, Palette,
  ArrowUp, ArrowDown, Minus
} from "lucide-react"
import { Badge } from "@/components/ui"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, RadialBarChart, RadialBar, PieChart, Pie, Legend
} from "recharts"
import { getPhaseLabel } from "@/lib/utils"

interface InsightsClientProps {
  insights: {
    teamDistribution: Record<string, number>
    userPerformance: Array<{
      user: { id: string; name: string; role: string; email: string }
      tasksAssigned: number
      tasksCompleted: number
      tasksInReview: number
      tasksPending: number
      tasksInProgress: number
      tasksOverdue: number
      pagesAssigned: number
      pagesCompleted: number
      completionRate: number
    }>
    bottlenecks: string[]
    needsAssistance: Array<{ project: string; reason: string; severity: "high" | "medium" | "low" }>
    phaseMetrics: Array<{ phase: string; avgDays: number; count: number }>
    overallStats: {
      totalProjects: number
      activeProjects: number
      completedProjects: number
      overdueProjects: number
      totalTasks: number
      completedTasksCount: number
      overallCompletionRate: number
      totalUsers: number
    }
  }
}

const PHASE_COLORS: Record<string, string> = {
  DESIGN: "#8B5CF6",
  DESIGN_QA: "#F59E0B",
  DESIGN_APPROVAL: "#10B981",
  DEVELOPMENT: "#3B82F6",
  DEV_QA: "#F59E0B",
  CLIENT_PREVIEW: "#06B6D4",
  DELIVERED: "#14B8A6",
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#EF4444",
  PROJECT_MANAGER: "#F59E0B",
  DESIGNER: "#8B5CF6",
  DEVELOPER: "#3B82F6",
  QA: "#10B981",
  VIEWER: "#6B7280",
}

export function InsightsClient({ insights }: InsightsClientProps) {
  const { teamDistribution, userPerformance, bottlenecks, needsAssistance, phaseMetrics, overallStats } = insights

  const teamDistData = [
    { name: "Design", value: teamDistribution.DESIGN, fill: "#8B5CF6" },
    { name: "Development", value: teamDistribution.DEVELOPMENT, fill: "#3B82F6" },
    { name: "QA", value: teamDistribution.QA, fill: "#F59E0B" },
    { name: "Client Review", value: teamDistribution.CLIENT_REVIEW, fill: "#10B981" },
  ].filter(d => d.value > 0)

  const phaseChartData = phaseMetrics.map(m => ({
    name: getPhaseLabel(m.phase).replace(" ", "\n"),
    avgDays: m.avgDays,
    fill: PHASE_COLORS[m.phase] || "#6B7280",
  }))

  const topPerformers = [...userPerformance]
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 5)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "#EF4444"
      case "medium": return "#F59E0B"
      default: return "#6B7280"
    }
  }

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "high": return "danger"
      case "medium": return "warning"
      default: return "muted"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "DESIGNER": return <Palette size={14} />
      case "DEVELOPER": return <Code size={14} />
      case "QA": return <Bug size={14} />
      case "ADMIN": return <Shield size={14} />
      default: return <Users size={14} />
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={28} style={{ color: "#a78bfa" }} />
            Admin Insights
          </h1>
          <p>Deep analytics, team performance, and bottleneck detection</p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.01))", borderColor: "rgba(139,92,246,0.2)" }}>
          <div className="stat-icon" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
            <Activity size={22} />
          </div>
          <div>
            <div className="stat-value">{overallStats.totalProjects}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>
        <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.01))", borderColor: "rgba(59,130,246,0.2)" }}>
          <div className="stat-icon" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-value">{overallStats.activeProjects}</div>
            <div className="stat-label">Active Projects</div>
          </div>
        </div>
        <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.01))", borderColor: "rgba(16,185,129,0.2)" }}>
          <div className="stat-icon" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="stat-value">{overallStats.overallCompletionRate}%</div>
            <div className="stat-label">Task Completion Rate</div>
          </div>
        </div>
        <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.01))", borderColor: "rgba(239,68,68,0.2)" }}>
          <div className="stat-icon" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="stat-value">{overallStats.overdueProjects}</div>
            <div className="stat-label">Overdue Projects</div>
          </div>
        </div>
      </div>

      {/* Row 1: Team Distribution + Bottlenecks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Team Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BarChart2 size={18} style={{ color: "#a78bfa" }} />
              Team Distribution
            </h3>
            <span className="text-xs text-muted">Projects by phase group</span>
          </div>
          <div className="card-body">
            {teamDistData.length === 0 ? (
              <div className="text-sm text-muted text-center" style={{ padding: "2rem" }}>No active projects</div>
            ) : (
              <>
                <div style={{ height: "200px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={teamDistData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {teamDistData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "#16161f", borderColor: "#2a2a3a", borderRadius: "8px" }}
                        formatter={(value: any) => [`${value} projects`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {teamDistData.map((item) => (
                    <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.fill }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottlenecks & Needs Assistance */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Zap size={18} style={{ color: "#f59e0b" }} />
              Bottlenecks & Alerts
            </h3>
          </div>
          <div className="card-body" style={{ padding: 0, maxHeight: "340px", overflowY: "auto" }}>
            {bottlenecks.length === 0 && needsAssistance.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <CheckCircle2 size={32} style={{ color: "#10b981", margin: "0 auto 0.5rem" }} />
                <div className="text-sm text-muted">No bottlenecks detected</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {bottlenecks.map((b, i) => (
                  <div key={i} style={{
                    padding: "0.875rem 1.25rem",
                    borderBottom: "1px solid var(--color-border)",
                    display: "flex", alignItems: "flex-start", gap: "0.75rem"
                  }}>
                    <AlertTriangle size={16} style={{ color: "#f59e0b", flexShrink: 0, marginTop: "2px" }} />
                    <span className="text-sm">{b}</span>
                  </div>
                ))}
                {needsAssistance.map((item, i) => (
                  <div key={i} style={{
                    padding: "0.875rem 1.25rem",
                    borderBottom: "1px solid var(--color-border)",
                    display: "flex", alignItems: "flex-start", gap: "0.75rem"
                  }}>
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: getSeverityColor(item.severity),
                      flexShrink: 0, marginTop: "5px"
                    }} />
                    <div>
                      <div className="text-sm font-medium">{item.project}</div>
                      <div className="text-xs text-muted">{item.reason}</div>
                    </div>
                    <Badge variant={getSeverityVariant(item.severity)} style={{ marginLeft: "auto", flexShrink: 0 }}>
                      {item.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phase Time Metrics */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-header">
          <h3 className="font-semibold" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock size={18} style={{ color: "#60a5fa" }} />
            Average Time Per Phase
          </h3>
          <span className="text-xs text-muted">Days spent in each workflow phase</span>
        </div>
        <div className="card-body">
          {phaseChartData.every(d => d.avgDays === 0) ? (
            <div className="text-sm text-muted text-center" style={{ padding: "2rem" }}>
              Not enough phase transition data yet
            </div>
          ) : (
            <div style={{ height: "220px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={phaseChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} unit="d" />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{ background: "#16161f", borderColor: "#2a2a3a", borderRadius: "8px" }}
                    formatter={(value: any) => [`${value} days`, "Avg. Time"]}
                  />
                  <Bar dataKey="avgDays" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {phaseChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Individual Performance Table */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-header">
          <h3 className="font-semibold" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Target size={18} style={{ color: "#34d399" }} />
            Individual Performance
          </h3>
          <span className="text-xs text-muted">{userPerformance.length} team members</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["Team Member", "Role", "Assigned", "In Progress", "In Review", "Completed", "Overdue", "Rate"].map(h => (
                  <th key={h} style={{
                    padding: "0.75rem 1.25rem",
                    textAlign: "left",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {userPerformance.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                    No team members found
                  </td>
                </tr>
              ) : (
                userPerformance.map((perf) => (
                  <tr key={perf.user.id} style={{
                    borderBottom: "1px solid var(--color-border)",
                    transition: "background 120ms ease",
                  }}
                    className="hover:bg-[var(--color-bg-elevated)]"
                  >
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                        <div style={{
                          width: "32px", height: "32px", borderRadius: "50%",
                          background: "var(--color-primary-subtle)",
                          color: "var(--color-primary-light)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.72rem", fontWeight: 700, flexShrink: 0,
                        }}>
                          {perf.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{perf.user.name}</div>
                          <div className="text-xs text-muted">{perf.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: ROLE_COLORS[perf.user.role] || "#6b7280", fontSize: "0.8rem" }}>
                        {getRoleIcon(perf.user.role)}
                        {perf.user.role.replace("_", " ")}
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.875rem", fontWeight: 600 }}>
                      {perf.tasksAssigned}
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <span style={{ color: "#60a5fa", fontSize: "0.875rem", fontWeight: 600 }}>
                        {perf.tasksInProgress}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <span style={{ color: "#f59e0b", fontSize: "0.875rem", fontWeight: 600 }}>
                        {perf.tasksInReview}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <span style={{ color: "#34d399", fontSize: "0.875rem", fontWeight: 600 }}>
                        {perf.tasksCompleted}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      {perf.tasksOverdue > 0 ? (
                        <span style={{ color: "#f87171", fontSize: "0.875rem", fontWeight: 600 }}>
                          {perf.tasksOverdue}
                        </span>
                      ) : (
                        <span style={{ color: "#34d399", fontSize: "0.875rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{
                          flex: 1, height: "6px", background: "var(--color-bg-elevated)",
                          borderRadius: "9999px", overflow: "hidden", minWidth: "60px"
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${perf.completionRate}%`,
                            background: perf.completionRate >= 70
                              ? "linear-gradient(90deg, #10b981, #34d399)"
                              : perf.completionRate >= 40
                              ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                              : "linear-gradient(90deg, #ef4444, #f87171)",
                            borderRadius: "9999px",
                            transition: "width 0.5s ease",
                          }} />
                        </div>
                        <span style={{
                          fontSize: "0.78rem", fontWeight: 600,
                          color: perf.completionRate >= 70 ? "#34d399" : perf.completionRate >= 40 ? "#fbbf24" : "#f87171",
                          minWidth: "36px"
                        }}>
                          {perf.completionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Intelligence Tags Summary */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Shield size={18} style={{ color: "#a78bfa" }} />
            Status Intelligence Summary
          </h3>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {[
              {
                label: "Needs Assistance",
                count: needsAssistance.filter(n => n.severity === "high").length,
                color: "#ef4444",
                bg: "rgba(239,68,68,0.1)",
                icon: <AlertTriangle size={20} />,
              },
              {
                label: "Pending Review",
                count: needsAssistance.filter(n => n.severity === "medium").length,
                color: "#f59e0b",
                bg: "rgba(245,158,11,0.1)",
                icon: <Clock size={20} />,
              },
              {
                label: "On Track",
                count: overallStats.activeProjects - needsAssistance.length,
                color: "#10b981",
                bg: "rgba(16,185,129,0.1)",
                icon: <CheckCircle2 size={20} />,
              },
              {
                label: "Completed",
                count: overallStats.completedProjects,
                color: "#14b8a6",
                bg: "rgba(20,184,166,0.1)",
                icon: <Target size={20} />,
              },
            ].map((item) => (
              <div key={item.label} style={{
                padding: "1.25rem",
                borderRadius: "var(--radius-lg)",
                background: item.bg,
                border: `1px solid ${item.color}30`,
                display: "flex", alignItems: "center", gap: "1rem",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "var(--radius-md)",
                  background: `${item.color}20`,
                  color: item.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "var(--font-display)", color: item.color, lineHeight: 1 }}>
                    {Math.max(0, item.count)}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", marginTop: "0.2rem" }}>
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
