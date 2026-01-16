import { useMemo, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminDashboardData } from '../../hooks/useAdminDashboardData'
import { useFirebase } from '../../contexts/FirebaseContext'
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
  if (!status) return 'bg-indigo-500/15 text-indigo-700 border-indigo-500/20'
  const statusLower = status.toLowerCase()

  switch (statusLower) {
    case 'completed':
    case 'approved':
    case 'verified':
      return 'bg-green-500/15 text-emerald-700 border-green-500/20'
    case 'pending':
    case 'review':
    case 'waiting':
      return 'bg-indigo-500/15 text-indigo-700 border-indigo-500/20'
    case 'active':
    case 'live':
    case 'processing':
      return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20'
    case 'rejected':
    case 'failed':
    case 'cancelled':
      return 'bg-orange-500/15 text-orange-700 border-orange-500/20'
    default:
      return 'bg-gradient-to-br from-[rgba(201,162,39,0.15)] to-[rgba(201,162,39,0.1)] text-[#92710c] border-[rgba(201,162,39,0.2)]'
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
      <div className="grid gap-7">
        {/* Summary Section */}
        <section className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20 flex flex-col gap-5 max-h-[450px] overflow-hidden">
          <header className="flex justify-between items-center gap-4">
            <div>
              <h2 className="m-0 text-lg font-semibold text-gray-900">Evaluation summary</h2>
              <span className="text-gray-400 text-sm">{pendingCount} pending - {totalCount} total requests</span>
            </div>
          </header>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 max-h-[300px] overflow-y-auto pr-1">
            <article className="rounded-3xl p-5 bg-white border border-slate-200/20 grid gap-3 shadow-[0_12px_24px_rgba(148,163,184,0.08)] transition-all hover:border-slate-300/30 hover:shadow-[0_16px_30px_rgba(148,163,184,0.12)] hover:-translate-y-0.5">
              <h3 className="m-0 text-base text-gray-800">Pending queue</h3>
              <p className="m-0 text-slate-500 text-sm">{pendingCount} submissions waiting for review</p>
            </article>
            <article className="rounded-3xl p-5 bg-white border border-slate-200/20 grid gap-3 shadow-[0_12px_24px_rgba(148,163,184,0.08)] transition-all hover:border-slate-300/30 hover:shadow-[0_16px_30px_rgba(148,163,184,0.12)] hover:-translate-y-0.5">
              <h3 className="m-0 text-base text-gray-800">Approved dossiers</h3>
              <p className="m-0 text-slate-500 text-sm">{approvedEvaluations.length} marked ready for listing</p>
            </article>
            <article className="rounded-3xl p-5 bg-white border border-slate-200/20 grid gap-3 shadow-[0_12px_24px_rgba(148,163,184,0.08)] transition-all hover:border-slate-300/30 hover:shadow-[0_16px_30px_rgba(148,163,184,0.12)] hover:-translate-y-0.5">
              <h3 className="m-0 text-base text-gray-800">PDF reports</h3>
              <p className="m-0 text-slate-500 text-sm">{pdfReadyCount} generated exports ready to share</p>
            </article>
          </div>
        </section>

        {/* Evaluation Requests Section */}
        <section className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20 flex flex-col gap-5 max-h-[450px] overflow-hidden">
          <header className="flex justify-between items-center gap-4">
            <div>
              <h2 className="m-0 text-lg font-semibold text-gray-900">Evaluation requests</h2>
              <span className="text-gray-400 text-sm">{evaluationReviewItems.length ? `${evaluationReviewItems.length} dossiers (showing latest)` : 'No submissions to show'}</span>
            </div>
          </header>

          {actionNotice && (
            <div
              className={`mt-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                actionNotice.type === 'error'
                  ? 'bg-red-100/50 text-red-700 border border-red-200/50'
                  : 'bg-green-100/50 text-emerald-700 border border-green-200/50'
              }`}
            >
              {actionNotice.message}
            </div>
          )}

          {loading ? (
            <div className="border border-dashed border-slate-300/40 rounded-3xl py-10 px-6 text-center text-slate-400 text-[0.95rem]">Loading evaluation dossiers...</div>
          ) : evaluationReviewItems.length ? (
            <div className="grid gap-4 overflow-y-auto flex-1 pr-1">
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
                  <div key={evaluationId} className="grid grid-cols-[auto_1fr_minmax(150px,220px)] gap-x-4 gap-y-2 items-start py-3.5 border-b border-slate-200/55 last:border-b-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide border ${getStatusBadgeClass(statusValue)}`}>
                      {(evaluation.propertyType || evaluation.type || 'evaluation').toUpperCase()}
                    </span>
                    <div>
                      <strong className="font-semibold text-gray-800">{evaluation.property || evaluation.propertyName || evaluation.propertyAddress || 'Submitted property'}</strong>
                      <div className="text-gray-400 text-sm">
                        {evaluation.address || evaluation.propertyAddress || evaluation.city || 'Address unavailable'}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Submitted: {formatDate(evaluation.submittedAt || evaluation.createdAt)} - Owner: {evaluation.fullName || evaluation.contactName || 'Not provided'} ({evaluation.contact || evaluation.userPhone || 'no phone'})
                      </div>

                      {imageAssets?.length ? (
                        <div className="flex gap-2 my-2">
                          {imageAssets.slice(0, 4).map((media, mediaIndex) => {
                            const previewUrl = media?.dataUrl || media?.url
                            if (!previewUrl) {
                              return (
                                <div key={`${evaluationId}-media-${mediaIndex}`} className="w-14 h-14 rounded-xl border border-slate-300/35 flex items-center justify-center text-xs font-bold text-slate-600 bg-slate-200/70">
                                  {(media?.name || 'image').slice(0, 2).toUpperCase()}
                                </div>
                              )
                            }
                            return (
                              <img
                                key={`${evaluationId}-media-${mediaIndex}`}
                                src={previewUrl}
                                alt={media?.name || `media-${mediaIndex + 1}`}
                                className="w-14 h-14 rounded-xl object-cover border border-slate-300/35"
                              />
                            )
                          })}
                        </div>
                      ) : null}

                      {documentAssets?.length ? (
                        <div className="flex gap-2 flex-wrap mb-2">
                          {documentAssets.slice(0, 4).map((docItem, docIndex) => (
                            <a
                              key={`${evaluationId}-doc-${docIndex}`}
                              href={docItem?.dataUrl || docItem?.url || '#'}
                              download={docItem?.name || `document-${docIndex + 1}`}
                              target='_blank'
                              rel='noreferrer'
                              className="text-xs px-3 py-1 rounded-full bg-slate-800/10 text-slate-900 no-underline hover:bg-slate-800/20"
                            >
                              {docItem?.name || `Document ${docIndex + 1}`}
                            </a>
                          ))}
                        </div>
                      ) : null}

                      <div className="flex flex-col gap-1 mt-3">
                        <label className="text-sm text-slate-600" htmlFor={`value-${evaluationId}`}>
                          Evaluated value (PKR)
                        </label>
                        <input
                          id={`value-${evaluationId}`}
                          type='text'
                          className="border border-slate-300/60 rounded-xl px-3 py-2 text-sm w-full transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 focus:outline-none"
                          placeholder='PKR 25,000,000'
                          value={currentValue}
                          onChange={(event) =>
                            setValueDrafts((prev) => ({ ...prev, [evaluationId]: event.target.value }))
                          }
                        />
                        <label className="text-sm text-slate-600" htmlFor={`comment-${evaluationId}`}>
                          Admin notes / PDF annotation
                        </label>
                        <textarea
                          id={`comment-${evaluationId}`}
                          rows={3}
                          className="border border-slate-300/60 rounded-xl px-3 py-2 text-sm w-full resize-y min-h-[70px] transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 focus:outline-none"
                          placeholder='Add guidance for the PDF report'
                          value={currentComment}
                          onChange={(event) =>
                            setCommentDrafts((prev) => ({ ...prev, [evaluationId]: event.target.value }))
                          }
                        />
                      </div>

                      <div className="flex gap-4 flex-wrap items-center my-2">
                        <Link href={`/evaluation-detail?id=${evaluationId}`} className="text-sm text-blue-600 no-underline font-semibold hover:underline">
                          Review full submission
                        </Link>
                        <span className="text-gray-400 text-sm">
                          Requested value: {evaluation.propertyValue ? formatCurrency(evaluation.propertyValue) : '--'}
                        </span>
                        {evaluation.pdfReport && (
                          <a
                            href={evaluation.pdfReport}
                            target='_blank'
                            rel='noreferrer'
                            className="text-sm text-blue-600 no-underline font-semibold hover:underline"
                          >
                            Download existing PDF
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-center gap-1.5 min-w-[170px]">
                      <span className="text-gray-400 text-sm">{formatDate(evaluation.submittedAt || evaluation.createdAt)}</span>
                      <div className="inline-flex gap-1.5 flex-wrap justify-end w-full">
                        {isPending && (
                          <button
                            type='button'
                            className="border-none rounded-full px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all inline-flex items-center gap-1 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                            onClick={() => handleApproveEvaluation(evaluation)}
                            disabled={processingEvaluationId === evaluationId || deletingEvaluationId === evaluationId}
                          >
                            {processingEvaluationId === evaluationId ? 'Approving...' : 'Approve & export'}
                          </button>
                        )}
                        <button
                          type='button'
                          className="border border-red-300/40 rounded-full px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all inline-flex items-center gap-1 bg-red-500/10 text-red-600 hover:bg-red-500/20 disabled:opacity-55 disabled:cursor-not-allowed"
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
            <div className="border border-dashed border-slate-300/40 rounded-3xl py-10 px-6 text-center text-slate-400 text-[0.95rem]">No evaluation submissions available.</div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
