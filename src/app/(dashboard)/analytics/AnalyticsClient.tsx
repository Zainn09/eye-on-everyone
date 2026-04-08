"use client"

import { useMemo } from "react"
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts"
import {
  PieChart as PieChartIcon, Activity, AlertTriangle, CheckCircle2
} from "lucide-react"

interface AnalyticsClientProps {
  data: {
    byStatus: Record<string, number>
    byPhase: Record<string, number>
    byPriority: Record<string, number>
    overdue: number
    completionRate: number
    total: number
    activities: any[]
  }
}

export function AnalyticsClient({ data }: AnalyticsClientProps) {
  const statusData = useMemo(() => {
    return [
      { name: "Not Started", value: data.byStatus.NOT_STARTED, color: "#6b7280" },
      { name: "In Progress", value: data.byStatus.IN_PROGRESS, color: "#3b82f6" },
      { name: "Completed", value: data.byStatus.COMPLETED, color: "#10b981" },
      { name: "Blocked", value: data.byStatus.BLOCKED, color: "#ef4444" },
      { name: "On Hold", value: data.byStatus.ON_HOLD, color: "#f59e0b" },
    ].filter(d => d.value > 0)
  }, [data.byStatus])

  const phaseData = useMemo(() => {
    return [
      { name: "Design", value: data.byPhase.DESIGN, fill: "#8b5cf6" },
      { name: "Design QA", value: data.byPhase.DESIGN_QA, fill: "#f59e0b" },
      { name: "Approval", value: data.byPhase.DESIGN_APPROVAL, fill: "#10b981" },
      { name: "Dev", value: data.byPhase.DEVELOPMENT, fill: "#3b82f6" },
      { name: "Dev QA", value: data.byPhase.DEV_QA, fill: "#f59e0b" },
      { name: "Preview", value: data.byPhase.CLIENT_PREVIEW, fill: "#06b6d4" },
      { name: "Delivered", value: data.byPhase.DELIVERED, fill: "#14b8a6" },
    ]
  }, [data.byPhase])

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Analytics Overview</h1>
        <p>Monitor project progress, workloads, and bottlenecks across the organization</p>
      </div>

      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
            <Activity size={22} />
          </div>
          <div>
            <div className="stat-value">{data.total}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="stat-value">{data.completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="stat-value">{data.overdue}</div>
            <div className="stat-label">Overdue Projects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
            <PieChartIcon size={22} />
          </div>
          <div>
            <div className="stat-value">{data.byPriority.URGENT + data.byPriority.HIGH}</div>
            <div className="stat-label">High Priority</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="chart-card flex flex-col items-center">
          <div className="chart-title w-full text-left">Project Status Distribution</div>
          <div className="chart-subtitle w-full text-left">Overview of current project states</div>
          
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: "#1c1c28", borderColor: "#2a2a3a", borderRadius: "8px" }}
                  itemStyle={{ color: "#f1f0ff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card flex flex-col">
          <div className="chart-title">Projects by Phase</div>
          <div className="chart-subtitle">Identify where most work is currently queued</div>
          
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={phaseData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={{ stroke: "#2a2a3a" }} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={{ stroke: "#2a2a3a" }} />
                <RechartsTooltip 
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{ backgroundColor: "#1c1c28", borderColor: "#2a2a3a", borderRadius: "8px" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {phaseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
