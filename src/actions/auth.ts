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
          return { error: "Invalid credentials" }
        default:
          return { error: "Something went wrong" }
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
    throw new Error("Missing required fields")
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error("User already exists")
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "VIEWER",
    },
  })

  // Create a notification for admins
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
  })

  for (const admin of admins) {
    await prisma.notification.create({
      data: {
        title: "New User Registration",
        message: `${name} has registered a new account.`,
        userId: admin.id,
        link: "/admin",
      },
    })
  }

  revalidatePath("/admin")
  return { success: true }
}
