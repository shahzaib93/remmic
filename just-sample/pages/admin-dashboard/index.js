import { useMemo, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminDashboardData } from '../../hooks/useAdminDashboardData'
import layoutStyles from '../../styles/adminLayout.module.css'
import overviewStyles from '../../styles/adminOverview.module.css'
import { useFirebase } from '../../contexts/FirebaseContext'
import { generateEvaluationPdf } from '../../utils/pdf'

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value || 0))

const formatCurrency = (value) =>
  `PKR ${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Number(value || 0))}`

const formatDate = (input) => {
  if (!input) return '—'
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const resolvePropertyId = (property) => {
  if (!property) return ''
  const identifier =
    property.id
    || property.propertyId
    || property.slug
    || property._id
    || property.uid
    || property.referenceId
    || property.listingId
    || property.documentId
  return identifier ? String(identifier) : ''
}

const resolveInvestmentId = (investment) => {
  if (!investment) return ''
  const identifier =
    investment.id
    || investment.investmentId
    || investment.referenceId
    || investment.transactionId
    || investment.orderId
    || investment.slug
    || investment._id
  return identifier ? String(identifier) : ''
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

const startOfMonth = (offset = 0) => {
  const base = new Date()
  base.setDate(1)
  base.setHours(0, 0, 0, 0)
  base.setMonth(base.getMonth() + offset)
  return base
}

const isWithinMonth = (dateString, offset = 0) => {
  if (!dateString) return false
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return false
  const start = startOfMonth(offset)
  const end = startOfMonth(offset + 1)
  return date >= start && date < end
}

const generatePeriodBuckets = (period) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (period === 'weekly') {
    const days = []
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(today)
      day.setDate(today.getDate() - i)
      const start = new Date(day)
      const end = new Date(day)
      end.setDate(end.getDate() + 1)
      days.push({
        label: day.toLocaleDateString('en-IN', { weekday: 'short' }),
        start,
        end,
      })
    }
    return days
  }

  if (period === 'monthly') {
    const buckets = []
    const start = startOfMonth(0)
    const end = startOfMonth(1)
    let cursor = new Date(start)

    while (cursor < end) {
      const rangeStart = new Date(cursor)
      const rangeEnd = new Date(cursor)
      rangeEnd.setDate(rangeEnd.getDate() + 7)
      buckets.push({
        label: rangeStart.toLocaleDateString('en-IN', { day: 'numeric' }),
        start: rangeStart,
        end: rangeEnd < end ? rangeEnd : end,
      })
      cursor = rangeEnd
    }
    return buckets
  }

  // yearly
  const buckets = []
  for (let i = 11; i >= 0; i -= 1) {
    const start = startOfMonth(-i)
    const end = startOfMonth(-i + 1)
    buckets.push({
      label: start.toLocaleDateString('en-IN', { month: 'short' }),
      start,
      end,
    })
  }
  return buckets
}

export default function AdminDashboardOverview() {
  const router = useRouter()
  const {
    loading,
    stats,
    contactMessages,
    pendingProperties,
    pendingInvestments,
    pendingEvaluations,
    pendingBids,
    pendingRentals,
    allProperties,
    allInvestments,
    allEvaluations,
    refresh,
    error,
  } = useAdminDashboardData()

  const {
    updatePropertyStatus,
    deleteProperty: removeProperty,
    updateProperty,
    updateInvestmentStatus,
    deleteInvestment: removeInvestment,
    markMessageAsRead,
    deleteContactMessage,
    replyToContactMessage,
    updateEvaluationStatus,
    deleteEvaluation,
    addProperty: createProperty,
  } = useFirebase()
  const [approvingPropertyId, setApprovingPropertyId] = useState(null)
  const [deletingPropertyId, setDeletingPropertyId] = useState(null)
  const [propertyActionNotice, setPropertyActionNotice] = useState(null)
  const [approvingInvestmentId, setApprovingInvestmentId] = useState(null)
  const [deletingInvestmentId, setDeletingInvestmentId] = useState(null)
  const [investmentActionNotice, setInvestmentActionNotice] = useState(null)
  const [processingMessageId, setProcessingMessageId] = useState(null)
  const [deletingMessageId, setDeletingMessageId] = useState(null)
  const [messageActionNotice, setMessageActionNotice] = useState(null)
  const [replyingMessageId, setReplyingMessageId] = useState(null)
  const [replyBody, setReplyBody] = useState('')
  const [sendingReplyId, setSendingReplyId] = useState(null)
  const [commentDrafts, setCommentDrafts] = useState({})
  const [valueDrafts, setValueDrafts] = useState({})
  const [evaluationActionNotice, setEvaluationActionNotice] = useState(null)
  const [processingEvaluationId, setProcessingEvaluationId] = useState(null)
  const [deletingEvaluationId, setDeletingEvaluationId] = useState(null)

  const totalProperties = allProperties.length || 0
  const occupancyPercent = totalProperties
    ? Math.round((stats.activeProperties / totalProperties) * 100)
    : null

  const currentMonthSales = allInvestments
    .filter((investment) => isWithinMonth(investment.investmentDate || investment.createdAt, 0))
    .reduce((sum, investment) => sum + Number(investment.amount || investment.currentValue || 0), 0)

  const previousMonthSales = allInvestments
    .filter((investment) => isWithinMonth(investment.investmentDate || investment.createdAt, -1))
    .reduce((sum, investment) => sum + Number(investment.amount || investment.currentValue || 0), 0)

  const currentMonthCount = allInvestments.filter((investment) => isWithinMonth(investment.investmentDate || investment.createdAt, 0)).length
  const previousMonthCount = allInvestments.filter((investment) => isWithinMonth(investment.investmentDate || investment.createdAt, -1)).length

  const currentMonthProperties = allProperties.filter((property) => isWithinMonth(property.createdAt || property.submittedAt, 0)).length
  const previousMonthProperties = allProperties.filter((property) => isWithinMonth(property.createdAt || property.submittedAt, -1)).length

  const percentDelta = (current, previous) => {
    if (!previous) return current ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const [salesPeriod, setSalesPeriod] = useState('weekly')

  const salesBuckets = useMemo(() => generatePeriodBuckets(salesPeriod), [salesPeriod])

  const summaryCards = [
    {
      id: 'total-sales',
      label: 'Total Sales',
      value: formatCurrency(currentMonthSales || stats.totalInvestmentValue),
      trend: percentDelta(currentMonthSales, previousMonthSales),
      trendLabel: `Last month ${formatCurrency(previousMonthSales)}`,
      positive: percentDelta(currentMonthSales, previousMonthSales) >= 0,
    },
    {
      id: 'number-sales',
      label: 'Number of Sales',
      value: formatNumber(currentMonthCount || stats.totalInvestments),
      trend: percentDelta(currentMonthCount, previousMonthCount),
      trendLabel: `Last month total ${formatNumber(previousMonthCount)}`,
      positive: percentDelta(currentMonthCount, previousMonthCount) >= 0,
    },
    {
      id: 'total-property',
      label: 'Total Property',
      value: formatNumber(totalProperties),
      trend: percentDelta(currentMonthProperties, previousMonthProperties),
      trendLabel: `Last month total ${formatNumber(previousMonthProperties || 0)}`,
      positive: percentDelta(currentMonthProperties, previousMonthProperties) >= 0,
    },
  ]

  const getNumericValue = useCallback((value) => {
    if (value == null) return 0
    const numeric = Number(value)
    return Number.isFinite(numeric) ? numeric : 0
  }, [])

  const salesByPeriod = useMemo(() => salesBuckets.map((bucket) => {
    const total = allInvestments
      .filter((investment) => {
        const date = new Date(investment.investmentDate || investment.createdAt)
        if (Number.isNaN(date.getTime())) return false
        return date >= bucket.start && date < bucket.end
      })
      .reduce((sum, investment) => sum + getNumericValue(investment.amount || investment.currentValue || investment.committedAmount), 0)

    return {
      label: bucket.label,
      total,
    }
  }), [allInvestments, salesBuckets, getNumericValue])

  const maxSales = salesByPeriod.reduce((max, entry) => Math.max(max, entry.total), 0)

  const lastTransactions = useMemo(() => {
    return [...allInvestments]
      .map((investment) => {
        const timestamp = new Date(investment.investmentDate || investment.createdAt || Date.now())
        return {
          id: investment.id,
          property: investment.propertyTitle || investment.propertyName || 'Unknown property',
          date: formatDate(timestamp.toISOString()),
          amount: formatCurrency(investment.amount || investment.currentValue || 0),
          timestamp,
        }
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 4)
  }, [allInvestments])

  const maintenanceRequests = useMemo(() => {
    const maintenanceQueue = pendingEvaluations.filter((evaluation) => {
      const source = (evaluation.source || '').toLowerCase()
      const issueType = (evaluation.issueType || evaluation.type || '').toLowerCase()
      return source.includes('maintenance') || ['maintenance', 'repair'].includes(issueType)
    })

    return maintenanceQueue.slice(0, 4).map((evaluation, index) => ({
      id: evaluation.id || `maintenance-${index}`,
      title: evaluation.title || evaluation.property || 'Maintenance request',
      issue: evaluation.issue || evaluation.issueType || evaluation.type || 'General',
      requester: evaluation.userName || evaluation.userEmail || evaluation.contactName || 'User',
      createdAt: formatDate(evaluation.createdAt || evaluation.submittedAt),
    }))
  }, [pendingEvaluations])

  const approvedProperties = useMemo(() => (
    allProperties
      .filter((property) => ['approved', 'active'].includes((property.status || '').toLowerCase()))
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
  ), [allProperties])

  const confirmedInvestments = useMemo(() => (
    allInvestments
      .filter((investment) => ['approved', 'confirmed', 'active', 'completed'].includes((investment.status || '').toLowerCase()))
      .sort((a, b) => new Date(b.updatedAt || b.investmentDate || b.createdAt || 0) - new Date(a.updatedAt || a.investmentDate || a.createdAt || 0))
  ), [allInvestments])

  const approvedEvaluations = useMemo(() => (
    (allEvaluations || [])
      .filter((evaluation) => (evaluation.status || '').toLowerCase() === 'approved')
      .sort((a, b) => new Date(b.updatedAt || b.approvedAt || b.submittedAt || 0) - new Date(a.updatedAt || a.approvedAt || a.submittedAt || 0))
  ), [allEvaluations])

  const costBreakdown = useMemo(() => {
    const segments = [
      { label: 'Maintenance', value: (pendingEvaluations.length || 0) * 75000, color: '#6366F1' },
      { label: 'Repair', value: (pendingProperties.length || 0) * 60000, color: '#F97316' },
      { label: 'Insurance', value: (pendingInvestments.length || 0) * 55000, color: '#EC4899' },
      { label: 'Utilities', value: (stats.totalMessages || 0) * 20000, color: '#22D3EE' },
    ]
    const total = segments.reduce((sum, segment) => sum + segment.value, 0)
    return { segments, total }
  }, [pendingEvaluations, pendingProperties, pendingInvestments, stats.totalMessages])

  const donutGradient = useMemo(() => {
    const { segments, total } = costBreakdown
    if (!total) {
      return 'conic-gradient(#e2e8f0 0 360deg)'
    }
    let cumulative = 0
    const stops = segments
      .filter((segment) => segment.value > 0)
      .map((segment) => {
        const start = (cumulative / total) * 360
        cumulative += segment.value
        const end = (cumulative / total) * 360
        return `${segment.color} ${start}deg ${end}deg`
      })
    return `conic-gradient(${stops.join(', ')})`
  }, [costBreakdown])

  const propertyReviewItems = useMemo(() => {
    const seen = new Set()
    const combined = []

    pendingProperties.forEach((property) => {
      const id = resolvePropertyId(property)
      if (id) {
        seen.add(id)
      }
      combined.push(property)
    })

    approvedProperties.forEach((property) => {
      const id = resolvePropertyId(property)
      if (id && seen.has(id)) {
        return
      }
      seen.add(id)
      combined.push(property)
    })

    return combined.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
  }, [pendingProperties, approvedProperties])

  const investmentReviewItems = useMemo(() => {
    const seen = new Set()
    const combined = []

    // Create a more comprehensive deduplication key
    const createDeduplicationKey = (investment) => {
      const id = resolveInvestmentId(investment)
      const property = investment.propertyTitle || investment.propertyName || 'unknown'
      const investor = investment.userEmail || investment.userName || 'unknown'
      const amount = investment.amount || investment.currentValue || 0
      const date = investment.investmentDate || investment.createdAt || ''
      
      // If we have a proper ID, use it, otherwise create a composite key
      if (id && id !== '' && !id.startsWith('fallback-')) {
        return id
      }
      
      return `${property}-${investor}-${amount}-${date}`.toLowerCase().replace(/\s+/g, '-')
    }

    // Add pending investments first
    pendingInvestments.forEach((investment) => {
      const key = createDeduplicationKey(investment)
      if (!seen.has(key)) {
        seen.add(key)
        combined.push(investment)
      }
    })

    // Add confirmed investments that aren't already included
    confirmedInvestments.forEach((investment) => {
      const key = createDeduplicationKey(investment)
      if (!seen.has(key)) {
        seen.add(key)
        combined.push(investment)
      }
    })

    // Sort by date and status priority (pending first, then by date)
    return combined.sort((a, b) => {
      const aStatus = (a.status || '').toLowerCase()
      const bStatus = (b.status || '').toLowerCase()
      
      // Pending investments first
      if (aStatus === 'pending' && bStatus !== 'pending') return -1
      if (bStatus === 'pending' && aStatus !== 'pending') return 1
      
      // Then sort by date
      const aDate = new Date(a.updatedAt || a.investmentDate || a.createdAt || 0)
      const bDate = new Date(b.updatedAt || b.investmentDate || b.createdAt || 0)
      return bDate - aDate
    })
  }, [pendingInvestments, confirmedInvestments])

  const evaluationReviewItems = useMemo(() => {
    const seen = new Set()
    const combined = []

    const isMaintenanceSource = (evaluation) => {
      const source = (evaluation?.source || '').toLowerCase()
      const issueType = (evaluation?.issueType || evaluation?.type || '').toLowerCase()
      return source.includes('maintenance') || ['maintenance', 'repair'].includes(issueType)
    }

    pendingEvaluations.forEach((evaluation) => {
      if (isMaintenanceSource(evaluation)) {
        return
      }
      const id = resolveEvaluationId(evaluation)
      if (id) {
        seen.add(id)
      }
      combined.push(evaluation)
    })

    approvedEvaluations.forEach((evaluation) => {
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

  useEffect(() => {
    if (!propertyActionNotice || typeof window === 'undefined') return undefined
    const timeout = window.setTimeout(() => {
      setPropertyActionNotice(null)
    }, 4000)
    return () => window.clearTimeout(timeout)
  }, [propertyActionNotice])

  useEffect(() => {
    if (!investmentActionNotice || typeof window === 'undefined') return undefined
    const timeout = window.setTimeout(() => {
      setInvestmentActionNotice(null)
    }, 4000)
    return () => window.clearTimeout(timeout)
  }, [investmentActionNotice])

  useEffect(() => {
    if (!messageActionNotice || typeof window === 'undefined') return undefined
    const timeout = window.setTimeout(() => {
      setMessageActionNotice(null)
    }, 4000)
    return () => window.clearTimeout(timeout)
  }, [messageActionNotice])

  useEffect(() => {
    if (!evaluationActionNotice || typeof window === 'undefined') return undefined
    const timeout = window.setTimeout(() => {
      setEvaluationActionNotice(null)
    }, 4000)
    return () => window.clearTimeout(timeout)
  }, [evaluationActionNotice])

  const handleApproveProperty = useCallback(async (property) => {
    const propertyId = resolvePropertyId(property)
    if (!propertyId) {
      setPropertyActionNotice({ type: 'error', message: 'Unable to approve property: missing identifier.' })
      return
    }

    if (typeof updatePropertyStatus !== 'function' && typeof updateProperty !== 'function') {
      setPropertyActionNotice({ type: 'error', message: 'Property approval is not available in the current environment.' })
      return
    }

    setApprovingPropertyId(propertyId)
    try {
      let result = typeof updatePropertyStatus === 'function'
        ? await updatePropertyStatus(propertyId, 'approved')
        : { success: false }

      if (!result?.success && typeof updateProperty === 'function') {
        result = await updateProperty(propertyId, { status: 'approved' })
      }

      if (!result?.success) {
        throw new Error(result?.error || 'Failed to approve property')
      }

      setPropertyActionNotice({ type: 'success', message: 'Property approved and published successfully.' })
      if (typeof refresh === 'function') {
        await refresh()
      }
    } catch (error) {
      setPropertyActionNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to approve property.',
      })
    } finally {
      setApprovingPropertyId(null)
    }
  }, [refresh, updateProperty, updatePropertyStatus])

  const handleDeleteProperty = useCallback(async (property) => {
    const propertyId = resolvePropertyId(property)
    if (!propertyId) {
      setPropertyActionNotice({ type: 'error', message: 'Unable to delete property: missing identifier.' })
      return
    }

    if (typeof removeProperty !== 'function') {
      setPropertyActionNotice({ type: 'error', message: 'Property deletion is not available in the current environment.' })
      return
    }

    if (typeof window !== 'undefined') {
      const confirmDelete = window.confirm('Delete this property from REMMIC? This action cannot be undone.')
      if (!confirmDelete) {
        return
      }
    }

    setDeletingPropertyId(propertyId)
    try {
      const result = await removeProperty(propertyId)
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to delete property')
      }

      setPropertyActionNotice({ type: 'success', message: 'Property deleted successfully.' })
      if (typeof refresh === 'function') {
        await refresh()
      }
    } catch (error) {
      setPropertyActionNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete property.',
      })
    } finally {
      setDeletingPropertyId(null)
    }
  }, [refresh, removeProperty])

  const handleApproveInvestment = useCallback(async (investment) => {
    const investmentId = resolveInvestmentId(investment)
    if (!investmentId) {
      setInvestmentActionNotice({ type: 'error', message: 'Unable to approve investment: missing identifier.' })
      return
    }

    if (typeof updateInvestmentStatus !== 'function') {
      setInvestmentActionNotice({ type: 'error', message: 'Investment approval is not available in the current environment.' })
      return
    }

    setApprovingInvestmentId(investmentId)
    try {
      const result = await updateInvestmentStatus(investmentId, 'confirmed', {
        paymentReceived: true,
        paymentConfirmedAt: new Date().toISOString(),
        statusNote: 'Payment confirmed by admin',
      })

      if (!result?.success) {
        throw new Error(result?.error || 'Failed to approve investment')
      }

      setInvestmentActionNotice({ type: 'success', message: 'Investment payment confirmed and investor notified.' })
      if (typeof refresh === 'function') {
        await refresh()
      }
    } catch (error) {
      setInvestmentActionNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to approve investment.',
      })
    } finally {
      setApprovingInvestmentId(null)
    }
  }, [refresh, updateInvestmentStatus])

  const handleDeleteInvestment = useCallback(async (investment) => {
    const investmentId = resolveInvestmentId(investment)
    if (!investmentId) {
      setInvestmentActionNotice({ type: 'error', message: 'Unable to delete investment: missing identifier.' })
      return
    }

    if (typeof removeInvestment !== 'function') {
      setInvestmentActionNotice({ type: 'error', message: 'Investment deletion is not available in the current environment.' })
      return
    }

    if (typeof window !== 'undefined') {
      const confirmDelete = window.confirm('Reject and delete this investment record? This action cannot be undone.')
      if (!confirmDelete) {
        return
      }
    }

    setDeletingInvestmentId(investmentId)
    try {
      const result = await removeInvestment(investmentId)
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to delete investment')
      }

      setInvestmentActionNotice({ type: 'success', message: 'Investment request removed successfully.' })
      if (typeof refresh === 'function') {
        await refresh()
      }
    } catch (error) {
      setInvestmentActionNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete investment.',
      })
    } finally {
      setDeletingInvestmentId(null)
    }
  }, [refresh, removeInvestment])

  const handleMarkMessageRead = useCallback(async (message) => {
    if (!message?.id) {
      setMessageActionNotice({ type: 'error', message: 'Unable to update message: missing identifier.' })
      return
    }

    if (typeof markMessageAsRead !== 'function') {
      setMessageActionNotice({ type: 'error', message: 'Message actions are not available in the current environment.' })
      return
    }

    setProcessingMessageId(message.id)
    try {
      const result = await markMessageAsRead(message.id)
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to mark message as read')
      }

      setMessageActionNotice({ type: 'success', message: 'Message marked as read.' })
      if (typeof refresh === 'function') {
        await refresh()
      }
    } catch (error) {
      setMessageActionNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update message.',
      })
    } finally {
      setProcessingMessageId(null)
    }
  }, [markMessageAsRead, refresh])

  const handleDeleteMessage = useCallback(async (message) => {
    if (!message?.id) {
      setMessageActionNotice({ type: 'error', message: 'Unable to delete message: missing identifier.' })
      return
    }

    if (typeof deleteContactMessage !== 'function') {
      setMessageActionNotice({ type: 'error', message: 'Message deletion is not available in the current environment.' })
      return
    }

    if (typeof window !== 'undefined') {
      const confirmDelete = window.confirm('Delete this contact message? This action cannot be undone.')
      if (!confirmDelete) {
        return
      }
    }

    setDeletingMessageId(message.id)
    try {
      const result = await deleteContactMessage(message.id)
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to delete message')
      }

      setMessageActionNotice({ type: 'success', message: 'Message deleted.' })
      if (replyingMessageId === message.id) {
        setReplyingMessageId(null)
        setReplyBody('')
      }
      if (typeof refresh === 'function') {
        await refresh()
      }
    } catch (error) {
      setMessageActionNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete message.',
      })
    } finally {
      setDeletingMessageId(null)
    }
  }, [deleteContactMessage, refresh])

  const handleOpenReply = useCallback((message) => {
    if (!message?.id) return
    setReplyingMessageId(message.id)
    setReplyBody('')
    setMessageActionNotice(null)
  }, [])

  const handleSendReply = useCallback(async (message) => {
    if (!message?.id) {
      setMessageActionNotice({ type: 'error', message: 'Unable to send reply: missing identifier.' })
      return
    }

    if (!replyBody.trim()) {
      setMessageActionNotice({ type: 'error', message: 'Reply message cannot be empty.' })
      return
    }

    if (typeof replyToContactMessage !== 'function') {
      setMessageActionNotice({ type: 'error', message: 'Reply action is not available in the current environment.' })
      return
    }

    setSendingReplyId(message.id)
    try {
      const result = await replyToContactMessage(message.id, replyBody.trim(), {
        name: 'Admin',
        email: 'admin@remmic.com',
      })
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to send reply')
      }

      setMessageActionNotice({ type: 'success', message: 'Reply recorded and marked as sent.' })
      setReplyingMessageId(null)
      setReplyBody('')
      if (typeof refresh === 'function') {
        await refresh()
      }
    } catch (error) {
      setMessageActionNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to send reply.',
      })
    } finally {
      setSendingReplyId(null)
    }
  }, [refresh, replyBody, replyToContactMessage])

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
      setEvaluationActionNotice({ type: 'error', message: 'Unable to approve evaluation: missing identifier.' })
      return
    }

    if (typeof updateEvaluationStatus !== 'function') {
      setEvaluationActionNotice({ type: 'error', message: 'Evaluation approval is not available in the current environment.' })
      return
    }

    const evaluationValue = (valueDrafts[evaluationId] ?? evaluation?.evaluationValue ?? evaluation?.propertyValue ?? '')
      .toString()
      .trim()

    if (!evaluationValue) {
      setEvaluationActionNotice({ type: 'error', message: 'Add an evaluated value before approving.' })
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

      // Add PDF data to the update payload if generated successfully
      if (pdfPayload?.pdfDataUri) {
        updatePayload.pdfReport = pdfPayload.pdfDataUri
        updatePayload.reportGeneratedAt = pdfPayload.createdAt
      }

      const result = await updateEvaluationStatus(evaluationId, updatePayload)
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to approve evaluation')
      }

      // Notify user that evaluation is approved and PDF is ready
      setEvaluationActionNotice({ type: 'success', message: 'Evaluation approved and PDF generated successfully!' })
      setCommentDrafts((prev) => ({ ...prev, [evaluationId]: '' }))
      setValueDrafts((prev) => ({ ...prev, [evaluationId]: '' }))

      // Dispatch event to notify other parts of the app about the approval
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('evaluationApproved', { detail: { evaluationId, propertyId: promotedProperty?.id } }))
      }

      if (typeof refresh === 'function') {
        await refresh()
      }
    } catch (error) {
      setEvaluationActionNotice({
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
      setEvaluationActionNotice({ type: 'error', message: 'Unable to delete evaluation: missing identifier.' })
      return
    }

    if (typeof deleteEvaluation !== 'function') {
      setEvaluationActionNotice({ type: 'error', message: 'Evaluation deletion is not available in the current environment.' })
      return
    }

    if (typeof window !== 'undefined') {
      const confirmDelete = window.confirm('Delete this evaluation request? This action cannot be undone.')
      if (!confirmDelete) {
        return
      }
    }

    setDeletingEvaluationId(evaluationId)
    try {
      const result = await deleteEvaluation(evaluationId)
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to delete evaluation')
      }

      setEvaluationActionNotice({ type: 'success', message: 'Evaluation request removed.' })
      if (typeof refresh === 'function') {
        await refresh()
      }
    } catch (error) {
      setEvaluationActionNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete evaluation.',
      })
    } finally {
      setDeletingEvaluationId(null)
    }
  }, [deleteEvaluation, refresh])

  const reviewQueues = useMemo(() => [
    {
      type: 'properties',
      title: 'Property Approvals',
      total: propertyReviewItems.length,
      pendingCount: pendingProperties.length,
      items: propertyReviewItems,
      empty: 'No property submissions waiting right now.',
      getPrimary: (entry) => entry.title || entry.name || 'Untitled property',
      getSecondary: (entry) => entry.location || entry.address || 'No address supplied',
      getStatus: (entry) => `Status · ${(entry.status || 'pending').toUpperCase()}`,
      badge: (entry) => entry.listingType || entry.type || 'Property',
      getId: resolvePropertyId,
      enableActions: true,
      subtitle:
        pendingProperties.length
          ? `${pendingProperties.length} pending / ${propertyReviewItems.length} submissions`
          : propertyReviewItems.length
            ? `${propertyReviewItems.length} submissions`
            : 'All caught up',
    },
    {
      type: 'investments',
      title: 'Investment Reviews',
      total: investmentReviewItems.length,
      pendingCount: pendingInvestments.length,
      items: investmentReviewItems,
      empty: 'No investments awaiting confirmation.',
      getPrimary: (entry) => {
        const propertyName = entry.propertyTitle || entry.propertyName || entry.investmentName || 'Property Investment'
        const area = entry.area || entry.size || ''
        
        // Clean up redundant property type prefixes
        let displayName = propertyName
        if (displayName.startsWith('investment - ') || displayName.startsWith('secondary_market - ') || displayName.startsWith('Real Estate - ')) {
          displayName = displayName.split(' - ').slice(1).join(' - ')
        }
        
        if (area && !displayName.includes(area)) {
          displayName = `${displayName} - ${area}`
        }
        
        return displayName || 'Property Investment'
      },
      getSecondary: (entry) => {
        const investor = entry.userEmail || entry.userName || 'Unknown investor'
        const shares = entry.shares || entry.shareCount || 0
        const investmentType = entry.investmentType || entry.shareType || entry.type || ''
        
        // Show shares information prominently in secondary line
        if (shares > 0) {
          const typePrefix = investmentType ? `${investmentType} • ` : ''
          return `${typePrefix}${shares} shares • ${investor}`
        } else {
          const typePrefix = investmentType ? `${investmentType} • ` : ''
          return `${typePrefix}Direct Investment • ${investor}`
        }
      },
      getStatus: (entry) => {
        const amount = formatCurrency(entry.amount || entry.currentValue || 0)
        const status = (entry.status || 'pending').toUpperCase()
        const investmentDate = entry.investmentDate || entry.createdAt
        
        // Keep status line simple - just amount and status
        if (amount && parseInt(amount.replace(/[^0-9]/g, '')) > 0) {
          return `${amount} • ${status}`
        } else {
          return `No Payment • ${status}`
        }
      },
      badge: (entry) => {
        const shares = entry.shares || entry.shareCount || 0
        const investmentType = entry.investmentType || entry.shareType || ''
        
        // Show shares count as badge for clarity, with responsive text
        if (shares > 0) {
          if (shares === 1) {
            return '1 share'
          } else if (shares < 10) {
            return `${shares} shares`
          } else {
            return `${shares}×`
          }
        } else if (investmentType) {
          // Truncate long investment types
          if (investmentType.length > 8) {
            return investmentType.substring(0, 6) + '...'
          }
          return investmentType
        } else {
          return 'Direct'
        }
      },
      getId: resolveInvestmentId,
      enableActions: true,
      subtitle:
        pendingInvestments.length
          ? `${pendingInvestments.length} pending`
          : investmentReviewItems.length
            ? `${investmentReviewItems.length} total`
            : '',
    },
  ], [pendingProperties, propertyReviewItems, pendingInvestments, investmentReviewItems])

  const insightCards = [
    {
      title: 'Evaluation Requests',
      description: 'Outstanding valuation or appraisal tickets',
      count: pendingEvaluations.length,
      badgeClass: overviewStyles.badgeWarning,
    },
    {
      title: 'Rental Verifications',
      description: 'Rental listings that require admin review',
      count: pendingRentals.length,
      badgeClass: overviewStyles.badge,
    },
    {
      title: 'Bidding Activity',
      description: 'Bids submitted without a final decision',
      count: pendingBids.length,
      badgeClass: overviewStyles.badgeSuccess,
    },
  ]

  const topProperties = allProperties.slice(0, 4)
  const topInvestments = allInvestments.slice(0, 4)
  const latestMessages = contactMessages.slice(0, 3)

  return (
    <AdminLayout
      title="Admin Overview"
      description="Monitor submissions, investments, and platform health at a glance."
      metaTitle="Admin Dashboard"
      onRefresh={refresh}
    >
      <div className={overviewStyles.section}>
        {error ? (
          <div className={overviewStyles.emptyState}>
            <strong>We could not load fresh data.</strong>
            <div className={overviewStyles.smallMeta}>Try refreshing or check your connection.</div>
          </div>
        ) : null}

        <section className={overviewStyles.overviewHero}>
          <div className={overviewStyles.metricGrid}>
            {summaryCards.map((card) => (
              <article key={card.id} className={overviewStyles.metricCard}>
                <h3>{card.label}</h3>
                <div className={overviewStyles.metricValue}>{loading ? '…' : card.value}</div>
                <div className={overviewStyles.metricMeta}>
                  <span>{card.trendLabel}</span>
                  <span className={card.positive ? overviewStyles.metricTrendUp : overviewStyles.metricTrendDown}>
                    {card.positive ? '▲' : '▼'} {Math.abs(card.trend)}%
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={overviewStyles.chartRow}>
          <article className={overviewStyles.chartCard}>
            <div className={overviewStyles.chartHeader}>
              <span>Report Sales</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'yearly', label: 'Yearly' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSalesPeriod(option.id)}
                    style={{
                      border: 'none',
                      borderRadius: '999px',
                      padding: '0.15rem 0.75rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      background: salesPeriod === option.id ? '#f97316' : 'transparent',
                      color: salesPeriod === option.id ? '#fff' : '#94a3b8',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={overviewStyles.barChart}>
              {salesByPeriod.map((entry) => (
                <div key={entry.label} className={overviewStyles.chartBar}>
                  <div className={overviewStyles.barTrack}>
                    <div
                      className={overviewStyles.barFill}
                      style={{
                        height: maxSales > 0 ? `${Math.max((entry.total / maxSales) * 100, 6)}%` : '2px',
                        opacity: maxSales > 0 ? 1 : 0.4,
                      }}
                    />
                  </div>
                  <span className={overviewStyles.barLabel}>{entry.label}</span>
                </div>
              ))}
              {maxSales === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No sales recorded for the selected period yet.
                </div>
              )}
            </div>
          </article>

          <article className={overviewStyles.chartCard}>
            <div className={overviewStyles.chartHeader}>
              <span>Cost Breakdown</span>
              <span className={overviewStyles.chartSubtext}>See details</span>
            </div>
            <div className={overviewStyles.donutWrapper}>
              <div className={overviewStyles.donut} style={{ background: donutGradient }}>
                <div className={overviewStyles.donutCenter}>
                  <div>{formatCurrency(costBreakdown.total)}</div>
                  <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Total</small>
                </div>
              </div>
              <ul className={overviewStyles.legend}>
                {costBreakdown.segments.map((segment) => (
                  <li key={segment.label} className={overviewStyles.legendItem}>
                    <span
                      className={overviewStyles.legendDot}
                      style={{ background: segment.color }}
                    />
                    <span>{segment.label}</span>
                    <strong style={{ marginLeft: 'auto' }}>{formatCurrency(segment.value)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </section>

        <section className={overviewStyles.colTwo}>
          {reviewQueues.map((queue) => {
            const itemsAvailable = queue.items?.length || 0
            const itemsToRender = queue.enableActions
              ? queue.items.slice(0, 15)
              : queue.items.slice(0, 10)
            const isPropertyQueue = queue.type === 'properties'
            const notice = isPropertyQueue ? propertyActionNotice : investmentActionNotice
            const approvingId = isPropertyQueue ? approvingPropertyId : approvingInvestmentId
            const deletingId = isPropertyQueue ? deletingPropertyId : deletingInvestmentId
            const onApprove = isPropertyQueue ? handleApproveProperty : handleApproveInvestment
            const onDelete = isPropertyQueue ? handleDeleteProperty : handleDeleteInvestment

            return (
              <article key={queue.title} className={overviewStyles.compactPanel}>
                <header className={overviewStyles.compactHeader}>
                  <div>
                    <h2>{queue.title}</h2>
                    {itemsAvailable > 0 && <span>{itemsAvailable} pending</span>}
                  </div>
                </header>

                {queue.enableActions && notice && (
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
                  <div className={overviewStyles.emptyState}>Loading {queue.title.toLowerCase()}…</div>
                ) : itemsAvailable ? (
                  <div className={overviewStyles.list}>
                    {itemsToRender.map((item, index) => {
                      const itemId = queue.getId ? queue.getId(item) : item.id
                      const key = itemId || `${queue.title.replace(/\s+/g, '-').toLowerCase()}-${index}`
                      const statusValue = (item.status || '').toLowerCase()
                      const isPending = !statusValue || ['pending', 'submitted', 'in_review'].includes(statusValue)
                      const showActions = queue.enableActions && itemId
                      const isApproving = showActions && approvingId === itemId
                      const isDeleting = showActions && deletingId === itemId
                      const actionButtons = []

                      if (showActions && isPending && onApprove) {
                        actionButtons.push(
                          <button
                            key="approve"
                            type="button"
                            className={`${overviewStyles.actionButton} ${overviewStyles.actionButtonPrimary}`}
                            onClick={() => onApprove(item)}
                            disabled={isApproving || isDeleting}
                          >
                            {isApproving ? 'Approving…' : 'Approve'}
                          </button>
                        )
                      }

                      if (showActions && onDelete) {
                        actionButtons.push(
                          <button
                            key="delete"
                            type="button"
                            className={`${overviewStyles.actionButton} ${overviewStyles.actionButtonDanger}`}
                            onClick={() => onDelete(item)}
                            disabled={isApproving || isDeleting}
                          >
                            {isDeleting ? 'Removing…' : 'Delete'}
                          </button>
                        )
                      }

                      return (
                        <div key={key} className={overviewStyles.listItem}>
                          <span className={overviewStyles.badge}>{queue.badge(item)}</span>
                          <div>
                            <strong>{queue.getPrimary(item)}</strong>
                            <div className={overviewStyles.smallMeta}>{queue.getSecondary(item)}</div>
                            {queue.getStatus && (
                              <div className={overviewStyles.smallMeta}>{queue.getStatus(item)}</div>
                            )}
                          </div>
                          <div className={overviewStyles.listItemMeta}>
                            <span className={overviewStyles.smallMeta}>
                              {formatDate(item.createdAt || item.submittedAt || item.updatedAt)}
                            </span>
                            {actionButtons.length > 0 && (
                              <div className={overviewStyles.listActions}>{actionButtons}</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className={overviewStyles.emptyState}>{queue.empty}</div>
                )}
              </article>
            )
          })}
        </section>

        <section className={overviewStyles.panel}>
          <header className={overviewStyles.panelHeader}>
            <div>
              <h2>Evaluation Requests</h2>
              <span>
                {evaluationReviewItems.length
                  ? `${evaluationReviewItems.length} requests (${pendingEvaluations.length} pending)`
                  : 'No evaluation requests pending'}
              </span>
            </div>
          </header>

          {evaluationActionNotice && (
            <div
              className={`${overviewStyles.actionNotice} ${
                evaluationActionNotice.type === 'error'
                  ? overviewStyles.actionNoticeError
                  : overviewStyles.actionNoticeSuccess
              }`}
            >
              {evaluationActionNotice.message}
            </div>
          )}

          {loading ? (
            <div className={overviewStyles.emptyState}>Loading evaluation requests…</div>
          ) : evaluationReviewItems.length ? (
            <div className={overviewStyles.list}>
              {evaluationReviewItems.slice(0, 6).map((evaluation, index) => {
                const evaluationId = resolveEvaluationId(evaluation) || `evaluation-${index}`
                const statusValue = (evaluation.status || '').toLowerCase()
                const isPendingEvaluation = !statusValue || ['pending', 'under evaluation', 'under_evaluation', 'submitted'].includes(statusValue)
                const mediaPreview = Array.isArray(evaluation.propertyMedia) ? evaluation.propertyMedia.slice(0, 3) : []
                const documentPreview = Array.isArray(evaluation.supportingDocuments) ? evaluation.supportingDocuments.slice(0, 3) : []
                const currentValue = valueDrafts[evaluationId] ?? evaluation.evaluationValue ?? evaluation.propertyValue ?? ''
                const currentComment = commentDrafts[evaluationId] ?? evaluation.adminComment ?? ''

                return (
                  <div key={evaluationId} className={overviewStyles.listItem}>
                    <span className={overviewStyles.badge}>{evaluation.propertyType || evaluation.type || 'evaluation'}</span>
                    <div>
                      <strong>{evaluation.property || evaluation.propertyName || evaluation.propertyAddress || 'Property evaluation'}</strong>
                      <div className={overviewStyles.smallMeta}>{evaluation.address || evaluation.propertyAddress || evaluation.city || 'No address provided'}</div>
                      <div className={overviewStyles.smallMeta}>Status · {(evaluation.status || 'pending').toUpperCase()}</div>
                      {evaluation.evaluationValue && (evaluation.status || '').toLowerCase() === 'approved' && (
                        <div className={overviewStyles.smallMeta}>
                          Evaluated Value · {evaluation.evaluationValue}
                        </div>
                      )}
                      {mediaPreview.length > 0 && (
                        <div className={overviewStyles.mediaStrip}>
                          {mediaPreview.map((media, mediaIndex) => {
                            const previewUrl = media?.dataUrl || media?.url
                            if (!previewUrl) {
                              return (
                                <div key={`${evaluationId}-media-${mediaIndex}`} className={overviewStyles.mediaThumbPlaceholder}>
                                  {(media?.name || 'media').slice(0, 2).toUpperCase()}
                                </div>
                              )
                            }
                            return (
                              <img
                                key={`${evaluationId}-media-${mediaIndex}`}
                                src={previewUrl}
                                alt={media.name || `media-${mediaIndex + 1}`}
                                className={overviewStyles.mediaThumb}
                              />
                            )
                          })}
                        </div>
                      )}
                      {documentPreview.length > 0 && (
                        <div className={overviewStyles.documentRow}>
                          {documentPreview.map((docItem, docIndex) => (
                            <a
                              key={`${evaluationId}-doc-${docIndex}`}
                              href={docItem?.dataUrl || docItem?.url || '#'}
                              download={docItem?.name || `document-${docIndex + 1}`}
                              target="_blank"
                              rel="noreferrer"
                              className={overviewStyles.docLink}
                            >
                              {docItem?.name || `Document ${docIndex + 1}`}
                            </a>
                          ))}
                        </div>
                      )}
                      <div className={overviewStyles.inlineMetaRow}>
                        <Link href={`/evaluation-detail?id=${evaluationId}`} className={overviewStyles.inlineLink}>
                          View submission
                        </Link>
                        {evaluation.pdfReport && (
                          <a href={evaluation.pdfReport} target="_blank" rel="noreferrer" className={overviewStyles.inlineLink}>
                            Download PDF
                          </a>
                        )}
                      </div>
                      {isPendingEvaluation ? (
                        <>
                          <div className={overviewStyles.inlineForm}>
                            <span className={overviewStyles.inlineLabel}>Evaluated Value</span>
                            <input
                              className={overviewStyles.inlineInput}
                              value={currentValue}
                              onChange={(event) =>
                                setValueDrafts((prev) => ({ ...prev, [evaluationId]: event.target.value }))
                              }
                              placeholder="PKR 25,000,000"
                            />
                          </div>
                          <div className={overviewStyles.inlineForm}>
                            <span className={overviewStyles.inlineLabel}>Admin Comment</span>
                            <textarea
                              className={overviewStyles.inlineTextarea}
                              value={currentComment}
                              onChange={(event) =>
                                setCommentDrafts((prev) => ({ ...prev, [evaluationId]: event.target.value }))
                              }
                              placeholder="Share inspection notes for the downloadable report."
                            />
                          </div>
                        </>
                      ) : (
                        <div className={overviewStyles.inlineForm}>
                          <span className={overviewStyles.inlineLabel}>Admin Comment</span>
                          <p className={overviewStyles.inlineCopy}>{evaluation.adminComment || 'No remarks recorded yet.'}</p>
                        </div>
                      )}
                    </div>
                    <div className={overviewStyles.listItemMeta}>
                      <span className={overviewStyles.smallMeta}>{formatDate(evaluation.submittedAt || evaluation.createdAt)}</span>
                      <div className={overviewStyles.listActions}>
                        {isPendingEvaluation && (
                          <button
                            type="button"
                            className={`${overviewStyles.actionButton} ${overviewStyles.actionButtonPrimary}`}
                            onClick={() => handleApproveEvaluation(evaluation)}
                            disabled={processingEvaluationId === evaluationId || deletingEvaluationId === evaluationId}
                          >
                            {processingEvaluationId === evaluationId ? 'Approving…' : 'Approve'}
                          </button>
                        )}
                        <button
                          type="button"
                          className={`${overviewStyles.actionButton} ${overviewStyles.actionButtonDanger}`}
                          onClick={() => handleDeleteEvaluation(evaluation)}
                          disabled={deletingEvaluationId === evaluationId || processingEvaluationId === evaluationId}
                        >
                          {deletingEvaluationId === evaluationId ? 'Removing…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={overviewStyles.emptyState}>There are no evaluation requests at the moment.</div>
          )}
        </section>

        <section className={overviewStyles.quickGrid}>
          {insightCards.map((card) => (
            <article key={card.title} className={overviewStyles.quickCard}>
              <div className={overviewStyles.badge}>{card.count}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <span className={overviewStyles.smallMeta}>
                {card.count ? 'Action required' : 'No pending items'}
              </span>
            </article>
          ))}
        </section>

        <section className={overviewStyles.colTwo}>
          <article className={overviewStyles.panel}>
            <header className={overviewStyles.panelHeader}>
              <div>
                <h2>Recently Submitted Properties</h2>
                <span>{topProperties.length ? `${topProperties.length} of ${allProperties.length} total` : 'No property submissions yet'}</span>
              </div>
            </header>

            {loading ? (
              <div className={overviewStyles.emptyState}>Loading properties…</div>
            ) : topProperties.length ? (
              <div className={overviewStyles.list}>
                {topProperties.map((property) => (
                  <div key={property.id} className={overviewStyles.listItem}>
                    <span className={`${overviewStyles.badge} ${getStatusBadgeClass(property.status)}`}>
                      {property.status || 'pending'}
                    </span>
                    <div>
                      <strong>{property.title || property.name || 'Untitled property'}</strong>
                      <div className={overviewStyles.smallMeta}>
                        {property.location || property.address || 'Location unavailable'}
                      </div>
                    </div>
                    <span className={overviewStyles.smallMeta}>{formatDate(property.createdAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={overviewStyles.emptyState}>No properties have been submitted yet.</div>
            )}
          </article>

          <article className={overviewStyles.panel}>
            <header className={overviewStyles.panelHeader}>
              <div>
                <h2>Recent Investments</h2>
                <span>{topInvestments.length ? `${topInvestments.length} of ${allInvestments.length} total` : 'No investor activity yet'}</span>
              </div>
            </header>

            {loading ? (
              <div className={overviewStyles.emptyState}>Loading investments…</div>
            ) : topInvestments.length ? (
              <div className={overviewStyles.list}>
                {topInvestments.map((investment) => (
                  <div key={investment.id} className={overviewStyles.listItem}>
                    <span className={`${overviewStyles.badge} ${getStatusBadgeClass(investment.status)}`}>
                      {investment.status || 'active'}
                    </span>
                    <div>
                      <strong>{investment.propertyTitle || investment.propertyName || 'Investment'}</strong>
                      <div className={overviewStyles.smallMeta}>
                        {formatCurrency(investment.amount || investment.currentValue)}
                      </div>
                    </div>
                    <span className={overviewStyles.smallMeta}>{formatDate(investment.investmentDate || investment.createdAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={overviewStyles.emptyState}>No investments captured yet.</div>
            )}
          </article>
        </section>

        <section className={overviewStyles.listRow}>
          <article className={overviewStyles.listCard}>
            <div className={overviewStyles.listHeader}>
              <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Last Transactions</h2>
              <button 
                type="button"
                onClick={() => router.push('/admin-dashboard/reports')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  padding: '0',
                  textDecoration: 'underline'
                }}
              >
                See all
              </button>
            </div>
            <div className={overviewStyles.listItems}>
              {lastTransactions.length ? (
                lastTransactions.map((transaction) => (
                  <div key={transaction.id} className={overviewStyles.transactionItem}>
                    <div className={overviewStyles.thumb}>
                      {transaction.property.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className={overviewStyles.listPrimary}>{transaction.property}</div>
                      <div className={overviewStyles.listMeta}>{transaction.date}</div>
                    </div>
                    <div className={overviewStyles.amountPositive}>{transaction.amount}</div>
                  </div>
                ))
              ) : (
                <div className={overviewStyles.listMeta}>No recent transactions recorded.</div>
              )}
            </div>
          </article>

          <article className={overviewStyles.listCard}>
            <div className={overviewStyles.listHeader}>
              <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Maintenance Requests</h2>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <button 
                  type="button"
                  onClick={() => router.push('/property-maintenance')}
                  style={{
                    background: '#f97316',
                    border: 'none',
                    color: 'white',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}
                >
                  Hire Contractor
                </button>
                <button 
                  type="button"
                  onClick={() => router.push('/admin-dashboard/maintenance')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    padding: '0',
                    textDecoration: 'underline'
                  }}
                >
                  See all
                </button>
              </div>
            </div>
            <div className={overviewStyles.listItems}>
              {maintenanceRequests.length ? (
                maintenanceRequests.map((request) => (
                  <div key={request.id} className={overviewStyles.maintenanceItem}>
                    <span className={overviewStyles.statusPill}>{request.issue}</span>
                    <div>
                      <div className={overviewStyles.listPrimary}>{request.title}</div>
                      <div className={overviewStyles.listMeta}>{request.createdAt}</div>
                    </div>
                    <div className={overviewStyles.listMeta}>{request.requester}</div>
                  </div>
                ))
              ) : (
                <div className={overviewStyles.listMeta}>No maintenance requests pending.</div>
              )}
            </div>
          </article>
        </section>

        <section className={overviewStyles.panel}>
          <header className={overviewStyles.panelHeader}>
            <div>
              <h2>Latest Contact Messages</h2>
              <span>{latestMessages.length 
                ? `${latestMessages.length} unread of ${contactMessages.length}` 
                : contactMessages.length 
                  ? `${contactMessages.length} total messages`
                  : 'No messages yet'}</span>
            </div>
          </header>

          {messageActionNotice && (
            <div
              className={`${overviewStyles.actionNotice} ${
                messageActionNotice.type === 'error'
                  ? overviewStyles.actionNoticeError
                  : overviewStyles.actionNoticeSuccess
              }`}
            >
              {messageActionNotice.message}
            </div>
          )}

          {loading ? (
            <div className={overviewStyles.emptyState}>Loading messages…</div>
          ) : latestMessages.length ? (
            <div className={overviewStyles.messageList}>
              {latestMessages.map((message) => (
                <article key={message.id} className={overviewStyles.messageCard}>
                  <div className={overviewStyles.messageHeader}>
                    <strong>{message.name || message.email || 'Anonymous contact'}</strong>
                    <span className={overviewStyles.badge}>{message.status || 'new'}</span>
                  </div>
                  <div className={overviewStyles.messageBody}>{message.message || message.content || 'No message body provided.'}</div>
                  <div className={overviewStyles.messageFooter}>
                    <span>{message.email || 'No email provided'}</span>
                    <div className={overviewStyles.messageActions}>
                      {message.email && (
                        <a
                          className={`${overviewStyles.actionButton} ${overviewStyles.actionButtonSecondary}`}
                          href={`mailto:${message.email}?subject=${encodeURIComponent('REMMIC Support Response')}`}
                        >
                          Email
                        </a>
                      )}
                      {(message.status || '').toLowerCase() !== 'read' && (
                        <button
                          type="button"
                          className={`${overviewStyles.actionButton} ${overviewStyles.actionButtonPrimary}`}
                          onClick={() => handleMarkMessageRead(message)}
                          disabled={processingMessageId === message.id || deletingMessageId === message.id}
                        >
                          {processingMessageId === message.id ? 'Marking…' : 'Mark as read'}
                        </button>
                      )}
                      <button
                        type="button"
                        className={`${overviewStyles.actionButton} ${overviewStyles.actionButtonDanger}`}
                        onClick={() => handleDeleteMessage(message)}
                        disabled={deletingMessageId === message.id || processingMessageId === message.id}
                      >
                        {deletingMessageId === message.id ? 'Removing…' : 'Delete'}
                      </button>
                      <button
                        type="button"
                        className={`${overviewStyles.actionButton} ${overviewStyles.actionButtonSecondary}`}
                        onClick={() => handleOpenReply(message)}
                        disabled={processingMessageId === message.id || deletingMessageId === message.id}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                  <div className={overviewStyles.smallMeta}>{formatDate(message.createdAt)}</div>
                  {message.phone && (
                    <div className={overviewStyles.smallMeta}>Phone: {message.phone}</div>
                  )}
                  {Array.isArray(message.replies) && message.replies.length > 0 && (
                    <div className={overviewStyles.messageReplies}>
                      {message.replies.map((reply) => (
                        <div key={reply.id} className={overviewStyles.messageReply}>
                          <strong>{reply.responderName || 'Admin response'}</strong>
                          <div>{reply.body}</div>
                          <span className={overviewStyles.smallMeta}>{formatDate(reply.sentAt)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {replyingMessageId === message.id && (
                    <div style={{ marginTop: '16px', display: 'grid', gap: '12px' }}>
                      <textarea
                        value={replyBody}
                        onChange={(event) => setReplyBody(event.target.value)}
                        rows={3}
                        placeholder="Write your reply..."
                        className="contact-text-area w-input"
                        style={{ width: '100%' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className={`${overviewStyles.actionButton} ${overviewStyles.actionButtonDanger}`}
                          onClick={() => {
                            setReplyingMessageId(null)
                            setReplyBody('')
                          }}
                          disabled={sendingReplyId === message.id}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className={`${overviewStyles.actionButton} ${overviewStyles.actionButtonPrimary}`}
                          onClick={() => handleSendReply(message)}
                          disabled={sendingReplyId === message.id}
                        >
                          {sendingReplyId === message.id ? 'Sending…' : 'Send Reply'}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className={overviewStyles.emptyState}>There are no new contact messages.</div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
