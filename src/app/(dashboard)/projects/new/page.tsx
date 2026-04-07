"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProject } from "@/actions/projects"
import { Button, Input, Label, Textarea } from "@/components/ui"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      await createProject(formData)
    } catch (err: any) {
      setError(err?.message || "Failed to create project")
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: "720px" }}>
      <Link href="/dashboard" className="btn btn-ghost btn-sm mb-4" style={{ gap: "0.35rem" }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="page-header">
        <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sparkles size={24} style={{ color: "var(--color-primary-light)" }} />
          New Project
        </h1>
        <p>Set up a new client project with all the details</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {error && (
              <div className="p-4" style={{
                background: "var(--color-danger-subtle)",
                color: "var(--color-danger)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                border: "1px solid var(--color-danger)"
              }}>
                {error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <Label>Project Name</Label>
                <Input name="name" required placeholder="e.g. Luxury Brand Redesign" />
              </div>
              <div className="form-group">
                <Label>Client Name</Label>
                <Input name="clientName" required placeholder="e.g. Acme Corp" />
              </div>
            </div>

            <div className="form-group">
              <Label>Project Brief</Label>
              <Textarea
                name="brief"
                required
                placeholder="Describe the project goals, requirements, and key deliverables..."
                style={{ minHeight: "120px" }}
              />
              <span className="form-hint">Minimum 10 characters</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <Label>Priority</Label>
                <select name="priority" className="select" defaultValue="MEDIUM">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <Label>Deadline</Label>
                <Input
                  name="deadline"
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="form-group">
                <Label>Design QA</Label>
                <div style={{ paddingTop: "0.35rem" }}>
                  <label className="toggle" style={{ gap: "0.75rem" }}>
                    <input type="hidden" name="designQAEnabled" value="false" />
                    <input
                      type="checkbox"
                      name="designQAEnabled"
                      className="toggle-input"
                      defaultChecked
                      value="true"
                    />
                    <span className="toggle-track">
                      <span className="toggle-thumb" />
                    </span>
                    <span className="text-sm text-secondary">Enable QA Phase</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="card-footer" style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner spinner-sm" /> Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
