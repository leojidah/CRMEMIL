'use client'
import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client - ENDAST för frontend
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Type for our custom user profile
export interface UserProfile {
  id: string
  email: string
  name: string
  role: 'SALESPERSON' | 'INHOUSE' | 'INSTALLER' | 'ADMIN'
  created_at: string
  updated_at: string
}

// Helper function to map database roles to your UserProfile roles
export const mapDatabaseRoleToUserRole = (dbRole: string): UserProfile['role'] => {
  switch (dbRole?.toLowerCase()) {
    case 'salesperson':
      return 'SALESPERSON'
    case 'internal':
    case 'inhouse':
      return 'INHOUSE'
    case 'installer':
      return 'INSTALLER'
    case 'admin':
      return 'ADMIN'
    default:
      return 'SALESPERSON'
  }
}

// Helper function to map UserProfile roles back to database format
export const mapUserRoleToDatabase = (userRole: UserProfile['role']): string => {
  switch (userRole) {
    case 'SALESPERSON':
      return 'salesperson'
    case 'INHOUSE':
      return 'internal'
    case 'INSTALLER':
      return 'installer'
    case 'ADMIN':
      return 'admin'
    default:
      return 'salesperson'
  }
}

export default supabase