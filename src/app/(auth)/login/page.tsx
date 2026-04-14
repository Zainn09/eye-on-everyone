"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button, Input, Label } from "@/components/ui"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [debugMessage, setDebugMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setDebugMessage(null)

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

      setDebugMessage(JSON.stringify(result, null, 2))

      if (!result) {
        setError("No response from auth server.")
      } else if (result.error) {
        setError(result.error)
      } else if (result.ok) {
        router.push("/dashboard")
      } else {
        setError("Unable to sign in. Please try again.")
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unexpected auth error"
      setDebugMessage(message)
      setError("Sign in failed. Check the debug message below.")
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
          <h2 className="auth-title">Welcome back</h2>
          <p className="text-muted text-sm mt-1">Sign in to your account to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="p-3 bg-[var(--color-danger-subtle)] text-[var(--color-danger)] text-sm rounded-md border border-[var(--color-danger)]">
              {error}
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

        {debugMessage ? (
          <pre className="mt-4 p-3 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] whitespace-pre-wrap">
            {debugMessage}
          </pre>
        ) : null}
        
        <div className="auth-footer">
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </div>
        
        {/* Helper for demo */}
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
