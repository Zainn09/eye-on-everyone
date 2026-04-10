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
        router.push("/login")
      }, 3000)
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
          <p className="text-muted text-sm mt-1">Join your team today</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="p-3 bg-[var(--color-danger-subtle)] text-[var(--color-danger)] text-sm rounded-md border border-[var(--color-danger)]">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-[var(--color-success-subtle)] text-[var(--color-success)] text-sm rounded-md border border-[var(--color-success)]">
              Account created! Waiting for admin approval. Redirecting to login...
            </div>
          )}
          
          <div className="form-group">
            <Label>Full Name</Label>
            <Input name="name" type="text" required placeholder="John Doe" disabled={loading} />
          </div>
          
          <div className="form-group">
            <Label>Email</Label>
            <Input name="email" type="email" required placeholder="name@example.com" disabled={loading} />
          </div>
          
          <div className="form-group">
            <Label>Password</Label>
            <Input name="password" type="password" required placeholder="••••••••" disabled={loading} />
          </div>
          
          <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </Button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
