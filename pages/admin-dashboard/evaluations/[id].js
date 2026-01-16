import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import { useFirebase } from '../../../contexts/FirebaseContext'
import { updateEvaluationInternalReview, logActivity } from '../../../lib/firebase'
import { generateEvaluationPdf } from '../../../utils/pdf'

const EVALUATION_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  ACCEPTED: 'accepted',
  INCOMPLETE: 'incomplete',
  REJECTED: 'rejected'
}

const NEXT_STEPS = {
  DETAILED_EVALUATION: 'detailed_evaluation',
  LEGAL_REVIEW: 'legal_review',
  SITE_VISIT: 'site_visit',
  PROPERTY_LISTING: 'property_listing',
  DEVELOPMENT_PROJECT: 'development_project'
}

const STATUS_COLORS = {
  pending: { bg: '#fef3c7', color: '#d97706' },
  under_review: { bg: '#dbeafe', color: '#2563eb' },
  accepted: { bg: '#d1fae5', color: '#059669' },
  incomplete: { bg: '#fef3c7', color: '#d97706' },
  rejected: { bg: '#fee2e2', color: '#dc2626' }
}

export default function EvaluationReview() {
  const router = useRouter()
  const { id: evaluationId } = router.query
  const { user } = useFirebase()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  const [evaluators, setEvaluators] = useState([])

  const [internalReview, setInternalReview] = useState({
    status: EVALUATION_STATUS.PENDING,
    assignedEvaluator: '',
    internalNotes: '',
    redFlags: '',
    nextStep: '',
    evaluationValue: '',
    adminComment: ''
  })

  const loadData = useCallback(async () => {
    if (!evaluationId) return
    setLoading(true)
    try {
      // Load evaluation from localStorage
      const storedEvaluations = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('propertyEvaluations') || '[]')
        : []
      const foundEvaluation = storedEvaluations.find(e => e.id === evaluationId || e.evaluationId === evaluationId)
      setEvaluation(foundEvaluation)

      if (foundEvaluation?.internalReview) {
        setInternalReview(prev => ({ ...prev, ...foundEvaluation.internalReview }))
      }

      // Load evaluators from localStorage (simulated)
      const storedEvaluators = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('evaluators') || '[]')
        : []
      setEvaluators(storedEvaluators.length > 0 ? storedEvaluators : [
        { id: '1', name: 'Ahmad Khan', email: 'ahmad@remmic.pk', specialty: 'Residential' },
        { id: '2', name: 'Fatima Ali', email: 'fatima@remmic.pk', specialty: 'Commercial' },
        { id: '3', name: 'Usman Malik', email: 'usman@remmic.pk', specialty: 'Land' }
      ])

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [evaluationId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setInternalReview(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const reviewData = {
        ...internalReview,
        evaluationValue: parseFloat(internalReview.evaluationValue) || null,
        reviewedBy: user?.uid || 'admin',
        reviewedByName: user?.displayName || user?.email || 'Admin',
        reviewedAt: new Date().toISOString()
      }

      // Update in Firebase
      await updateEvaluationInternalReview(evaluationId, reviewData)

      // Update localStorage
      const storedEvaluations = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('propertyEvaluations') || '[]')
        : []
      const updatedEvaluations = storedEvaluations.map(e =>
        (e.id === evaluationId || e.evaluationId === evaluationId)
          ? { ...e, internalReview: reviewData, status: internalReview.status }
          : e
      )
      localStorage.setItem('propertyEvaluations', JSON.stringify(updatedEvaluations))

      // Log activity
      await logActivity({
        entityType: 'evaluation',
        entityId: evaluationId,
        action: 'status_changed',
        description: `Evaluation status changed to ${internalReview.status}`,
        changedBy: user?.uid || 'admin',
        changedByName: user?.displayName || user?.email || 'Admin'
      })

      setEvaluation(prev => ({ ...prev, internalReview: reviewData, status: internalReview.status }))
      alert('Review saved successfully!')
    } catch (error) {
      console.error('Error saving review:', error)
      alert('Error saving review. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleGeneratePDF = () => {
    try {
      const result = generateEvaluationPdf(evaluation, internalReview.adminComment)
      const link = document.createElement('a')
      link.href = result.pdfDataUri
      link.download = `evaluation-${evaluationId?.slice(0, 8)}-${Date.now()}.pdf`
      link.click()
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF')
    }
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A'
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <>
        <Head><title>Loading... | REMMIC Admin</title></Head>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center', minHeight: '70vh' }}>
          <p style={{ color: '#6b7280' }}>Loading evaluation...</p>
        </main>
        <Footer />
      </>
    )
  }

  if (!evaluation) {
    return (
      <>
        <Head><title>Evaluation Not Found | REMMIC Admin</title></Head>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center', minHeight: '70vh' }}>
          <h1>Evaluation Not Found</h1>
          <p style={{ color: '#6b7280' }}>The evaluation could not be found.</p>
          <Link href="/admin-dashboard" className="border-none rounded-full px-5 py-2.5 text-sm font-semibold cursor-pointer bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.35)]" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Back to Dashboard
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Evaluation Review | REMMIC Admin</title>
      </Head>
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto', minHeight: '70vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/admin-dashboard" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            Back to Admin Dashboard
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, color: '#1f2937' }}>Evaluation Review</h1>
              <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                ID: {evaluation.id || evaluation.evaluationId}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                background: STATUS_COLORS[internalReview.status]?.bg || '#f3f4f6',
                color: STATUS_COLORS[internalReview.status]?.color || '#6b7280'
              }}>
                {internalReview.status?.toUpperCase().replace('_', ' ')}
              </span>
              <button
                onClick={handleGeneratePDF}
                className="border border-slate-300/35 rounded-full px-4 py-2 text-sm font-semibold bg-slate-200/50 text-gray-800 transition-colors hover:bg-slate-300/50"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Evaluation Details */}
          <div>
            {/* Client Information */}
            <div className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                Section A: Client Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Full Name</div>
                  <div style={{ fontWeight: 500 }}>{evaluation.fullName || evaluation.userName || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Contact</div>
                  <div style={{ fontWeight: 500 }}>{evaluation.contact || evaluation.userPhone || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Email</div>
                  <div style={{ fontWeight: 500 }}>{evaluation.email || evaluation.userEmail || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>CNIC</div>
                  <div style={{ fontWeight: 500 }}>{evaluation.cnic || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                Section B: Property Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Property Type</div>
                  <div style={{ fontWeight: 500 }}>{evaluation.propertyType || evaluation.property || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Location/Address</div>
                  <div style={{ fontWeight: 500 }}>{evaluation.propertyAddress || evaluation.address || evaluation.city || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Area Size</div>
                  <div style={{ fontWeight: 500 }}>{evaluation.areaSize || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Floors</div>
                  <div style={{ fontWeight: 500 }}>{evaluation.floors || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Ownership & Legal */}
            <div className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                Section C: Ownership & Legal Status
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Ownership Status</div>
                  <div style={{ fontWeight: 500 }}>{evaluation.ownershipStatus || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Title Clear</div>
                  <div style={{ fontWeight: 500 }}>{evaluation.titleClear || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Encumbrances</div>
                  <div style={{ fontWeight: 500 }}>{evaluation.encumbrances || 'None declared'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Legal Disputes</div>
                  <div style={{ fontWeight: 500 }}>{evaluation.legalDisputes || 'None declared'}</div>
                </div>
              </div>
            </div>

            {/* Financial */}
            <div className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                Section E: Financial Expectations
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Declared Value</div>
                  <div style={{ fontWeight: 500 }}>{formatCurrency(evaluation.propertyValue)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Expected Rent</div>
                  <div style={{ fontWeight: 500 }}>{formatCurrency(evaluation.expectedRent)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Purpose</div>
                  <div style={{ fontWeight: 500 }}>{evaluation.purpose || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Timeline</div>
                  <div style={{ fontWeight: 500 }}>{evaluation.timeline || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Media & Documents */}
            <div className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20">
              <h3 style={{ margin: '0 0 1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                Section G: Media & Documents
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>Property Media</div>
                  {Array.isArray(evaluation.propertyMedia) && evaluation.propertyMedia.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {evaluation.propertyMedia.slice(0, 4).map((media, i) => (
                        <div key={i} style={{
                          padding: '0.5rem',
                          background: '#f3f4f6',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem'
                        }}>
                          📎 {media.name || `File ${i + 1}`}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: '#6b7280' }}>No media uploaded</span>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>Supporting Documents</div>
                  {Array.isArray(evaluation.supportingDocuments) && evaluation.supportingDocuments.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {evaluation.supportingDocuments.slice(0, 4).map((doc, i) => (
                        <div key={i} style={{
                          padding: '0.5rem',
                          background: '#f3f4f6',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem'
                        }}>
                          📄 {doc.name || `Doc ${i + 1}`}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: '#6b7280' }}>No documents uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Internal Review Panel (Section I) */}
          <div>
            <div className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20" style={{
              position: 'sticky',
              top: '1rem',
              border: '2px solid #f97316',
              background: 'linear-gradient(to bottom, #fff7ed, white)'
            }}>
              <h3 style={{ margin: '0 0 1.5rem', color: '#c2410c' }}>
                Section I: Internal Admin Review
              </h3>

              {/* Status */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Review Status *
                </label>
                <select
                  name="status"
                  value={internalReview.status}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                >
                  <option value={EVALUATION_STATUS.PENDING}>Pending Review</option>
                  <option value={EVALUATION_STATUS.UNDER_REVIEW}>Under Review</option>
                  <option value={EVALUATION_STATUS.ACCEPTED}>Accepted</option>
                  <option value={EVALUATION_STATUS.INCOMPLETE}>Incomplete</option>
                  <option value={EVALUATION_STATUS.REJECTED}>Rejected</option>
                </select>
              </div>

              {/* Assigned Evaluator */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Assigned Evaluator
                </label>
                <select
                  name="assignedEvaluator"
                  value={internalReview.assignedEvaluator}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                >
                  <option value="">-- Select Evaluator --</option>
                  {evaluators.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.specialty})
                    </option>
                  ))}
                </select>
              </div>

              {/* Evaluated Value */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Evaluated Value (PKR)
                </label>
                <input
                  type="number"
                  name="evaluationValue"
                  value={internalReview.evaluationValue}
                  onChange={handleChange}
                  placeholder="Enter evaluated market value"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                />
                {evaluation.propertyValue && (
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Declared: {formatCurrency(evaluation.propertyValue)}
                  </p>
                )}
              </div>

              {/* Next Step */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Next Step
                </label>
                <select
                  name="nextStep"
                  value={internalReview.nextStep}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                >
                  <option value="">-- Select Next Step --</option>
                  <option value={NEXT_STEPS.DETAILED_EVALUATION}>Detailed Evaluation</option>
                  <option value={NEXT_STEPS.LEGAL_REVIEW}>Legal Review</option>
                  <option value={NEXT_STEPS.SITE_VISIT}>Site Visit Required</option>
                  <option value={NEXT_STEPS.PROPERTY_LISTING}>List for Sale/Rent</option>
                  <option value={NEXT_STEPS.DEVELOPMENT_PROJECT}>Create Development Project</option>
                </select>
              </div>

              {/* Red Flags */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Red Flags / Concerns
                </label>
                <textarea
                  name="redFlags"
                  value={internalReview.redFlags}
                  onChange={handleChange}
                  placeholder="Note any concerns, discrepancies, or issues..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Internal Notes */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Internal Notes
                </label>
                <textarea
                  name="internalNotes"
                  value={internalReview.internalNotes}
                  onChange={handleChange}
                  placeholder="Internal notes for admin reference only..."
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

              {/* Admin Comment (for PDF) */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Admin Comment (for PDF Report)
                </label>
                <textarea
                  name="adminComment"
                  value={internalReview.adminComment}
                  onChange={handleChange}
                  placeholder="Comment to include in the PDF report..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="border-none rounded-full px-5 py-2.5 text-sm font-semibold cursor-pointer bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.35)]"
                style={{ width: '100%' }}
              >
                {saving ? 'Saving...' : 'Save Review'}
              </button>

              {/* Review Info */}
              {evaluation.internalReview?.reviewedAt && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f3f4f6', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
                  <div>Last reviewed: {formatDate(evaluation.internalReview.reviewedAt)}</div>
                  <div>By: {evaluation.internalReview.reviewedByName || 'Admin'}</div>
                </div>
              )}
            </div>
          </div>
        </div>

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
          Internal review section is for admin use only and is not visible to clients. All evaluation decisions should be documented and supported by evidence.
        </div>
      </main>

      <Footer />
    </>
  )
}
