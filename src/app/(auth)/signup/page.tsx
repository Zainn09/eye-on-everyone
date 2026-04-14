"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button, Input, Label } from "@/components/ui"

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const { signup } = await import("@/actions/auth")
      await signup(formData)
      setSuccess(true)
      setTimeout(() => {
        router.push("/waiting-approval")
      }, 2500)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-scale-in">
        <div className="auth-logo">
          <h1>FlowDesk</h1>
          <p className="auth-subtitle">Project Management Platform</p>
        </div>
        
        <div className="text-center mb-6">
          <h2 className="auth-title">Create an account</h2>
          <p className="text-muted text-sm mt-1">Join your team — admin approval required</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="p-3 bg-[var(--color-danger-subtle)] text-[var(--color-danger)] text-sm rounded-md border border-[var(--color-danger)]">
              {error}
            </div>
          )}
          
          {success && (
            <div style={{
              padding: "1rem",
              background: "rgba(16,185,129,0.1)",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#34d399",
              fontSize: "0.875rem",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>✅</div>
              <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Account Created!</div>
              <div style={{ opacity: 0.85 }}>Your account is pending admin approval. Redirecting…</div>
            </div>
          )}
          
          <div className="form-group">
            <Label>Full Name</Label>
            <Input name="name" type="text" required placeholder="John Doe" disabled={loading || success} />
          </div>
          
          <div className="form-group">
            <Label>Email</Label>
            <Input name="email" type="email" required placeholder="name@example.com" disabled={loading || success} />
          </div>
          
          <div className="form-group">
            <Label>Password</Label>
            <Input name="password" type="password" required placeholder="••••••••" minLength={6} disabled={loading || success} />
            <span className="form-hint">Minimum 6 characters</span>
          </div>
          
          <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading || success}>
            {loading ? "Creating account..." : success ? "Account Created!" : "Sign Up"}
          </Button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>

        <div className="mt-4 p-3 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)]" style={{ textAlign: "center" }}>
          ⚠️ New accounts require admin approval before you can log in.
        </div>
      </div>
    </div>
  )
}
