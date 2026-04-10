"use client"

import { useTransition } from "react"
import { Shield, ShieldAlert, UserCog, UserCheck } from "lucide-react"
import { updateUserRole } from "@/actions/misc"
import { Badge, Button } from "@/components/ui"
import { useRouter } from "next/navigation"

interface AdminClientProps {
  users: any[]
}

const ROLES = [
  "ADMIN",
  "PROJECT_MANAGER",
  "DESIGNER",
  "DEVELOPER",
  "QA",
  "VIEWER",
]

export function AdminClient({ users }: AdminClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleRoleChange(userId: string, role: string) {
    startTransition(async () => {
      await updateUserRole(userId, role)
      router.refresh()
    })
  }

  return (
    <div className="animate-fade-in space-y-8" style={{ maxWidth: "1000px" }}>
      <div className="page-header">
        <h1>Team Management</h1>
        <p>Manage access levels and assign roles to team members</p>
      </div>

      <div className="card">
        <div className="card-header border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2 font-semibold">
            <UserCheck size={18} className="text-success" /> 
            Team Members ({users.length})
          </div>
        </div>
        <div className="card-body p-0">
          <div className="grid grid-cols-4 gap-4 px-6 py-3 font-semibold text-xs text-muted border-b border-[var(--color-border)] uppercase tracking-wider">
            <div className="col-span-2">User</div>
            <div>Current Role</div>
            <div>Change Role</div>
          </div>
          
          <div className="flex flex-col">
            {users.map(user => (
              <div key={user.id} className="grid grid-cols-4 gap-4 px-6 py-4 items-center border-b border-[var(--color-border)] last:border-0">
                <div className="col-span-2 flex flex-col">
                  <span className="font-medium text-sm">{user.name}</span>
                  <span className="text-xs text-muted">{user.email}</span>
                </div>
                <div>
                  <Badge variant={user.role === "ADMIN" ? "danger" : user.role === "PROJECT_MANAGER" ? "warning" : "info"}>
                    {user.role.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <select 
                    className="select text-xs py-1 px-2"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={isPending}
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex gap-4 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
        <div className="w-10 h-10 rounded-full bg-[var(--color-warning-subtle)] flex items-center justify-center shrink-0">
          <ShieldAlert size={20} className="text-warning" />
        </div>
        <div className="text-sm">
          <h4 className="font-semibold mb-1">Role Permissions Note</h4>
          <p className="text-muted leading-relaxed">
            Admins have full access. Project Managers cannot assign roles or delete projects. 
            Department roles (Design, Dev, QA) are restricted to phase movements relevant to their scopes.
          </p>
        </div>
      </div>
    </div>
  )
}
