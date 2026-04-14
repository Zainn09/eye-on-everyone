import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      status: string
      image?: string | null
    }
  }

  interface User {
    role: string
    status: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    status: string
  }
}
