// Temporary stub to prevent build errors in API routes
// This should be replaced with proper Supabase auth for production

export async function auth() {
  // Return null to disable API routes temporarily
  return { session: null }
}