import { NextRequest, NextResponse } from 'next/server'
import { auth } from 'next/server'
import { authOptions } from '@/lib/auth'
import { deleteOldBackups } from '@/lib/backup'

export async function POST(request: NextRequest) {
  try {
    const session = await auth(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only internal users can cleanup backups
    if (session.user.role !== 'internal') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { retentionDays = 30 } = body

    const deletedCount = await deleteOldBackups(retentionDays)

    return NextResponse.json({ 
      message: `Cleaned up ${deletedCount} old backups`,
      deletedCount 
    })
  } catch (error: any) {
    console.error('Backup cleanup error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to cleanup backups' 
    }, { status: 500 })
  }
}