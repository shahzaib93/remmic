import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../../../components/Navbar'
import Footer from '../../../../components/Footer'
import { useFirebase } from '../../../../contexts/FirebaseContext'
import { getDocuments, addDocument, deleteDocument } from '../../../../lib/firebase'
import styles from '../../../../styles/adminOverview.module.css'

const DOCUMENT_CATEGORIES = {
  OWNERSHIP: 'ownership',
  LEASE: 'lease',
  UTILITY: 'utility',
  TAX: 'tax',
  MANAGEMENT: 'management',
  LEGAL: 'legal',
  INSURANCE: 'insurance',
  OTHER: 'other'
}

const CATEGORY_LABELS = {
  ownership: 'Ownership Documents',
  lease: 'Lease Agreements',
  utility: 'Utility Bills',
  tax: 'Tax Documents',
  management: 'Management Reports',
  legal: 'Legal Documents',
  insurance: 'Insurance',
  other: 'Other'
}

const CATEGORY_COLORS = {
  ownership: { bg: '#dbeafe', color: '#1d4ed8' },
  lease: { bg: '#d1fae5', color: '#059669' },
  utility: { bg: '#fef3c7', color: '#d97706' },
  tax: { bg: '#fce7f3', color: '#db2777' },
  management: { bg: '#e0e7ff', color: '#4f46e5' },
  legal: { bg: '#f3e8ff', color: '#9333ea' },
  insurance: { bg: '#cffafe', color: '#0891b2' },
  other: { bg: '#f3f4f6', color: '#6b7280' }
}

export default function DocumentVault() {
  const router = useRouter()
  const { id: propertyId } = router.query
  const { user } = useFirebase()
  const fileInputRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [property, setProperty] = useState(null)
  const [documents, setDocuments] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: DOCUMENT_CATEGORIES.OTHER,
    description: '',
    file: null
  })

  const loadData = useCallback(async () => {
    if (!propertyId) return
    setLoading(true)
    try {
      // Load property
      const storedProperties = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('userProperties') || '[]')
        : []
      const foundProperty = storedProperties.find(p => p.id === propertyId)
      setProperty(foundProperty || { id: propertyId, title: 'Property' })

      // Load documents
      const docsResult = await getDocuments(propertyId)
      if (docsResult.success) {
        setDocuments(docsResult.documents || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadForm(prev => ({
        ...prev,
        file,
        name: prev.name || file.name.replace(/\.[^/.]+$/, '')
      }))
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadForm.file || !uploadForm.name) return

    setUploading(true)
    try {
      // Convert file to base64 for storage (in production, use cloud storage)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const fileData = {
          propertyId,
          name: uploadForm.name,
          category: uploadForm.category,
          description: uploadForm.description,
          fileName: uploadForm.file.name,
          fileType: uploadForm.file.type,
          fileSize: uploadForm.file.size,
          fileUrl: reader.result, // Base64 data URI
          version: 1,
          uploadedBy: user?.uid || 'anonymous',
          uploadedByName: user?.displayName || user?.email || 'Unknown'
        }

        const result = await addDocument(fileData)
        if (result.success) {
          setDocuments(prev => [result.document, ...prev])
          setShowUploadModal(false)
          setUploadForm({
            name: '',
            category: DOCUMENT_CATEGORIES.OTHER,
            description: '',
            file: null
          })
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
        setUploading(false)
      }
      reader.readAsDataURL(uploadForm.file)
    } catch (error) {
      console.error('Error uploading document:', error)
      setUploading(false)
    }
  }

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const result = await deleteDocument(docId)
      if (result.success) {
        setDocuments(prev => prev.filter(d => d.id !== docId))
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const handlePreview = (doc) => {
    setPreviewDoc(doc)
    setShowPreviewModal(true)
  }

  const handleDownload = (doc) => {
    const link = document.createElement('a')
    link.href = doc.fileUrl
    link.download = doc.fileName || `${doc.name}.pdf`
    link.click()
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const filteredDocuments = selectedCategory === 'all'
    ? documents
    : documents.filter(d => d.category === selectedCategory)

  const categoryCounts = Object.keys(DOCUMENT_CATEGORIES).reduce((acc, key) => {
    const cat = DOCUMENT_CATEGORIES[key]
    acc[cat] = documents.filter(d => d.category === cat).length
    return acc
  }, {})

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄'
    if (fileType?.includes('image')) return '🖼️'
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝'
    if (fileType?.includes('sheet') || fileType?.includes('excel')) return '📊'
    return '📎'
  }

  return (
    <>
      <Head>
        <title>Document Vault | REMMIC</title>
      </Head>
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto', minHeight: '70vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href={`/management/property/${propertyId}`} style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            Back to Property Dashboard
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ margin: 0, color: '#1f2937' }}>Document Vault</h1>
            <button
              onClick={() => setShowUploadModal(true)}
              className={styles.actionButtonPrimary}
              style={{ padding: '0.75rem 1.25rem' }}
            >
              + Upload Document
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className={styles.panel} style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Filter by Category</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                border: 'none',
                cursor: 'pointer',
                background: selectedCategory === 'all' ? '#f97316' : '#f3f4f6',
                color: selectedCategory === 'all' ? 'white' : '#374151',
                fontWeight: 500
              }}
            >
              All ({documents.length})
            </button>
            {Object.entries(DOCUMENT_CATEGORIES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '2rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedCategory === value ? CATEGORY_COLORS[value].color : CATEGORY_COLORS[value].bg,
                  color: selectedCategory === value ? 'white' : CATEGORY_COLORS[value].color,
                  fontWeight: 500
                }}
              >
                {CATEGORY_LABELS[value]} ({categoryCounts[value] || 0})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280' }}>Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className={styles.panel} style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              {selectedCategory === 'all' ? 'No documents uploaded yet' : `No ${CATEGORY_LABELS[selectedCategory]} found`}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className={styles.actionButtonPrimary}
            >
              Upload First Document
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {filteredDocuments.map(doc => (
              <div key={doc.id} className={styles.panel} style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>{getFileIcon(doc.fileType)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', wordBreak: 'break-word' }}>{doc.name}</h4>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      background: CATEGORY_COLORS[doc.category]?.bg || '#f3f4f6',
                      color: CATEGORY_COLORS[doc.category]?.color || '#6b7280'
                    }}>
                      {CATEGORY_LABELS[doc.category] || 'Other'}
                    </span>
                  </div>
                </div>

                {doc.description && (
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1rem', lineHeight: 1.4 }}>
                    {doc.description}
                  </p>
                )}

                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Size: {formatFileSize(doc.fileSize)}</span>
                    <span>v{doc.version || 1}</span>
                  </div>
                  <div>Uploaded: {formatDate(doc.createdAt)}</div>
                  {doc.uploadedByName && <div>By: {doc.uploadedByName}</div>}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {doc.fileType?.includes('image') || doc.fileType?.includes('pdf') ? (
                    <button
                      onClick={() => handlePreview(doc)}
                      className={styles.actionButtonSecondary}
                      style={{ flex: 1, padding: '0.5rem' }}
                    >
                      Preview
                    </button>
                  ) : null}
                  <button
                    onClick={() => handleDownload(doc)}
                    className={styles.actionButtonPrimary}
                    style={{ flex: 1, padding: '0.5rem' }}
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    style={{
                      padding: '0.5rem',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(249, 115, 22, 0.05)',
          border: '1px solid rgba(249, 115, 22, 0.2)',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          color: '#92400e'
        }}>
          Documents are stored securely. REMMIC provides coordination and reporting services only and does not guarantee document validity or legal compliance.
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 1.5rem' }}>Upload Document</h2>
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>File *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px dashed #e5e7eb',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                  required
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Supported: PDF, Word, Excel, Images (Max 10MB)
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Document Name *</label>
                <input
                  type="text"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Lease Agreement 2024"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category *</label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                >
                  {Object.entries(DOCUMENT_CATEGORIES).map(([key, value]) => (
                    <option key={key} value={value}>{CATEGORY_LABELS[value]}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional notes about this document..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadForm({ name: '', category: DOCUMENT_CATEGORIES.OTHER, description: '', file: null })
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className={styles.actionButtonSecondary}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadForm.file}
                  className={styles.actionButtonPrimary}
                  style={{ flex: 1 }}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewDoc && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1rem',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowPreviewModal(false)
                setPreviewDoc(null)
              }}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <h3 style={{ margin: '0 0 1rem', paddingRight: '2rem' }}>{previewDoc.name}</h3>

            {previewDoc.fileType?.includes('image') ? (
              <img
                src={previewDoc.fileUrl}
                alt={previewDoc.name}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
            ) : previewDoc.fileType?.includes('pdf') ? (
              <iframe
                src={previewDoc.fileUrl}
                style={{ width: '80vw', height: '70vh', border: 'none' }}
                title={previewDoc.name}
              />
            ) : (
              <p>Preview not available for this file type.</p>
            )}

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleDownload(previewDoc)}
                className={styles.actionButtonPrimary}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
