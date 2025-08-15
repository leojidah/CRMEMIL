import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function getServerUser() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  return { user, error }
}

export async function getServerSession() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  return { session, error }
}