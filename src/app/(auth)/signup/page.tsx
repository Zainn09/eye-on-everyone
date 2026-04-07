"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button, Input, Label } from "@/components/ui"

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // In a real app we'd call an API here. 
    // Since we seeded our demo users, we'll just show an error indicating 
    // registration is closed or mock it out.
    setTimeout(() => {
      setError("Registration is currently invite-only. Please use a demo account.")
      setLoading(false)
    }, 1000)
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
