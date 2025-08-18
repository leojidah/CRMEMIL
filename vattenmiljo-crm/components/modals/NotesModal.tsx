'use client'

import React, { useState, useEffect } from 'react'
import { X, MessageSquare, Save, Loader2, AlertCircle } from 'lucide-react'

interface Note {
  id: string
  content: string
  created_at: string
  author: string
  author_id?: string
  is_private?: boolean
  customer_id: string
}

interface NotesModalProps {
  isOpen: boolean
  onClose: () => void
  customerId: string
  customerName: string
}

export default function NotesModal({ isOpen, onClose, customerId, customerName }: NotesModalProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && customerId) {
      fetchNotes()
    }
  }, [isOpen, customerId])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/customers/${customerId}/notes`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }

      const data = await response.json()
      setNotes(data.notes || [])
    } catch (err) {
      console.error('Error fetching notes:', err)
      setError('Kunde inte ladda anteckningar')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNote = async () => {
    if (!newNote.trim()) return

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/customers/${customerId}/notes`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newNote.trim(),
          isPrivate: isPrivate
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save note')
      }

      const result = await response.json()
      
      // Add new note to the list
      setNotes(prev => [result.note, ...prev])
      setNewNote('')
      
      // Show success briefly
      setTimeout(() => {
        setError(null)
      }, 3000)
      
    } catch (err) {
      console.error('Error saving note:', err)
      setError('Kunde inte spara anteckningen')
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSaveNote()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Anteckningar
                  </h2>
                  <p className="text-sm text-gray-600">{customerName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col max-h-[calc(90vh-80px)]">
            {/* New note form */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="space-y-4">
                {/* Privacy toggle */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">
                      🔒 Privat anteckning (endast synlig för dig)
                    </span>
                  </label>
                </div>

                {/* Note input */}
                <div className="space-y-2">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Skriv en ny anteckning... (Ctrl/Cmd + Enter för att spara)"
                    rows={4}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Ctrl/Cmd + Enter för att spara snabbt
                    </p>
                    <button
                      onClick={handleSaveNote}
                      disabled={!newNote.trim() || saving}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Spara
                    </button>
                  </div>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}
            </div>

            {/* Notes list */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Laddar anteckningar...</span>
                  </div>
                </div>
              ) : notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {note.is_private ? '🔒' : '📝'}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {note.is_private ? 'Privat anteckning' : 'Anteckning'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(note.created_at)}
                        </span>
                      </div>
                      
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-900 whitespace-pre-wrap">{note.content}</p>
                      </div>
                      
                      {note.author && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            Av: {note.author}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Inga anteckningar än
                  </h3>
                  <p className="text-gray-600">
                    Lägg till den första anteckningen för denna kund
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}