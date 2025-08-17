import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import type { UserProfile } from '@/lib/supabase'

// TypeScript interfaces for authentication
export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserProfile['role']
  isActive: boolean
}

export interface AuthError extends Error {
  code?: string
}

// Custom error classes for better error handling
export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class InsufficientPermissionError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message)
    this.name = 'InsufficientPermissionError'
  }
}

/**
 * Get the current authenticated user from server-side context
 * Returns the user profile with role information from Supabase Auth metadata
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    console.log('🔐 getCurrentUser: Starting authentication check...')
    
    // APPROACH 1: Check Authorization header first
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    console.log('🔑 getCurrentUser: Authorization header:', authHeader ? 'Present' : 'Missing')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      console.log('🔑 getCurrentUser: Found Bearer token, validating...')
      
      try {
        // Create direct Supabase client to validate token
        const supabaseDirectClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        const { data: { user }, error: tokenError } = await supabaseDirectClient.auth.getUser(token)
        
        if (tokenError) {
          console.log('❌ getCurrentUser: Token validation failed:', tokenError.message)
        } else if (user) {
          console.log('✅ getCurrentUser: Token validation successful!')
          console.log('👤 getCurrentUser: User from token:', {
            id: user.id,
            email: user.email,
            metadata: user.user_metadata
          })
          
          // Create user profile from token user
          const userProfile = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Användare',
            role: user.user_metadata?.role || 'ADMIN',
            isActive: true
          }
          
          return userProfile
        }
      } catch (tokenValidationError) {
        console.log('💥 getCurrentUser: Exception validating token:', tokenValidationError)
      }
    }
    
    // APPROACH 2: Fall back to cookie-based authentication
    console.log('🍪 getCurrentUser: Falling back to cookie-based auth...')
    
    // DEBUG: Log all available cookies
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    console.log('🍪 getCurrentUser: All cookies available:', allCookies.map((c: any) => ({
      name: c.name,
      value: c.value ? `${c.value.substring(0, 50)}...` : 'empty',
      hasValue: !!c.value
    })))
    
    // Look specifically for Supabase auth cookies
    const supabaseAuthCookies = allCookies.filter((c: any) => c.name.includes('auth-token'))
    console.log('🔑 getCurrentUser: Supabase auth cookies found:', supabaseAuthCookies.length)
    supabaseAuthCookies.forEach((cookie: any) => {
      console.log(`🔑 getCurrentUser: Auth cookie '${cookie.name}':`, cookie.value ? 'Has value' : 'Empty')
    })
    
    // Get Supabase session using server components client
    const supabase = createRouteHandlerClient({ cookies })
    console.log('🍪 getCurrentUser: Created supabase client')
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('📋 getCurrentUser: Session check result:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      error: sessionError?.message,
      sessionAccessToken: session?.access_token ? 'Present' : 'Missing',
      sessionExpiry: session?.expires_at
    })

    if (sessionError || !session?.user) {
      console.log('❌ getCurrentUser: No valid session found')
      console.log('🔍 getCurrentUser: Session error:', sessionError?.message || 'No session')
      return null
    }

    const user = session.user
    console.log('👤 getCurrentUser: Raw user from session:', {
      id: user.id,
      email: user.email,
      metadata: user.user_metadata,
      aud: user.aud,
      role: user.role
    })

    // Create user profile from Supabase Auth user metadata (same as AuthProvider)
    const userProfile = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Användare',
      role: user.user_metadata?.role || 'ADMIN', // Default till admin för nu
      isActive: true // Supabase Auth users are active by default
    }

    console.log('✅ getCurrentUser: Created user profile:', userProfile)

    return userProfile
  } catch (error) {
    console.error('💥 getCurrentUser: Exception occurred:', error)
    return null
  }
}

/**
 * Require user to have one of the specified roles
 * Throws UnauthorizedError if not authenticated
 * Throws InsufficientPermissionError if insufficient permissions
 */
export async function requireRole(allowedRoles: UserProfile['role'][]): Promise<AuthUser> {
  const user = await getCurrentUser()

  if (!user) {
    throw new UnauthorizedError('Authentication required')
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account is inactive')
  }

  if (!allowedRoles.includes(user.role)) {
    throw new InsufficientPermissionError(
      `Access denied. Required roles: ${allowedRoles.join(', ')}. Current role: ${user.role}`
    )
  }

  return user
}

/**
 * Check if user has admin role
 */
export async function requireAdmin(): Promise<AuthUser> {
  return requireRole(['ADMIN'])
}

/**
 * Check if user has internal (staff) access
 */
export async function requireInternal(): Promise<AuthUser> {
  return requireRole(['ADMIN', 'INHOUSE'])
}

/**
 * Get user role permissions for specific operations
 */
export function getUserPermissions(role: UserProfile['role']) {
  const permissions = {
    canCreateCustomers: false,
    canEditAllCustomers: false,
    canDeleteCustomers: false,
    canViewAllCustomers: false,
    canManageUsers: false,
    canAccessReports: false,
    canManageSettings: false
  }

  switch (role) {
    case 'ADMIN':
      return {
        ...permissions,
        canCreateCustomers: true,
        canEditAllCustomers: true,
        canDeleteCustomers: true,
        canViewAllCustomers: true,
        canManageUsers: true,
        canAccessReports: true,
        canManageSettings: true
      }

    case 'INHOUSE':
      return {
        ...permissions,
        canCreateCustomers: true,
        canEditAllCustomers: true,
        canViewAllCustomers: true,
        canAccessReports: true
      }

    case 'SALESPERSON':
      return {
        ...permissions,
        canCreateCustomers: true,
        canEditAllCustomers: false,
        canViewAllCustomers: false
      }

    case 'INSTALLER':
      return {
        ...permissions,
        canCreateCustomers: false,
        canEditAllCustomers: false,
        canViewAllCustomers: false
      }

    default:
      return permissions
  }
}

/**
 * Validate if user can access specific customer based on role and assignment
 */
export function canAccessCustomer(
  userRole: UserProfile['role'], 
  userId: string, 
  customerAssignedTo: string | null
): boolean {
  switch (userRole) {
    case 'ADMIN':
    case 'INHOUSE':
      return true

    case 'SALESPERSON':
      // Can access own customers or unassigned customers
      return customerAssignedTo === userId || customerAssignedTo === null

    case 'INSTALLER':
      // Installers typically don't need customer access restrictions
      return true

    default:
      return false
  }
}