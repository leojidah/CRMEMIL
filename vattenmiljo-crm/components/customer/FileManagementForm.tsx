'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Customer, CustomerFile } from '@/lib/types'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Download, 
  Trash2, 
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
  Loader2
} from 'lucide-react'

interface FileManagementFormProps {
  customer: Customer
  onCustomerChange: (customer: Customer) => void
  onValidationChange?: (isValid: boolean) => void
}

interface FileUploadProgress {
  fileName: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

export default function FileManagementForm({ 
  customer, 
  onCustomerChange, 
  onValidationChange 
}: FileManagementFormProps) {
  const [files, setFiles] = useState<CustomerFile[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  
  const { accessToken } = useSupabaseAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // File type configurations
  const ALLOWED_FILE_TYPES = {
    'image/jpeg': { icon: Image, label: 'JPEG Bild', maxSize: 10 * 1024 * 1024 }, // 10MB
    'image/png': { icon: Image, label: 'PNG Bild', maxSize: 10 * 1024 * 1024 },
    'image/gif': { icon: Image, label: 'GIF Bild', maxSize: 10 * 1024 * 1024 },
    'application/pdf': { icon: FileText, label: 'PDF Dokument', maxSize: 20 * 1024 * 1024 }, // 20MB
    'application/msword': { icon: File, label: 'Word Dokument', maxSize: 20 * 1024 * 1024 },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: File, label: 'Word Dokument', maxSize: 20 * 1024 * 1024 },
    'text/plain': { icon: FileText, label: 'Text Fil', maxSize: 5 * 1024 * 1024 }, // 5MB
    'text/csv': { icon: FileText, label: 'CSV Fil', maxSize: 5 * 1024 * 1024 },
  }

  const MAX_FILES = 20
  const MAX_TOTAL_SIZE = 100 * 1024 * 1024 // 100MB total

  // Fetch customer files on component mount
  useEffect(() => {
    if (customer.id && accessToken) {
      fetchCustomerFiles()
    }
  }, [customer.id, accessToken])

  // Validation
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(true) // File uploads are optional, so always valid
    }
  }, [files, onValidationChange])

  const buildAuthHeaders = () => {
    const headers: Record<string, string> = {}
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
    return headers
  }

  const fetchCustomerFiles = async () => {
    try {
      setLoading(true)
      setError(null)


      const response = await fetch(`/api/customers/${customer.id}/files`, {
        method: 'GET',
        credentials: 'include',
        headers: buildAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch files (${response.status})`)
      }

      const data = await response.json()
      
      setFiles(data.files || [])
    } catch (err) {
      console.error('💥 FileManagement: Error fetching files:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load files'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]) {
      return `Filtypen ${file.type} stöds inte. Tillåtna format: ${Object.values(ALLOWED_FILE_TYPES).map(t => t.label).join(', ')}`
    }

    // Check file size
    const typeConfig = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]
    if (file.size > typeConfig.maxSize) {
      return `Filen är för stor. Max storlek för ${typeConfig.label}: ${(typeConfig.maxSize / 1024 / 1024).toFixed(1)}MB`
    }

    // Check total files limit
    if (files.length >= MAX_FILES) {
      return `Du kan inte ladda upp fler än ${MAX_FILES} filer per kund`
    }

    // Check total size limit
    const currentTotalSize = files.reduce((sum, f) => sum + (f.size || 0), 0)
    if (currentTotalSize + file.size > MAX_TOTAL_SIZE) {
      return `Total filstorlek skulle överskrida gränsen på ${(MAX_TOTAL_SIZE / 1024 / 1024).toFixed(0)}MB`
    }

    return null
  }

  const uploadFile = async (file: File): Promise<CustomerFile> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('customerId', customer.id)

    const response = await fetch(`/api/customers/${customer.id}/files`, {
      method: 'POST',
      credentials: 'include',
      headers: buildAuthHeaders(),
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Upload failed (${response.status})`)
    }

    const data = await response.json()
    return data.file
  }

  const handleFileUpload = async (filesToUpload: FileList | File[]) => {
    const fileArray = Array.from(filesToUpload)
    
    if (fileArray.length === 0) return

    setUploading(true)
    setError(null)
    
    // Initialize progress tracking
    const initialProgress: FileUploadProgress[] = fileArray.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }))
    setUploadProgress(initialProgress)

    try {

      const uploadPromises = fileArray.map(async (file, index) => {
        try {
          // Validate file
          const validationError = validateFile(file)
          if (validationError) {
            throw new Error(validationError)
          }

          // Update progress to show start
          setUploadProgress(prev => prev.map((p, i) => 
            i === index ? { ...p, progress: 10 } : p
          ))

          // Upload file
          const uploadedFile = await uploadFile(file)

          // Update progress to completed
          setUploadProgress(prev => prev.map((p, i) => 
            i === index ? { ...p, progress: 100, status: 'completed' } : p
          ))

          return uploadedFile
        } catch (error) {
          // Update progress to error
          setUploadProgress(prev => prev.map((p, i) => 
            i === index ? { 
              ...p, 
              progress: 0, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed' 
            } : p
          ))
          
          console.error(`💥 FileManagement: Error uploading ${file.name}:`, error)
          return null
        }
      })

      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter((result): result is CustomerFile => result !== null)

      if (successfulUploads.length > 0) {
        
        // Update local files list
        setFiles(prev => [...prev, ...successfulUploads])

        // Refresh files from server to ensure consistency
        setTimeout(() => {
          fetchCustomerFiles()
        }, 1000)
      }

      const failedUploads = results.filter(result => result === null).length
      if (failedUploads > 0) {
        setError(`${failedUploads} av ${fileArray.length} filer kunde inte laddas upp. Se detaljer ovan.`)
      }

    } catch (err) {
      console.error('💥 FileManagement: Error during upload:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      
      // Clear progress after 3 seconds
      setTimeout(() => {
        setUploadProgress([])
      }, 3000)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      handleFileUpload(files)
    }
    // Reset input value to allow uploading the same file again
    event.target.value = ''
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const deleteFile = async (fileId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna fil?')) {
      return
    }

    try {
      setError(null)

      const response = await fetch(`/api/customers/${customer.id}/files/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to delete file (${response.status})`)
      }

      
      // Remove file from local state
      setFiles(prev => prev.filter(file => file.id !== fileId))

    } catch (err) {
      console.error('💥 FileManagement: Error deleting file:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete file')
    }
  }

  const downloadFile = async (file: CustomerFile) => {
    try {

      const response = await fetch(`/api/customers/${customer.id}/files/${file.id}/download`, {
        method: 'GET',
        credentials: 'include',
        headers: buildAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to download file')
      }

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)


    } catch (err) {
      console.error('💥 FileManagement: Error downloading file:', err)
      setError(err instanceof Error ? err.message : 'Failed to download file')
    }
  }

  const getFileIcon = (mimeType: string) => {
    const config = ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES]
    return config?.icon || File
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const totalFileSize = files.reduce((sum, file) => sum + (file.size || 0), 0)

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Upload className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Ladda upp filer</h3>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <Upload className={`w-12 h-12 mx-auto ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Dra och släpp filer här
              </p>
              <p className="text-sm text-gray-600 mb-4">
                eller klicka för att välja filer
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Välj filer
              </button>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={Object.keys(ALLOWED_FILE_TYPES).join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* File Type Info */}
        <div className="mt-4 text-sm text-gray-600">
          <p className="font-medium mb-2">Tillåtna filformat:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.values(ALLOWED_FILE_TYPES).map((type, index) => (
              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {type.label}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Max {MAX_FILES} filer • Max {(MAX_TOTAL_SIZE / 1024 / 1024).toFixed(0)}MB totalt
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Uppladdningsstatus</h4>
          <div className="space-y-3">
            {uploadProgress.map((progress, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-4">
                    {progress.fileName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {progress.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {progress.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {progress.status === 'error' && <X className="w-4 h-4 text-red-500" />}
                  </span>
                </div>
                {progress.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                )}
                {progress.status === 'error' && progress.error && (
                  <p className="text-xs text-red-600">{progress.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <File className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Uppladdade filer</h3>
          </div>
          <div className="text-sm text-gray-600">
            {files.length} filer • {formatFileSize(totalFileSize)}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Laddar filer...</p>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8">
            <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Inga filer uppladdade än</p>
            <p className="text-sm text-gray-500 mt-1">
              Ladda upp filer för att dela dem med kunden
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.mimeType)
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FileIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.fileName}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(file.uploadedAt).toLocaleDateString('sv-SE')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => downloadFile(file)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ladda ner fil"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Ta bort fil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800 font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}