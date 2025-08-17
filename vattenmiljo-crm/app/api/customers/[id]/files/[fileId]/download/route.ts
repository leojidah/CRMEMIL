import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin, supabaseStorage } from '@/lib/supabase-server'

const STORAGE_BUCKET = 'customer-files'

export async function GET(
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

    // Get file from storage
    const { data: fileData, error: storageError } = await supabaseStorage
      .from(STORAGE_BUCKET)
      .download(fileRecord.storage_path)

    if (storageError || !fileData) {
      console.error('Error downloading file from storage:', storageError)
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
    }

    // Convert blob to buffer
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Log download activity
    await supabaseAdmin
      .from('customer_activities')
      .insert({
        customer_id: params.id,
        type: 'file_download',
        title: 'File downloaded',
        description: `Downloaded file: ${fileRecord.file_name}`,
        performed_by: user.name || user.email || 'Unknown User',
        performed_by_id: user.id
      })

    // Return file with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': fileRecord.mime_type || 'application/octet-stream',
        'Content-Length': fileRecord.size.toString(),
        'Content-Disposition': `attachment; filename="${fileRecord.file_name}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}