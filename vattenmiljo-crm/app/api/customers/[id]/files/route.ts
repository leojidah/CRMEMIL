import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin, supabaseStorage } from '@/lib/supabase-server'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv'
]

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
const STORAGE_BUCKET = 'customer-files'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify customer exists and user has access
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('id', params.id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Fetch customer files
    const { data: files, error } = await supabaseAdmin
      .from('customer_files')
      .select('*')
      .eq('customer_id', params.id)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Error fetching customer files:', error)
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
    }

    return NextResponse.json({ files: files || [] })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify customer exists
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('id, name')
      .eq('id', params.id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: `File type ${file.type} not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` 
      }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }, { status: 400 })
    }

    // Check file count limit (max 20 files per customer)
    const { count } = await supabaseAdmin
      .from('customer_files')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', params.id)

    if ((count || 0) >= 20) {
      return NextResponse.json({ 
        error: 'Maximum number of files (20) reached for this customer' 
      }, { status: 400 })
    }

    // Generate unique file path
    const fileExtension = file.name.split('.').pop() || 'bin'
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    const filePath = `customers/${params.id}/${uniqueFileName}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseStorage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Save file metadata to database
    const { data: fileRecord, error: dbError } = await supabaseAdmin
      .from('customer_files')
      .insert({
        customer_id: params.id,
        file_name: file.name,
        original_name: file.name,
        mime_type: file.type,
        size: file.size,
        storage_path: filePath,
        uploaded_by: user.id,
        uploaded_by_name: user.name || user.email
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving file metadata:', dbError)
      
      // Clean up uploaded file if database insert fails
      await supabaseStorage
        .from(STORAGE_BUCKET)
        .remove([filePath])
      
      return NextResponse.json({ error: 'Failed to save file metadata' }, { status: 500 })
    }

    // Log activity
    await supabaseAdmin
      .from('customer_activities')
      .insert({
        customer_id: params.id,
        type: 'file_upload',
        title: 'File uploaded',
        description: `Uploaded file: ${file.name}`,
        performed_by: user.name || user.email || 'Unknown User',
        performed_by_id: user.id
      })

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      file: fileRecord
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}