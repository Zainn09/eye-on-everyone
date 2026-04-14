"use server"

import { signIn as nextAuthSignIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const result = await nextAuthSignIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result && typeof result === "object" && "error" in result && result.error) {
      return { error: result.error as string }
    }

    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." }
        default:
          return { error: "Something went wrong. Please try again." }
      }
    }
    throw error
  }
}

export async function signup(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    throw new Error("All fields are required.")
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.")
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error("An account with this email already exists.")
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "VIEWER",
      status: "PENDING_APPROVAL",
    },
  })

  // Notify all admins about the pending registration
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", status: "ACTIVE" },
  })

  for (const admin of admins) {
    await prisma.notification.create({
      data: {
        title: "New User Registration",
        message: `${name} (${email}) is requesting access. Review in Admin panel.`,
        userId: admin.id,
        link: "/admin",
      },
    })
  }

  revalidatePath("/admin")
  return { success: true }
}
