import React from "react"
import { cn } from "@/lib/utils"

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost"
  size?: "sm" | "md" | "lg"
  icon?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", icon, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "btn",
          `btn-${variant}`,
          size !== "md" && `btn-${size}`,
          icon && "btn-icon",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// Badge
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "muted" | "primary" | string
  dot?: boolean
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "muted", dot, children, ...props }, ref) => {
    // allow predefined variants or custom phase/priority names mapped to css
    const variantClass = variant.includes("-") ? `badge-${variant}` : `badge-${variant.toLowerCase()}`
    
    return (
      <span ref={ref} className={cn("badge", variantClass, className)} {...props}>
        {dot && <span className="badge-dot" />}
        {children}
      </span>
    )
  }
)
Badge.displayName = "Badge"

// Card
export function Card({ className, glass, ...props }: React.HTMLAttributes<HTMLDivElement> & { glass?: boolean }) {
  return <div className={cn("card", glass && "card-glass", className)} {...props} />
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card-header", className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-semibold text-lg", className)} {...props} />
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card-body", className)} {...props} />
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card-footer flex items-center justify-between", className)} {...props} />
}

// Input Forms
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cn("input", className)} {...props} />
  }
)
Input.displayName = "Input"

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return <textarea ref={ref} className={cn("input", className)} {...props} />
  }
)
Textarea.displayName = "Textarea"

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return <label ref={ref} className={cn("form-label flex flex-col gap-1", className)} {...props} />
  }
)
Label.displayName = "Label"

// Modal
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose()
    }}>
      <div className={cn("modal", size !== "md" && `modal-${size}`)}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <Button variant="ghost" icon onClick={onClose}>×</Button>
        </div>
        {children}
      </div>
    </div>
  )
}
