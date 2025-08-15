import "next-auth"
import { UserRole } from "@/lib/types"

declare module "next-auth" {
  interface User {
    role: UserRole
    isActive: boolean
    avatar?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      isActive: boolean
      avatar?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    isActive: boolean
  }
}