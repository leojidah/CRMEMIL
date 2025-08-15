'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Export a single Supabase client instance for client-side use
export const supabase = createClientComponentClient()

// Type for our custom user profile
export interface UserProfile {
  id: string
  email: string
  name: string
  role: 'SALESPERSON' | 'INHOUSE' | 'INSTALLER' | 'ADMIN'
  created_at: string
  updated_at: string
}