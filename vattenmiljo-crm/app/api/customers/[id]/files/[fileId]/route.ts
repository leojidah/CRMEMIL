import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin, supabaseStorage } from '@/lib/supabase-server'

const STORAGE_BUCKET = 'customer-files'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get file metadata
    const { data: fileRecord, error: fileError } = await supabaseAdmin
      .from('customer_files')
      .select('*')
      .eq('id', params.fileId)
      .eq('customer_id', params.id)
      .single()

    if (fileError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete from storage
    const { error: storageError } = await supabaseStorage
      .from(STORAGE_BUCKET)
      .remove([fileRecord.storage_path])

    if (storageError) {
      console.error('Error deleting file from storage:', storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('customer_files')
      .delete()
      .eq('id', params.fileId)

    if (dbError) {
      console.error('Error deleting file from database:', dbError)
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
    }

    // Log activity
    await supabaseAdmin
      .from('customer_activities')
      .insert({
        customer_id: params.id,
        type: 'file_delete',
        title: 'File deleted',
        description: `Deleted file: ${fileRecord.file_name}`,
        performed_by: user.name || user.email || 'Unknown User',
        performed_by_id: user.id
      })

    return NextResponse.json({ message: 'File deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}