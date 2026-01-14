import { useMemo, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminDashboardData } from '../../hooks/useAdminDashboardData'
import { useFirebase } from '../../contexts/FirebaseContext'
import overviewStyles from '../../styles/adminOverview.module.css'
import { generateEvaluationPdf } from '../../utils/pdf'

const formatCurrency = (value) =>
  `PKR ${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Number(value || 0))}`

const formatDate = (input) => {
  if (!input) return '--'
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const resolveEvaluationId = (evaluation) => {
  if (!evaluation) return ''
  const identifier =
    evaluation.id
    || evaluation.evaluationId
    || evaluation.referenceId
    || evaluation.propertyId
    || evaluation.slug
    || evaluation._id
  return identifier ? String(identifier) : ''
}

const getStatusBadgeClass = (status) => {
  if (!status) return overviewStyles.badgePending
  const statusLower = status.toLowerCase()

  switch (statusLower) {
    case 'completed':
    case 'approved':
    case 'verified':
      return overviewStyles.badgeSuccess
    case 'pending':
    case 'review':
    case 'waiting':
      return overviewStyles.badgePending
    case 'active':
    case 'live':
    case 'processing':
      return overviewStyles.badgeActive
    case 'rejected':
    case 'failed':
    case 'cancelled':
      return overviewStyles.badgeWarning
    default:
      return overviewStyles.badge
  }
}

export default function AdminEvaluationsPage() {
  const {
    loading,
    pendingEvaluations,
    allEvaluations,
    refresh,
  } = useAdminDashboardData()

  const {
    addProperty: createProperty,
    updateEvaluationStatus,
    deleteEvaluation,
  } = useFirebase()

  const [valueDrafts, setValueDrafts] = useState({})
  const [commentDrafts, setCommentDrafts] = useState({})
  const [actionNotice, setActionNotice] = useState(null)
  const [processingEvaluationId, setProcessingEvaluationId] = useState(null)
  const [deletingEvaluationId, setDeletingEvaluationId] = useState(null)

  const approvedEvaluations = useMemo(
    () => (allEvaluations || []).filter((evaluation) => (evaluation.status || '').toLowerCase() === 'approved'),
    [allEvaluations],
  )

  const evaluationReviewItems = useMemo(() => {
    const seen = new Set()
    const combined = []

    const isMaintenanceSource = (evaluation) => {
      const source = (evaluation?.source || '').toLowerCase()
      const issueType = (evaluation?.issueType || evaluation?.type || '').toLowerCase()
      return source.includes('maintenance') || ['maintenance', 'repair'].includes(issueType)
    }

    ;(pendingEvaluations || []).forEach((evaluation) => {
      if (isMaintenanceSource(evaluation)) {
        return
      }
      const id = resolveEvaluationId(evaluation)
      if (id) {
        seen.add(id)
      }
      combined.push(evaluation)
    })

    ;(approvedEvaluations || []).forEach((evaluation) => {
      if (isMaintenanceSource(evaluation)) {
        return
      }
      const id = resolveEvaluationId(evaluation)
      if (id && seen.has(id)) {
        return
      }
      seen.add(id)
      combined.push(evaluation)
    })

    return combined.sort((a, b) => new Date(b.updatedAt || b.submittedAt || 0) - new Date(a.updatedAt || a.submittedAt || 0))
  }, [pendingEvaluations, approvedEvaluations])

  const pdfReadyCount = useMemo(
    () => (allEvaluations || []).filter((evaluation) => evaluation.pdfReport || evaluation.pdfDataUri).length,
    [allEvaluations],
  )

  useEffect(() => {
    if (!actionNotice || typeof window === 'undefined') return undefined
    const timeout = window.setTimeout(() => setActionNotice(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [actionNotice])

  const promoteEvaluationToProperty = useCallback(async (evaluation, evaluationValue) => {
    if (!evaluation) return null

    const propertyId = evaluation.propertyId || `evaluation_${evaluation.id}`

    const normalizedImages = Array.isArray(evaluation.propertyMedia)
      ? evaluation.propertyMedia
          .map((asset) => asset?.url || asset?.dataUrl)
          .filter(Boolean)
      : null

    const propertyPayload = {
      id: propertyId,
      title: evaluation.property || evaluation.propertyName || evaluation.propertyAddress || 'Evaluated Property',
      propertyName: evaluation.property || evaluation.propertyName,
      propertyAddress: evaluation.propertyAddress || evaluation.address,
      city: evaluation.city,
      location: evaluation.propertyAddress || evaluation.address || evaluation.city || 'Location pending',
      status: 'Approved',
      statusCode: 'evaluated',
      evaluationValue: evaluationValue || evaluation.propertyValue || evaluation.valuationAmount || 'Pending',
      propertyValue: evaluationValue || evaluation.propertyValue,
      createdAt: evaluation.submittedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: evaluation.propertyType || 'general',
      source: 'evaluation',
      areaSize: evaluation.areaSize,
      floors: evaluation.floors,
      description: evaluation.description || evaluation.issue || 'Evaluation approved property',
      ownerName: evaluation.fullName || evaluation.contactName || '',
      ownerEmail: evaluation.email || evaluation.userEmail || '',
      ownerPhone: evaluation.contact || evaluation.userPhone || evaluation.contactPhone || '',
      images: normalizedImages?.length
        ? normalizedImages.map((url) => ({ url }))
        : evaluation.propertyImage
          ? [{ url: evaluation.propertyImage }]
          : evaluation.images,
    }

    try {
      const result = await createProperty(propertyPayload)
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to save property to Firestore')
      }
      return result.property || { ...propertyPayload, id: result.id }
    } catch (error) {
      console.warn('Failed to promote evaluation to property:', error)
      throw error
    }
  }, [createProperty])

  const handleApproveEvaluation = useCallback(async (evaluation) => {
    const evaluationId = resolveEvaluationId(evaluation)
    if (!evaluationId) {
      setActionNotice({ type: 'error', message: 'Unable to approve evaluation: missing identifier.' })
      return
    }

    if (typeof updateEvaluationStatus !== 'function') {
      setActionNotice({ type: 'error', message: 'Evaluation approval is not available in the current environment.' })
      return
    }

    const evaluationValue = (valueDrafts[evaluationId] ?? evaluation?.evaluationValue ?? evaluation?.propertyValue ?? '')
      .toString()
      .trim()

    if (!evaluationValue) {
      setActionNotice({ type: 'error', message: 'Add an evaluated value before approving.' })
      return
    }

    const adminComment = (commentDrafts[evaluationId] ?? evaluation?.adminComment ?? '')
      .toString()
      .trim()

    setProcessingEvaluationId(evaluationId)
    try {
      const promotedProperty = await promoteEvaluationToProperty(evaluation, evaluationValue)
      let pdfPayload = null

      try {
        pdfPayload = generateEvaluationPdf(
          { ...evaluation, evaluationValue, propertyId: promotedProperty?.id || evaluation.propertyId },
          adminComment,
        )
      } catch (pdfError) {
        console.warn('Failed to generate evaluation PDF:', pdfError)
      }

      const updatePayload = {
        status: 'approved',
        evaluationValue,
        approvedAt: new Date().toISOString(),
        propertyId: promotedProperty?.id || evaluation.propertyId,
        adminComment,
      }

      if (pdfPayload?.pdfDataUri) {
        updatePayload.pdfReport = pdfPayload.pdfDataUri
        updatePayload.reportGeneratedAt = pdfPayload.createdAt
      }

      const result = await updateEvaluationStatus(evaluationId, updatePayload)
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to update evaluation record.')
      }

      setActionNotice({ type: 'success', message: 'Evaluation approved and PDF generated successfully!' })
      setValueDrafts((prev) => {
        const next = { ...prev }
        delete next[evaluationId]
        return next
      })
      setCommentDrafts((prev) => {
        const next = { ...prev }
        delete next[evaluationId]
        return next
      })

      if (typeof refresh === 'function') {
        await refresh()
      }
    } catch (error) {
      setActionNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to approve evaluation.',
      })
    } finally {
      setProcessingEvaluationId(null)
    }
  }, [commentDrafts, promoteEvaluationToProperty, refresh, updateEvaluationStatus, valueDrafts])

  const handleDeleteEvaluation = useCallback(async (evaluation) => {
    const evaluationId = resolveEvaluationId(evaluation)
    if (!evaluationId) {
      setActionNotice({ type: 'error', message: 'Unable to delete evaluation: missing identifier.' })
      return
    }

    if (typeof deleteEvaluation !== 'function') {
      setActionNotice({ type: 'error', message: 'Evaluation deletion is not available in the current environment.' })
      return
    }

    setDeletingEvaluationId(evaluationId)
    try {
      const result = await deleteEvaluation(evaluationId)
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to delete evaluation request.')
      }
      setActionNotice({ type: 'success', message: 'Evaluation removed.' })
      setValueDrafts((prev) => {
        const next = { ...prev }
        delete next[evaluationId]
        return next
      })
      setCommentDrafts((prev) => {
        const next = { ...prev }
        delete next[evaluationId]
        return next
      })
      if (typeof refresh === 'function') {
        await refresh()
      }
    } catch (error) {
      setActionNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete evaluation request.',
      })
    } finally {
      setDeletingEvaluationId(null)
    }
  }, [deleteEvaluation, refresh])

  const pendingCount = pendingEvaluations.length
  const totalCount = allEvaluations.length

  return (
    <AdminLayout
      title='Evaluations'
      description='Full dossier of every property valuation request, including owner documents and generated PDF reports.'
      metaTitle='Admin Evaluations'
      onRefresh={refresh}
    >
      <div className={overviewStyles.section}>
        <section className={overviewStyles.panel}>
          <header className={overviewStyles.panelHeader}>
            <div>
              <h2>Evaluation summary</h2>
              <span>{pendingCount} pending - {totalCount} total requests</span>
            </div>
          </header>
          <div className={overviewStyles.quickGrid}>
            <article className={overviewStyles.quickCard}>
              <h3>Pending queue</h3>
              <p>{pendingCount} submissions waiting for review</p>
            </article>
            <article className={overviewStyles.quickCard}>
              <h3>Approved dossiers</h3>
              <p>{approvedEvaluations.length} marked ready for listing</p>
            </article>
            <article className={overviewStyles.quickCard}>
              <h3>PDF reports</h3>
              <p>{pdfReadyCount} generated exports ready to share</p>
            </article>
          </div>
        </section>

        <section className={overviewStyles.panel}>
          <header className={overviewStyles.panelHeader}>
            <div>
              <h2>Evaluation requests</h2>
              <span>{evaluationReviewItems.length ? `${evaluationReviewItems.length} dossiers (showing latest)` : 'No submissions to show'}</span>
            </div>
          </header>

          {actionNotice && (
            <div
              className={`${overviewStyles.actionNotice} ${
                actionNotice.type === 'error'
                  ? overviewStyles.actionNoticeError
                  : overviewStyles.actionNoticeSuccess
              }`}
            >
              {actionNotice.message}
            </div>
          )}

          {loading ? (
            <div className={overviewStyles.emptyState}>Loading evaluation dossiers...</div>
          ) : evaluationReviewItems.length ? (
            <div className={overviewStyles.list}>
              {evaluationReviewItems.map((evaluation, index) => {
                const evaluationId = resolveEvaluationId(evaluation) || `evaluation-${index}`
                const statusValue = (evaluation.status || 'pending')
                const isPending = ['pending', 'under evaluation', 'under_evaluation', 'submitted', ''].includes(statusValue.toLowerCase())
                const imageAssets = Array.isArray(evaluation.propertyMedia) && evaluation.propertyMedia.length
                  ? evaluation.propertyMedia
                  : evaluation.images || (evaluation.propertyImage ? [{ url: evaluation.propertyImage }] : [])
                const documentAssets = Array.isArray(evaluation.supportingDocuments)
                  ? evaluation.supportingDocuments
                  : Array.isArray(evaluation.documents)
                    ? evaluation.documents
                    : []
                const currentValue = valueDrafts[evaluationId] ?? evaluation.evaluationValue ?? evaluation.propertyValue ?? ''
                const currentComment = commentDrafts[evaluationId] ?? evaluation.adminComment ?? ''

                return (
                  <div key={evaluationId} className={overviewStyles.listItem}>
                    <span className={`${overviewStyles.badge} ${getStatusBadgeClass(statusValue)}`}>
                      {(evaluation.propertyType || evaluation.type || 'evaluation').toUpperCase()}
                    </span>
                    <div>
                      <strong>{evaluation.property || evaluation.propertyName || evaluation.propertyAddress || 'Submitted property'}</strong>
                      <div className={overviewStyles.smallMeta}>
                        {evaluation.address || evaluation.propertyAddress || evaluation.city || 'Address unavailable'}
                      </div>
                      <div className={overviewStyles.smallMeta}>
                        Submitted: {formatDate(evaluation.submittedAt || evaluation.createdAt)} - Owner: {evaluation.fullName || evaluation.contactName || 'Not provided'} ({evaluation.contact || evaluation.userPhone || 'no phone'})
                      </div>

                      {imageAssets?.length ? (
                        <div className={overviewStyles.mediaStrip}>
                          {imageAssets.slice(0, 4).map((media, mediaIndex) => {
                            const previewUrl = media?.dataUrl || media?.url
                            if (!previewUrl) {
                              return (
                                <div key={`${evaluationId}-media-${mediaIndex}`} className={overviewStyles.mediaThumbPlaceholder}>
                                  {(media?.name || 'image').slice(0, 2).toUpperCase()}
                                </div>
                              )
                            }
                            return (
                              <img
                                key={`${evaluationId}-media-${mediaIndex}`}
                                src={previewUrl}
                                alt={media?.name || `media-${mediaIndex + 1}`}
                                className={overviewStyles.mediaThumb}
                              />
                            )
                          })}
                        </div>
                      ) : null}

                      {documentAssets?.length ? (
                        <div className={overviewStyles.documentRow}>
                          {documentAssets.slice(0, 4).map((docItem, docIndex) => (
                            <a
                              key={`${evaluationId}-doc-${docIndex}`}
                              href={docItem?.dataUrl || docItem?.url || '#'}
                              download={docItem?.name || `document-${docIndex + 1}`}
                              target='_blank'
                              rel='noreferrer'
                              className={overviewStyles.docLink}
                            >
                              {docItem?.name || `Document ${docIndex + 1}`}
                            </a>
                          ))}
                        </div>
                      ) : null}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.75rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#475467' }} htmlFor={`value-${evaluationId}`}>
                          Evaluated value (PKR)
                        </label>
                        <input
                          id={`value-${evaluationId}`}
                          type='text'
                          className={overviewStyles.inlineInput}
                          placeholder='PKR 25,000,000'
                          value={currentValue}
                          onChange={(event) =>
                            setValueDrafts((prev) => ({ ...prev, [evaluationId]: event.target.value }))
                          }
                        />
                        <label style={{ fontSize: '0.85rem', color: '#475467' }} htmlFor={`comment-${evaluationId}`}>
                          Admin notes / PDF annotation
                        </label>
                        <textarea
                          id={`comment-${evaluationId}`}
                          rows={3}
                          className={overviewStyles.inlineTextarea}
                          placeholder='Add guidance for the PDF report'
                          value={currentComment}
                          onChange={(event) =>
                            setCommentDrafts((prev) => ({ ...prev, [evaluationId]: event.target.value }))
                          }
                        />
                      </div>

                      <div className={overviewStyles.inlineMetaRow}>
                        <Link href={`/evaluation-detail?id=${evaluationId}`} className={overviewStyles.inlineLink}>
                          Review full submission
                        </Link>
                        <span className={overviewStyles.smallMeta}>
                          Requested value: {evaluation.propertyValue ? formatCurrency(evaluation.propertyValue) : '--'}
                        </span>
                        {evaluation.pdfReport && (
                          <a
                            href={evaluation.pdfReport}
                            target='_blank'
                            rel='noreferrer'
                            className={overviewStyles.inlineLink}
                          >
                            Download existing PDF
                          </a>
                        )}
                      </div>
                    </div>
                    <div className={overviewStyles.listItemMeta}>
                      <span className={overviewStyles.smallMeta}>{formatDate(evaluation.submittedAt || evaluation.createdAt)}</span>
                      <div className={overviewStyles.listActions}>
                        {isPending && (
                          <button
                            type='button'
                            className={`${overviewStyles.actionButton} ${overviewStyles.actionButtonPrimary}`}
                            onClick={() => handleApproveEvaluation(evaluation)}
                            disabled={processingEvaluationId === evaluationId || deletingEvaluationId === evaluationId}
                          >
                            {processingEvaluationId === evaluationId ? 'Approving...' : 'Approve & export'}
                          </button>
                        )}
                        <button
                          type='button'
                          className={`${overviewStyles.actionButton} ${overviewStyles.actionButtonDanger}`}
                          onClick={() => handleDeleteEvaluation(evaluation)}
                          disabled={deletingEvaluationId === evaluationId || processingEvaluationId === evaluationId}
                        >
                          {deletingEvaluationId === evaluationId ? 'Removing...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={overviewStyles.emptyState}>No evaluation submissions available.</div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
