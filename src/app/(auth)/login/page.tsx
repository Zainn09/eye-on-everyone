"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button, Input, Label } from "@/components/ui"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      if (res?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred")
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
