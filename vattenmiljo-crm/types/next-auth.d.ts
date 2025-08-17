import "next-auth"
import { UserProfile } from "@/lib/supabase"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    role: UserProfile['role']
    isActive: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserProfile['role']
      isActive: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserProfile['role']
    isActive: boolean
  }
}