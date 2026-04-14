"use client"

import { useState, useTransition } from "react"
import { Shield, ShieldAlert, UserCheck, UserX, Clock, CheckCircle, XCircle } from "lucide-react"
import { updateUserRole, approveUser, rejectUser } from "@/actions/misc"
import { Badge, Button } from "@/components/ui"
import { useRouter } from "next/navigation"

interface AdminClientProps {
  users: any[]
  pendingUsers: any[]
}

const ROLES = [
  "ADMIN",
  "PROJECT_MANAGER",
  "DESIGNER",
  "DEVELOPER",
  "QA",
  "VIEWER",
]

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  DESIGNER: "Designer",
  DEVELOPER: "Developer",
  QA: "QA",
  VIEWER: "Viewer",
}

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "ADMIN": return "danger"
    case "PROJECT_MANAGER": return "warning"
    case "DESIGNER": return "info"
    case "DEVELOPER": return "info"
    case "QA": return "success"
    default: return "muted"
  }
}

export function AdminClient({ users, pendingUsers }: AdminClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [approveRoles, setApproveRoles] = useState<Record<string, string>>({})
  const [actioningId, setActioningId] = useState<string | null>(null)

  function handleRoleChange(userId: string, role: string) {
    startTransition(async () => {
      await updateUserRole(userId, role)
      router.refresh()
    })
  }

  function handleApprove(userId: string) {
    const role = approveRoles[userId] || "VIEWER"
    setActioningId(userId)
    startTransition(async () => {
      await approveUser(userId, role)
      setActioningId(null)
      router.refresh()
    })
  }

  function handleReject(userId: string) {
    setActioningId(userId)
    startTransition(async () => {
      await rejectUser(userId)
      setActioningId(null)
      router.refresh()
    })
  }

  return (
    <div className="animate-fade-in space-y-8" style={{ maxWidth: "1000px" }}>
      <div className="page-header">
        <h1>Team Management</h1>
        <p>Manage access levels, approve new members, and assign roles</p>
      </div>

      {/* ── PENDING APPROVALS SECTION ── */}
      {pendingUsers.length > 0 && (
        <div className="card" style={{
          borderColor: "rgba(245,158,11,0.4)",
          boxShadow: "0 0 20px rgba(245,158,11,0.08)",
        }}>
          <div className="card-header border-b border-[var(--color-border)]" style={{
            background: "rgba(245,158,11,0.06)",
          }}>
            <div className="flex items-center gap-2 font-semibold" style={{ color: "#fbbf24" }}>
              <Clock size={18} />
              Pending Approvals
              <span style={{
                background: "rgba(245,158,11,0.2)",
                color: "#fbbf24",
                fontSize: "0.7rem",
                fontWeight: 700,
                padding: "0.1rem 0.5rem",
                borderRadius: "9999px",
                marginLeft: "0.25rem",
              }}>
                {pendingUsers.length}
              </span>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="flex flex-col">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="px-6 py-4 border-b border-[var(--color-border)] last:border-0"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.5fr 1fr",
                    gap: "1rem",
                    alignItems: "center",
                  }}
                >
                  {/* User info */}
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: "38px", height: "38px", borderRadius: "50%",
                      background: "rgba(245,158,11,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.875rem", fontWeight: 700, color: "#fbbf24",
                      flexShrink: 0,
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-muted">{user.email}</div>
                    </div>
                  </div>

                  {/* Role to assign */}
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", display: "block", marginBottom: "0.25rem" }}>
                      Assign Role
                    </label>
                    <select
                      className="select text-xs py-1 px-2"
                      value={approveRoles[user.id] || "VIEWER"}
                      onChange={(e) => setApproveRoles((prev) => ({ ...prev, [user.id]: e.target.value }))}
                      disabled={isPending && actioningId === user.id}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(user.id)}
                      disabled={isPending && actioningId === user.id}
                      style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
                    >
                      <CheckCircle size={13} /> Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(user.id)}
                      disabled={isPending && actioningId === user.id}
                      style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
                    >
                      <XCircle size={13} /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {pendingUsers.length === 0 && (
        <div style={{
          padding: "1rem 1.25rem",
          borderRadius: "var(--radius-md)",
          background: "rgba(16,185,129,0.06)",
          border: "1px solid rgba(16,185,129,0.2)",
          display: "flex", alignItems: "center", gap: "0.75rem",
          fontSize: "0.875rem", color: "#34d399",
        }}>
          <CheckCircle size={16} />
          <span>No pending approvals — all caught up!</span>
        </div>
      )}

      {/* ── ACTIVE TEAM MEMBERS ── */}
      <div className="card">
        <div className="card-header border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2 font-semibold">
            <UserCheck size={18} className="text-success" />
            Active Team Members ({users.filter((u) => u.status !== "REJECTED").length})
          </div>
        </div>
        <div className="card-body p-0">
          <div className="grid grid-cols-4 gap-4 px-6 py-3 font-semibold text-xs text-muted border-b border-[var(--color-border)] uppercase tracking-wider">
            <div className="col-span-2">User</div>
            <div>Current Role</div>
            <div>Change Role</div>
          </div>

          <div className="flex flex-col">
            {users.filter((u) => u.status !== "REJECTED").map((user) => (
              <div key={user.id} className="grid grid-cols-4 gap-4 px-6 py-4 items-center border-b border-[var(--color-border)] last:border-0">
                <div className="col-span-2 flex items-center gap-3">
                  <div style={{
                    width: "34px", height: "34px", borderRadius: "50%",
                    background: "var(--color-primary-subtle)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.8rem", fontWeight: 700, color: "var(--color-primary-light)",
                    flexShrink: 0,
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{user.name}</span>
                    <span className="text-xs text-muted">{user.email}</span>
                  </div>
                </div>
                <div>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {ROLE_LABELS[user.role] || user.role.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <select
                    className="select text-xs py-1 px-2"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={isPending}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rejected users (collapsed) */}
      {users.filter((u) => u.status === "REJECTED").length > 0 && (
        <div className="card" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
          <div className="card-header border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: "#f87171" }}>
              <UserX size={16} />
              Rejected Users ({users.filter((u) => u.status === "REJECTED").length})
            </div>
          </div>
          <div className="card-body p-0">
            {users.filter((u) => u.status === "REJECTED").map((user) => (
              <div key={user.id} className="px-6 py-3 border-b border-[var(--color-border)] last:border-0 flex items-center gap-3" style={{ opacity: 0.7 }}>
                <div className="flex-1">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted ml-2">{user.email}</span>
                </div>
                <Badge variant="danger">Rejected</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 flex gap-4 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
        <div className="w-10 h-10 rounded-full bg-[var(--color-warning-subtle)] flex items-center justify-center shrink-0">
          <ShieldAlert size={20} className="text-warning" />
        </div>
        <div className="text-sm">
          <h4 className="font-semibold mb-1">Role Permissions</h4>
          <p className="text-muted leading-relaxed">
            Admins have full access. Project Managers can manage projects but cannot assign roles.
            Department roles (Design, Dev, QA) are restricted to phase movements within their scope.
          </p>
        </div>
      </div>
    </div>
  )
}
