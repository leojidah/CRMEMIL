import { NextRequest, NextResponse } from 'next/server'
import { auth } from 'next/server'
import { authOptions } from '@/lib/auth'
import { 
  createDatabaseBackup, 
  createFilesBackup, 
  createFullBackup, 
  getBackupHistory 
} from '@/lib/backup'

export async function GET(request: NextRequest) {
  try {
    const session = await auth(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only internal users can access backup history
    if (session.user.role !== 'internal') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const history = await getBackupHistory(limit)
    return NextResponse.json({ backups: history })
  } catch (error) {
    console.error('Backup history error:', error)
    return NextResponse.json({ error: 'Failed to fetch backup history' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only internal users can create backups
    if (session.user.role !== 'internal') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { type = 'full' } = body

    let result
    switch (type) {
      case 'database':
        result = await createDatabaseBackup()
        break
      case 'files':
        result = await createFilesBackup()
        break
      case 'full':
        result = await createFullBackup()
        break
      default:
        return NextResponse.json({ error: 'Invalid backup type' }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Backup created successfully',
      backup: result 
    })
  } catch (error: any) {
    console.error('Backup creation error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to create backup' 
    }, { status: 500 })
  }
}