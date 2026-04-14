"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button, Input, Label } from "@/components/ui"
import { AlertCircle, Clock, XCircle } from "lucide-react"

function getErrorMessage(error: string | null | undefined): { message: string; type: "pending" | "rejected" | "invalid" | "generic" } {
  if (!error) return { message: "", type: "generic" }
  if (error.includes("PENDING_APPROVAL") || error.includes("pending")) {
    return { message: "Your account is pending admin approval. You'll be notified once approved.", type: "pending" }
  }
  if (error.includes("REJECTED") || error.includes("rejected")) {
    return { message: "Your account access has been rejected. Please contact an administrator.", type: "rejected" }
  }
  if (error.includes("INVALID_CREDENTIALS") || error.includes("CredentialsSignin") || error.includes("Invalid")) {
    return { message: "Invalid email or password. Please try again.", type: "invalid" }
  }
  return { message: error, type: "generic" }
}

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email")?.toString() ?? ""
    const password = formData.get("password")?.toString() ?? ""
    const callbackUrl = `${window.location.origin}/dashboard`

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      })

      if (!result) {
        setError("No response from auth server.")
      } else if (result.error) {
        setError(result.error)
      } else if (result.ok) {
        router.push("/dashboard")
        router.refresh()
      } else {
        setError("Unable to sign in. Please try again.")
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unexpected error occurred"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="auth-page">
      <div className="auth-card animate-scale-in">
        <div className="auth-logo">
          <h1>FlowDesk</h1>
          <p className="auth-subtitle">Project Management Platform</p>
        </div>
        
        <div className="text-center mb-6">
          <h2 className="auth-title">Welcome back</h2>
          <p className="text-muted text-sm mt-1">Sign in to your account to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div style={{
              padding: "0.875rem 1rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.625rem",
              background: errorInfo.type === "pending"
                ? "rgba(245,158,11,0.1)"
                : errorInfo.type === "rejected"
                ? "rgba(239,68,68,0.1)"
                : "rgba(239,68,68,0.08)",
              border: `1px solid ${errorInfo.type === "pending" ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)"}`,
              color: errorInfo.type === "pending" ? "#fbbf24" : "#f87171",
            }}>
              {errorInfo.type === "pending" ? (
                <Clock size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
              ) : (
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
              )}
              <div>
                <div style={{ fontWeight: 600, marginBottom: "0.125rem" }}>
                  {errorInfo.type === "pending" ? "Account Pending" : errorInfo.type === "rejected" ? "Access Denied" : "Sign In Failed"}
                </div>
                <div style={{ opacity: 0.9 }}>{errorInfo.message}</div>
                {errorInfo.type === "pending" && (
                  <Link href="/waiting-approval" style={{ color: "#fbbf24", textDecoration: "underline", fontSize: "0.8rem", marginTop: "0.25rem", display: "inline-block" }}>
                    Check approval status →
                  </Link>
                )}
              </div>
            </div>
          )}
          
          <div className="form-group">
            <Label>Email</Label>
            <Input 
              name="email" 
              type="email" 
              required 
              placeholder="name@example.com"
              defaultValue="admin@projectmanager.com"
            />
          </div>
          
          <div className="form-group">
            <div className="flex justify-between">
              <Label>Password</Label>
              <a href="#" className="text-xs text-[var(--color-primary-light)] hover:underline">Forgot?</a>
            </div>
            <Input 
              name="password" 
              type="password" 
              required 
              placeholder="••••••••" 
              defaultValue="password123"
            />
          </div>
          
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full mt-2" 
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        
        <div className="auth-footer">
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </div>
        
        {/* Demo accounts helper */}
        <div className="mt-8 p-3 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
          <strong>Demo Accounts (password123):</strong>
          <ul className="mt-1 flex flex-col gap-1 pl-2">
            <li>admin@projectmanager.com</li>
            <li>pm@projectmanager.com</li>
            <li>designer@projectmanager.com</li>
            <li>dev@projectmanager.com</li>
            <li>qa@projectmanager.com</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
