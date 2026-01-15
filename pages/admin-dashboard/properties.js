import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminDashboardData } from '../../hooks/useAdminDashboardData'
import { useFirebase } from '../../contexts/FirebaseContext'
import overviewStyles from '../../styles/adminOverview.module.css'
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
      <div className={overviewStyles.section}>
        <section className={overviewStyles.panel}>
          <header className={overviewStyles.panelHeader}>
            <div>
              <h2>Submission summary</h2>
              <span>{pendingProperties.length} pending approvals - {allProperties.length} total submissions</span>
            </div>
            <button
              type="button"
              onClick={() => router.push('/add-property')}
              style={{
                background: 'linear-gradient(135deg, #c9a227 0%, #d4b13d 100%)',
                color: '#0a0a0a',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Add Property
            </button>
          </header>
          <div className={overviewStyles.quickGrid}>
            <article className={overviewStyles.quickCard}>
              <h3>Pending</h3>
              <p>{pendingProperties.length} properties waiting for review</p>
            </article>
            <article className={overviewStyles.quickCard}>
              <h3>Approved / Active</h3>
              <p>{approvedCount} ready to list</p>
            </article>
            <article className={overviewStyles.quickCard}>
              <h3>Rejected / Archived</h3>
              <p>{archivedCount} filtered out</p>
            </article>
          </div>
        </section>

        <section className={overviewStyles.panel}>
          <header className={overviewStyles.panelHeader}>
            <div>
              <h2>Property catalogue</h2>
              <span>{allProperties.length ? `${allProperties.length} entries` : 'No records yet'}</span>
            </div>
          </header>

          {notice && (
            <div
              className={`${overviewStyles.actionNotice} ${
                notice.type === 'error'
                  ? overviewStyles.actionNoticeError
                  : overviewStyles.actionNoticeSuccess
              }`}
            >
              {notice.message}
            </div>
          )}

          {loading ? (
            <div className={overviewStyles.emptyState}>Loading properties...</div>
          ) : allProperties.length ? (
            <div className={overviewStyles.list}>
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
                  <div key={property.id} className={overviewStyles.listItem} style={{ alignItems: 'flex-start', gap: '1.25rem' }}>
                    <img
                      src={imageUrl}
                      alt={property.title || property.name || 'Property'}
                      style={{ width: '88px', height: '88px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                      onError={(event) => {
                        event.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=640&auto=format&fit=crop&q=80'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong>{property.title || property.name || 'Untitled property'}</strong>
                      <div className={overviewStyles.smallMeta}>
                        {property.location || property.address || 'Location unavailable'} - {propertyType}
                      </div>
                      <div className={overviewStyles.smallMeta}>
                        Listing ID: {property.id || property.propertyId || 'N/A'} - Submitted {formatDate(property.createdAt || property.submittedAt)}
                      </div>
                      <div className={overviewStyles.smallMeta}>
                        Owner: {ownerName} ({ownerPhone})
                      </div>
                      <div className={overviewStyles.smallMeta}>
                        Original Price: {priceLabel}
                      </div>
                      <div className={overviewStyles.smallMeta}>
                        <strong>Condition Score: {calculateConditionScore(property)}%</strong>
                        {calculateConditionScore(property) < 100 && (
                          <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>
                            (Adjusted Value: {formatCurrency(calculateAdjustedValue(property))})
                          </span>
                        )}
                      </div>
                      {property.maintenanceCosts && property.maintenanceCosts.length > 0 && (
                        <div className={overviewStyles.smallMeta}>
                          <strong>Maintenance Issues:</strong>
                          {property.maintenanceCosts.map((cost, index) => (
                            <div key={index} style={{ marginLeft: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
                              • {cost.description} - Impact: {cost.impact}% - Cost: {formatCurrency(cost.amount)}
                            </div>
                          ))}
                        </div>
                      )}
                      {property.description && (
                        <div className={overviewStyles.smallMeta} style={{ marginTop: '0.5rem' }}>
                          {property.description}
                        </div>
                      )}

                      {isEditing && editDraft.mode && (
                        <div style={{ marginTop: '0.85rem', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#fff' }}>
                          <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#0f172a' }}>{modeLabel}</strong>
                          {editDraft.mode === 'bidding' && (
                            <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem', color: '#475467' }}>
                                Start date
                                <input
                                  type='date'
                                  value={editDraft.startDate || ''}
                                  onChange={(event) => handleEditChange('startDate', event.target.value)}
                                  className={overviewStyles.inlineInput}
                                />
                              </label>
                              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem', color: '#475467' }}>
                                Start time
                                <input
                                  type='time'
                                  value={editDraft.startTime || ''}
                                  onChange={(event) => handleEditChange('startTime', event.target.value)}
                                  className={overviewStyles.inlineInput}
                                />
                              </label>
                              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem', color: '#475467' }}>
                                End date
                                <input
                                  type='date'
                                  value={editDraft.endDate || ''}
                                  onChange={(event) => handleEditChange('endDate', event.target.value)}
                                  className={overviewStyles.inlineInput}
                                />
                              </label>
                              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem', color: '#475467' }}>
                                End time
                                <input
                                  type='time'
                                  value={editDraft.endTime || ''}
                                  onChange={(event) => handleEditChange('endTime', event.target.value)}
                                  className={overviewStyles.inlineInput}
                                />
                              </label>
                            </div>
                          )}

                          {editDraft.mode === 'evaluation' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <label style={{ fontSize: '0.85rem', color: '#475467' }}>
                                Evaluation value (PKR)
                                <input
                                  type='text'
                                  value={editDraft.evaluationValue || ''}
                                  onChange={(event) => handleEditChange('evaluationValue', event.target.value)}
                                  className={overviewStyles.inlineInput}
                                  placeholder='PKR 25,000,000'
                                />
                              </label>
                              <label style={{ fontSize: '0.85rem', color: '#475467' }}>
                                Property Condition Score (%)
                                <input
                                  type='number'
                                  min='0'
                                  max='100'
                                  value={editDraft.conditionScore || 100}
                                  onChange={(event) => handleEditChange('conditionScore', event.target.value)}
                                  className={overviewStyles.inlineInput}
                                  placeholder='100'
                                />
                              </label>
                              <label style={{ fontSize: '0.85rem', color: '#475467' }}>
                                Admin comment
                                <textarea
                                  rows={3}
                                  value={editDraft.adminComment || ''}
                                  onChange={(event) => handleEditChange('adminComment', event.target.value)}
                                  className={overviewStyles.inlineTextarea}
                                  placeholder='Notes that should appear on the evaluation PDF'
                                />
                              </label>
                            </div>
                          )}

                          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                            <button
                              type='button'
                              className={`${overviewStyles.actionButton} ${overviewStyles.actionButtonPrimary}`}
                              onClick={() => saveEdit(property)}
                              disabled={savingEdit}
                            >
                              {savingEdit ? 'Saving...' : 'Save changes'}
                            </button>
                            <button
                              type='button'
                              className={`${overviewStyles.actionButton} ${overviewStyles.actionButtonSecondary}`}
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={overviewStyles.listItemMeta}>
                      <div className={overviewStyles.listActions}>
                        <button
                          type='button'
                          className={overviewStyles.actionButton}
                          onClick={() => openEdit(property)}
                          disabled={editingId && editingId !== property.id}
                        >
                          Edit
                        </button>
                        <button
                          type='button'
                          className={`${overviewStyles.actionButton} ${overviewStyles.actionButtonSecondary}`}
                          onClick={() => router.push(`/property-maintenance?propertyId=${property.id}`)}
                          style={{ background: '#ff5e01', color: 'white' }}
                        >
                          Manage Repairs
                        </button>
                        {statusValue !== 'approved' && (
                          <button
                            type='button'
                            className={`${overviewStyles.actionButton} ${overviewStyles.actionButtonPrimary}`}
                            onClick={() => handleApprove(property)}
                            disabled={approvingId === property.id || deletingId === property.id}
                          >
                            {approvingId === property.id ? 'Approving...' : 'Approve'}
                          </button>
                        )}
                        <button
                          type='button'
                          className={`${overviewStyles.actionButton} ${overviewStyles.actionButtonDanger}`}
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
            <div className={overviewStyles.emptyState}>No property submissions available.</div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}

