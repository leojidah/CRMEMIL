import { NextRequest, NextResponse } from 'next/server'
import { auth } from 'next/server'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const session = await auth(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const customerId = formData.get('customerId') as string
    const category = formData.get('category') as string || 'other'

    if (!file || !customerId) {
      return NextResponse.json(
        { error: 'File and customer ID are required' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not supported' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${customerId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('customer-files')
      .upload(uniqueFileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('customer-files')
      .getPublicUrl(uniqueFileName)

    // Save file record to database
    const { data: fileRecord, error: dbError } = await supabaseAdmin
      .from('customer_files')
      .insert({
        customer_id: customerId,
        filename: uniqueFileName,
        original_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        storage_path: uploadData.path,
        url: publicUrlData.publicUrl,
        category,
        uploaded_by: session.user.name,
        uploaded_by_id: session.user.id
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to clean up uploaded file
      await supabaseAdmin.storage
        .from('customer-files')
        .remove([uniqueFileName])
      
      return NextResponse.json({ error: 'Failed to save file record' }, { status: 500 })
    }

    // Log activity
    await supabaseAdmin
      .from('customer_activities')
      .insert({
        customer_id: customerId,
        type: 'file_uploaded',
        title: 'File uploaded',
        description: `File "${file.name}" uploaded`,
        performed_by: session.user.name,
        performed_by_id: session.user.id,
        metadata: {
          filename: file.name,
          fileSize: file.size,
          fileType: file.type,
          category
        }
      })

    return NextResponse.json({ 
      file: fileRecord,
      message: 'File uploaded successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    // Check permissions - only internal users or file uploader can delete
    if (session.user.role !== 'internal') {
      const { data: fileRecord } = await supabaseAdmin
        .from('customer_files')
        .select('uploaded_by_id')
        .eq('id', fileId)
        .single()

      if (fileRecord?.uploaded_by_id !== session.user.id) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }

    // Get file info before deletion
    const { data: fileRecord, error: fetchError } = await supabaseAdmin
      .from('customer_files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete from storage
    const { error: storageError } = await supabaseAdmin.storage
      .from('customer-files')
      .remove([fileRecord.filename])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('customer_files')
      .delete()
      .eq('id', fileId)

    if (dbError) {
      console.error('Database deletion error:', dbError)
      return NextResponse.json({ error: 'Failed to delete file record' }, { status: 500 })
    }

    // Log activity
    await supabaseAdmin
      .from('customer_activities')
      .insert({
        customer_id: fileRecord.customer_id,
        type: 'custom',
        title: 'File deleted',
        description: `File "${fileRecord.original_name}" was deleted`,
        performed_by: session.user.name,
        performed_by_id: session.user.id
      })

    return NextResponse.json({ message: 'File deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}