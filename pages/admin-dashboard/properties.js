import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminDashboardData } from '../../hooks/useAdminDashboardData'
import { useFirebase } from '../../contexts/FirebaseContext'
import { ensurePropertyImage } from '../../utils/propertyStorage'

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

const resolveStatus = (property) => {
  const value = (property.status || property.statusCode || '').toLowerCase()
  if (!value || value === 'pending') return 'pending'
  if (value === 'approved' || value === 'active') return 'approved'
  if (value === 'rejected') return 'rejected'
  return property.status || 'pending'
}

const formatPriceLabel = (property) => {
  const value =
    property.price
    || property.propertyValue
    || property.evaluationValue
    || property.listingPrice
    || property.valuationAmount
  if (value == null || value === '') {
    return 'Price evaluation pending'
  }
  const numeric = Number(value)
  if (Number.isFinite(numeric)) {
    return formatCurrency(numeric)
  }
  return value
}

const formatType = (property) =>
  property.listingType || property.type || property.category || (property.bedrooms ? 'Residential' : 'Property')

const resolveImage = (property) => {
  const candidate =
    property.coverImage
    || property.primaryImage
    || property.image
    || (Array.isArray(property.images) && property.images.length ? property.images[0]?.url || property.images[0] : null)
    || (Array.isArray(property.media) && property.media.length ? property.media[0]?.url : null)

  return ensurePropertyImage({ ...property, image: candidate })
}

const defaultBiddingFields = (property) => ({
  startDate: property.biddingStartDate || property.bidding?.startDate || '',
  startTime: property.biddingStartTime || property.bidding?.startTime || '',
  endDate: property.biddingEndDate || property.bidding?.endDate || '',
  endTime: property.biddingEndTime || property.bidding?.endTime || '',
})

const defaultEvaluationFields = (property) => ({
  evaluationValue: property.evaluationValue || property.propertyValue || '',
  adminComment: property.adminComment || '',
  conditionScore: property.conditionScore || 100,
  maintenanceCosts: property.maintenanceCosts || [],
})

const calculateConditionScore = (property) => {
  const baseScore = property.conditionScore || 100
  const maintenanceImpact = (property.maintenanceCosts || []).reduce((acc, cost) => acc + (cost.impact || 0), 0)
  return Math.max(0, Math.min(100, baseScore - maintenanceImpact))
}

const calculateAdjustedValue = (property) => {
  const baseValue = Number(property.evaluationValue || property.propertyValue || 0)
  const conditionScore = calculateConditionScore(property)
  return Math.round(baseValue * (conditionScore / 100))
}

export default function AdminPropertiesPage() {
  const router = useRouter()
  const {
    loading,
    allProperties,
    pendingProperties,
    refresh,
  } = useAdminDashboardData()

  const {
    updatePropertyStatus,
    deleteProperty: removeProperty,
    updateProperty,
  } = useFirebase()

  const [approvingId, setApprovingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [notice, setNotice] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState({})
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    if (!notice || typeof window === 'undefined') {
      return undefined
    }
    const timeout = window.setTimeout(() => setNotice(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const approvedCount = allProperties.filter((property) => ['approved', 'active'].includes((property.status || '').toLowerCase())).length
  const archivedCount = allProperties.filter((property) => ['rejected', 'archived'].includes((property.status || '').toLowerCase())).length

  const handleApprove = async (property) => {
    const propertyId = property.id
    if (!propertyId || typeof updatePropertyStatus !== 'function') {
      setNotice({ type: 'error', message: 'Unable to approve property.' })
      return
    }

    setApprovingId(propertyId)
    try {
      const payload = { status: 'approved', statusCode: 'approved' }
      if (typeof updateProperty === 'function') {
        await updateProperty(propertyId, payload)
      } else {
        await updatePropertyStatus(propertyId, payload)
      }
      setNotice({ type: 'success', message: `${property.title || 'Property'} was approved.` })
      if (typeof refresh === 'function') {
        await refresh()
      }
    } catch (error) {
      setNotice({ type: 'error', message: 'Failed to approve property.' })
    } finally {
      setApprovingId(null)
    }
  }

  const handleDelete = async (property) => {
    const propertyId = property.id
    if (!propertyId || typeof removeProperty !== 'function') {
      setNotice({ type: 'error', message: 'Unable to delete property.' })
      return
    }

    if (typeof window !== 'undefined' && !window.confirm(`Delete ${property.title || 'property'}? This cannot be undone.`)) {
      return
    }

    setDeletingId(propertyId)
    try {
      const result = await removeProperty(propertyId)
      if (!result?.success) {
        throw new Error(result?.error || 'Delete failed')
      }
      setNotice({ type: 'success', message: 'Property deleted.' })
      if (typeof refresh === 'function') {
        await refresh()
      }
    } catch (error) {
      setNotice({ type: 'error', message: 'Failed to delete property.' })
    } finally {
      setDeletingId(null)
    }
  }

  const openEdit = (property) => {
    if (!property?.id) {
      setNotice({ type: 'error', message: 'Property is missing an identifier.' })
      return
    }

    const type = formatType(property).toLowerCase()
    const isBidding = type.includes('bidding') || type.includes('auction')
    const isEvaluation = (property.source || '').toLowerCase().includes('evaluation') || property.statusCode === 'evaluated'

    const draft = {
      mode: isEvaluation ? 'evaluation' : isBidding ? 'bidding' : null,
      ...defaultBiddingFields(property),
      ...defaultEvaluationFields(property),
    }

    setEditingId(property.id)
    setEditDraft(draft)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditDraft({})
  }

  const handleEditChange = (field, value) => {
    setEditDraft((prev) => ({ ...prev, [field]: value }))
  }

  const saveEdit = async (property) => {
    if (!editingId || editingId !== property.id) return
    if (typeof updateProperty !== 'function') {
      setNotice({ type: 'error', message: 'Editing is not available in this environment.' })
      return
    }

    const payload = {}
    if (editDraft.mode === 'bidding') {
      payload.biddingStartDate = editDraft.startDate || null
      payload.biddingStartTime = editDraft.startTime || null
      payload.biddingEndDate = editDraft.endDate || null
      payload.biddingEndTime = editDraft.endTime || null
      payload.bidding = {
        ...(property.bidding || {}),
        startDate: editDraft.startDate || null,
        startTime: editDraft.startTime || null,
        endDate: editDraft.endDate || null,
        endTime: editDraft.endTime || null,
      }
    }

    if (editDraft.mode === 'evaluation') {
      payload.evaluationValue = editDraft.evaluationValue || null
      payload.adminComment = editDraft.adminComment || ''
      payload.propertyValue = editDraft.evaluationValue || property.propertyValue || null
    }

    if (!Object.keys(payload).length) {
      setNotice({ type: 'error', message: 'Nothing to update for this property.' })
      return
    }

    setSavingEdit(true)
    try {
      const result = await updateProperty(property.id, payload)
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to update property')
      }
      setNotice({ type: 'success', message: 'Property details updated.' })
      setEditingId(null)
      setEditDraft({})
      if (typeof refresh === 'function') {
        await refresh()
      }
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Failed to save changes.' })
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <AdminLayout
      title='Properties'
      description='Full visibility into submitted and approved properties.'
      metaTitle='Admin Properties'
      onRefresh={refresh}
    >
      <div className="grid gap-7">
        {/* Summary Section */}
        <section className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20 flex flex-col gap-5 max-h-[450px] overflow-hidden">
          <header className="flex justify-between items-center gap-4">
            <div>
              <h2 className="m-0 text-lg font-semibold text-gray-900">Submission summary</h2>
              <span className="text-gray-400 text-sm">{pendingProperties.length} pending approvals - {allProperties.length} total submissions</span>
            </div>
            <button
              type="button"
              onClick={() => router.push('/add-property')}
              className="bg-gradient-to-br from-[#c9a227] to-[#d4b13d] text-[#0a0a0a] border-none px-5 py-2.5 rounded-lg font-semibold cursor-pointer flex items-center gap-2 hover:shadow-lg transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Add Property
            </button>
          </header>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 max-h-[300px] overflow-y-auto pr-1">
            <article className="rounded-3xl p-5 bg-white border border-slate-200/20 grid gap-3 shadow-[0_12px_24px_rgba(148,163,184,0.08)] transition-all hover:border-slate-300/30 hover:shadow-[0_16px_30px_rgba(148,163,184,0.12)] hover:-translate-y-0.5">
              <h3 className="m-0 text-base text-gray-800">Pending</h3>
              <p className="m-0 text-slate-500 text-sm">{pendingProperties.length} properties waiting for review</p>
            </article>
            <article className="rounded-3xl p-5 bg-white border border-slate-200/20 grid gap-3 shadow-[0_12px_24px_rgba(148,163,184,0.08)] transition-all hover:border-slate-300/30 hover:shadow-[0_16px_30px_rgba(148,163,184,0.12)] hover:-translate-y-0.5">
              <h3 className="m-0 text-base text-gray-800">Approved / Active</h3>
              <p className="m-0 text-slate-500 text-sm">{approvedCount} ready to list</p>
            </article>
            <article className="rounded-3xl p-5 bg-white border border-slate-200/20 grid gap-3 shadow-[0_12px_24px_rgba(148,163,184,0.08)] transition-all hover:border-slate-300/30 hover:shadow-[0_16px_30px_rgba(148,163,184,0.12)] hover:-translate-y-0.5">
              <h3 className="m-0 text-base text-gray-800">Rejected / Archived</h3>
              <p className="m-0 text-slate-500 text-sm">{archivedCount} filtered out</p>
            </article>
          </div>
        </section>

        {/* Property Catalogue Section */}
        <section className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20 flex flex-col gap-5 max-h-[450px] overflow-hidden">
          <header className="flex justify-between items-center gap-4">
            <div>
              <h2 className="m-0 text-lg font-semibold text-gray-900">Property catalogue</h2>
              <span className="text-gray-400 text-sm">{allProperties.length ? `${allProperties.length} entries` : 'No records yet'}</span>
            </div>
          </header>

          {notice && (
            <div
              className={`mt-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                notice.type === 'error'
                  ? 'bg-red-100/50 text-red-700 border border-red-200/50'
                  : 'bg-green-100/50 text-emerald-700 border border-green-200/50'
              }`}
            >
              {notice.message}
            </div>
          )}

          {loading ? (
            <div className="border border-dashed border-slate-300/40 rounded-3xl py-10 px-6 text-center text-slate-400 text-[0.95rem]">Loading properties...</div>
          ) : allProperties.length ? (
            <div className="grid gap-4 overflow-y-auto flex-1 pr-1">
              {allProperties.map((property) => {
                const statusValue = resolveStatus(property)
                const priceLabel = formatPriceLabel(property)
                const propertyType = formatType(property)
                const ownerName = property.ownerName || property.contactName || 'Unknown owner'
                const ownerPhone = property.ownerPhone || property.contact || property.phone || 'Not provided'
                const imageUrl = resolveImage(property)
                const isEditing = editingId === property.id
                const modeLabel = editDraft.mode === 'evaluation'
                  ? 'Evaluation controls'
                  : editDraft.mode === 'bidding'
                    ? 'Bidding schedule'
                    : null

                return (
                  <div key={property.id} className="grid grid-cols-[auto_1fr_minmax(150px,220px)] gap-5 items-start py-3.5 border-b border-slate-200/55 last:border-b-0">
                    <img
                      src={imageUrl}
                      alt={property.title || property.name || 'Property'}
                      className="w-[88px] h-[88px] object-cover rounded-xl border border-gray-200"
                      onError={(event) => {
                        event.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=640&auto=format&fit=crop&q=80'
                      }}
                    />
                    <div className="flex-1">
                      <strong className="font-semibold text-gray-800">{property.title || property.name || 'Untitled property'}</strong>
                      <div className="text-gray-400 text-sm">
                        {property.location || property.address || 'Location unavailable'} - {propertyType}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Listing ID: {property.id || property.propertyId || 'N/A'} - Submitted {formatDate(property.createdAt || property.submittedAt)}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Owner: {ownerName} ({ownerPhone})
                      </div>
                      <div className="text-gray-400 text-sm">
                        Original Price: {priceLabel}
                      </div>
                      <div className="text-gray-400 text-sm">
                        <strong>Condition Score: {calculateConditionScore(property)}%</strong>
                        {calculateConditionScore(property) < 100 && (
                          <span className="text-red-500 ml-2">
                            (Adjusted Value: {formatCurrency(calculateAdjustedValue(property))})
                          </span>
                        )}
                      </div>
                      {property.maintenanceCosts && property.maintenanceCosts.length > 0 && (
                        <div className="text-gray-400 text-sm">
                          <strong>Maintenance Issues:</strong>
                          {property.maintenanceCosts.map((cost, index) => (
                            <div key={index} className="ml-4 text-xs text-gray-500">
                              • {cost.description} - Impact: {cost.impact}% - Cost: {formatCurrency(cost.amount)}
                            </div>
                          ))}
                        </div>
                      )}
                      {property.description && (
                        <div className="text-gray-400 text-sm mt-2">
                          {property.description}
                        </div>
                      )}

                      {isEditing && editDraft.mode && (
                        <div className="mt-3 p-3 rounded-xl border border-gray-200 bg-white">
                          <strong className="block mb-2 text-slate-900">{modeLabel}</strong>
                          {editDraft.mode === 'bidding' && (
                            <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                              <label className="flex flex-col text-sm text-slate-600">
                                Start date
                                <input
                                  type='date'
                                  value={editDraft.startDate || ''}
                                  onChange={(event) => handleEditChange('startDate', event.target.value)}
                                  className="border border-slate-300/60 rounded-xl px-3 py-2 text-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 focus:outline-none"
                                />
                              </label>
                              <label className="flex flex-col text-sm text-slate-600">
                                Start time
                                <input
                                  type='time'
                                  value={editDraft.startTime || ''}
                                  onChange={(event) => handleEditChange('startTime', event.target.value)}
                                  className="border border-slate-300/60 rounded-xl px-3 py-2 text-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 focus:outline-none"
                                />
                              </label>
                              <label className="flex flex-col text-sm text-slate-600">
                                End date
                                <input
                                  type='date'
                                  value={editDraft.endDate || ''}
                                  onChange={(event) => handleEditChange('endDate', event.target.value)}
                                  className="border border-slate-300/60 rounded-xl px-3 py-2 text-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 focus:outline-none"
                                />
                              </label>
                              <label className="flex flex-col text-sm text-slate-600">
                                End time
                                <input
                                  type='time'
                                  value={editDraft.endTime || ''}
                                  onChange={(event) => handleEditChange('endTime', event.target.value)}
                                  className="border border-slate-300/60 rounded-xl px-3 py-2 text-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 focus:outline-none"
                                />
                              </label>
                            </div>
                          )}

                          {editDraft.mode === 'evaluation' && (
                            <div className="flex flex-col gap-3">
                              <label className="text-sm text-slate-600">
                                Evaluation value (PKR)
                                <input
                                  type='text'
                                  value={editDraft.evaluationValue || ''}
                                  onChange={(event) => handleEditChange('evaluationValue', event.target.value)}
                                  className="border border-slate-300/60 rounded-xl px-3 py-2 text-sm w-full transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 focus:outline-none"
                                  placeholder='PKR 25,000,000'
                                />
                              </label>
                              <label className="text-sm text-slate-600">
                                Property Condition Score (%)
                                <input
                                  type='number'
                                  min='0'
                                  max='100'
                                  value={editDraft.conditionScore || 100}
                                  onChange={(event) => handleEditChange('conditionScore', event.target.value)}
                                  className="border border-slate-300/60 rounded-xl px-3 py-2 text-sm w-full transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 focus:outline-none"
                                  placeholder='100'
                                />
                              </label>
                              <label className="text-sm text-slate-600">
                                Admin comment
                                <textarea
                                  rows={3}
                                  value={editDraft.adminComment || ''}
                                  onChange={(event) => handleEditChange('adminComment', event.target.value)}
                                  className="border border-slate-300/60 rounded-xl px-3 py-2 text-sm w-full resize-y min-h-[70px] transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 focus:outline-none"
                                  placeholder='Notes that should appear on the evaluation PDF'
                                />
                              </label>
                            </div>
                          )}

                          <div className="mt-3 flex gap-2">
                            <button
                              type='button'
                              className="border-none rounded-full px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all inline-flex items-center gap-1 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                              onClick={() => saveEdit(property)}
                              disabled={savingEdit}
                            >
                              {savingEdit ? 'Saving...' : 'Save changes'}
                            </button>
                            <button
                              type='button'
                              className="border border-slate-300/35 rounded-full px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all inline-flex items-center gap-1 bg-slate-200/50 text-gray-800 hover:bg-slate-200"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end justify-center gap-1.5 min-w-[170px]">
                      <div className="inline-flex gap-1.5 flex-wrap justify-end w-full">
                        <button
                          type='button'
                          className="border-none rounded-full px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all inline-flex items-center gap-1 bg-slate-200/50 text-gray-800 border border-slate-300/35 hover:bg-slate-200 disabled:opacity-55 disabled:cursor-not-allowed"
                          onClick={() => openEdit(property)}
                          disabled={editingId && editingId !== property.id}
                        >
                          Edit
                        </button>
                        <button
                          type='button'
                          className="border-none rounded-full px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all inline-flex items-center gap-1 bg-[#ff5e01] text-white hover:bg-[#e55500]"
                          onClick={() => router.push(`/property-maintenance?propertyId=${property.id}`)}
                        >
                          Manage Repairs
                        </button>
                        {statusValue !== 'approved' && (
                          <button
                            type='button'
                            className="border-none rounded-full px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all inline-flex items-center gap-1 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                            onClick={() => handleApprove(property)}
                            disabled={approvingId === property.id || deletingId === property.id}
                          >
                            {approvingId === property.id ? 'Approving...' : 'Approve'}
                          </button>
                        )}
                        <button
                          type='button'
                          className="border border-red-300/40 rounded-full px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all inline-flex items-center gap-1 bg-red-500/10 text-red-600 hover:bg-red-500/20 disabled:opacity-55 disabled:cursor-not-allowed"
                          onClick={() => handleDelete(property)}
                          disabled={deletingId === property.id || approvingId === property.id}
                        >
                          {deletingId === property.id ? 'Removing...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="border border-dashed border-slate-300/40 rounded-3xl py-10 px-6 text-center text-slate-400 text-[0.95rem]">No property submissions available.</div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
