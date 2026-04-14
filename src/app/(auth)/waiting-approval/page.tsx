import Link from "next/link"
import { Clock, CheckCircle, Mail } from "lucide-react"

export default function WaitingApprovalPage() {
  return (
    <div className="auth-page">
      <div className="auth-card animate-scale-in" style={{ textAlign: "center", maxWidth: "460px" }}>
        {/* Animated pending icon */}
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(245,158,11,0.12)",
          border: "2px solid rgba(245,158,11,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem",
          animation: "pulse 2s ease-in-out infinite",
        }}>
          <Clock size={36} style={{ color: "#fbbf24" }} />
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Awaiting Approval
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          Your account has been created and is currently under review by an administrator. 
          You&apos;ll be able to log in once your account is approved.
        </p>

        {/* Status steps */}
        <div style={{
          background: "var(--color-bg-elevated)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          textAlign: "left",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "rgba(16,185,129,0.15)", display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <CheckCircle size={14} style={{ color: "#34d399" }} />
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>Account Created</div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Your registration was submitted</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "rgba(245,158,11,0.15)", display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
                animation: "pulse 2s ease-in-out infinite",
              }}>
                <Clock size={14} style={{ color: "#fbbf24" }} />
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "#fbbf24" }}>Admin Review</div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Your account is being reviewed</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", opacity: 0.4 }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "var(--color-bg-card)", border: "1px solid var(--color-border)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <Mail size={14} style={{ color: "var(--color-text-muted)" }} />
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>Access Granted</div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>You can log in after approval</div>
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
          An admin has been notified of your registration. This usually takes less than 24 hours.
        </p>

        <Link href="/login" style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          padding: "0.6rem 1.25rem", borderRadius: "var(--radius-md)",
          background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)",
          color: "var(--color-text)", fontSize: "0.875rem", fontWeight: 500,
          textDecoration: "none", transition: "all 0.2s",
        }}>
          ← Back to Login
        </Link>
      </div>
    </div>
  )
}
