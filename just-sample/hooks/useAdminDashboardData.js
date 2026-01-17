import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFirebase } from '../contexts/FirebaseContext'

const defaultStats = {
  totalUsers: 0,
  activeProperties: 0,
  pendingProperties: 0,
  totalInvestments: 0,
  totalInvestmentValue: 0,
  pendingInvestments: 0,
  totalBids: 0,
  pendingBids: 0,
  totalRentals: 0,
  pendingRentals: 0,
  totalEvaluations: 0,
  pendingEvaluations: 0,
  totalMessages: 0,
  unreadMessages: 0,
}

const initialState = {
  loading: true,
  error: null,
  stats: defaultStats,
  contactMessages: [],
  pendingProperties: [],
  pendingInvestments: [],
  pendingBids: [],
  pendingRentals: [],
  pendingEvaluations: [],
  allProperties: [],
  allInvestments: [],
  allBids: [],
  allEvaluations: [],
}

export function useAdminDashboardData(options = {}) {
  const { enabled = true } = options
  const {
    getProperties,
    getAllProperties,
    getInvestments,
    getAllInvestments,
    getBids,
    getEvaluations,
    getAllContactMessages,
  } = useFirebase()

  const [state, setState] = useState(initialState)

  const load = useCallback(async () => {
    if (!enabled) {
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const [propertiesResult, allPropertiesResult, investmentsResult, allInvestmentsResult, bidsResult, evaluationsResult, messagesResult] = await Promise.all([
        getProperties?.() ?? { success: true, properties: [] },
        getAllProperties?.() ?? { success: true, properties: [] },
        getInvestments?.() ?? { success: true, investments: [] },
        getAllInvestments?.() ?? { success: true, investments: [] },
        getBids?.() ?? { success: true, bids: [] },
        getEvaluations?.() ?? { success: true, evaluations: [] },
        getAllContactMessages?.() ?? { success: true, messages: [] },
      ])

      const properties = propertiesResult?.success ? propertiesResult.properties ?? [] : []
      const allPropertiesData = allPropertiesResult?.success ? allPropertiesResult.properties ?? [] : []
      const investments = investmentsResult?.success ? investmentsResult.investments ?? [] : []
      const allInvestmentsData = allInvestmentsResult?.success ? allInvestmentsResult.investments ?? [] : []
      const bids = bidsResult?.success ? bidsResult.bids ?? [] : []
      const evaluations = evaluationsResult?.success ? evaluationsResult.evaluations ?? [] : []
      const messages = messagesResult?.success ? messagesResult.messages ?? [] : []

      const combinedProperties = [...allPropertiesData, ...properties].filter((prop, index, self) =>
        index === self.findIndex((candidate) => candidate.id === prop.id)
      )

      const combinedInvestments = [...allInvestmentsData, ...investments].filter((inv, index, self) =>
        index === self.findIndex((candidate) => candidate.id === inv.id)
      )

      const totalInvestmentValue = combinedInvestments.reduce(
        (sum, inv) => sum + Number(inv.amount ?? inv.currentValue ?? 0),
        0
      )

      const activeProperties = combinedProperties.filter(
        (property) => ['approved', 'active'].includes((property.status || '').toLowerCase())
      )

      const pendingPropertiesData = combinedProperties.filter((property) => {
        const status = (property.status || '').toLowerCase()
        return status === 'pending' || !status
      })

      const pendingInvestmentsData = combinedInvestments.filter((investment) => {
        const status = (investment.status || '').toLowerCase()
        return status === 'pending' || !status
      })

      const pendingBidsData = bids.filter((bid) => {
        const status = (bid.status || '').toLowerCase()
        return status === 'pending' || !status
      })

      const pendingEvaluationsData = evaluations.filter((evaluation) => {
        const status = (evaluation.status || '').toLowerCase()
        return (
          status === 'pending'
          || status === 'submitted'
          || status === 'under evaluation'
          || status === 'under_evaluation'
          || !status
        )
      })

      const pendingRentalsData = combinedProperties.filter((property) => {
        const type = (property.listingType || property.type || '').toLowerCase()
        const status = (property.status || '').toLowerCase()
        const isRental = ['rental', 'lease', 'rent'].includes(type)
        return isRental && (status === 'pending' || !status)
      })

      const unreadMessagesData = messages.filter((message) => {
        const status = (message.status || '').toLowerCase()
        return status === 'unread' || !status
      })

      const userIds = new Set()
      combinedProperties.forEach((property) => property.userId && userIds.add(property.userId))
      combinedInvestments.forEach((investment) => investment.userId && userIds.add(investment.userId))
      bids.forEach((bid) => bid.userId && userIds.add(bid.userId))
      evaluations.forEach((evaluation) => evaluation.userId && userIds.add(evaluation.userId))
      messages.forEach((message) => message.userId && userIds.add(message.userId))

      setState({
        loading: false,
        error: null,
        stats: {
          totalUsers: userIds.size,
          activeProperties: activeProperties.length,
          pendingProperties: pendingPropertiesData.length,
          totalInvestments: combinedInvestments.length,
          totalInvestmentValue,
          pendingInvestments: pendingInvestmentsData.length,
          totalBids: bids.length,
          pendingBids: pendingBidsData.length,
          totalRentals: combinedProperties.filter((property) => ['rental', 'lease', 'rent'].includes((property.listingType || property.type || '').toLowerCase())).length,
          pendingRentals: pendingRentalsData.length,
          totalEvaluations: evaluations.length,
          pendingEvaluations: pendingEvaluationsData.length,
          totalMessages: messages.length,
          unreadMessages: unreadMessagesData.length,
        },
        contactMessages: messages,
        pendingProperties: pendingPropertiesData,
        pendingInvestments: pendingInvestmentsData,
        pendingBids: pendingBidsData,
        pendingRentals: pendingRentalsData,
        pendingEvaluations: pendingEvaluationsData,
        allProperties: combinedProperties,
        allInvestments: combinedInvestments,
        allBids: bids,
        allEvaluations: evaluations,
      })
    } catch (error) {
      console.error('Error loading admin dashboard data:', error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data',
        stats: defaultStats,
        contactMessages: [],
        pendingProperties: [],
        pendingInvestments: [],
        pendingBids: [],
        pendingRentals: [],
        pendingEvaluations: [],
        allProperties: [],
        allInvestments: [],
        allBids: [],
        allEvaluations: [],
      }))
    }
  }, [enabled, getAllContactMessages, getAllInvestments, getAllProperties, getBids, getEvaluations, getInvestments, getProperties])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return undefined
    }

    const handleStorage = (event) => {
      if (
        !event.key
        || event.key === 'userProperties'
        || event.key === 'userInvestments'
        || event.key === 'evaluationProperties'
        || event.key === 'contactMessages'
      ) {
        load()
      }
    }

    const customEvents = ['contactMessagesUpdated', 'evaluationPropertiesUpdated', 'userPropertiesUpdated']

    window.addEventListener('storage', handleStorage)
    customEvents.forEach((eventName) => window.addEventListener(eventName, handleStorage))

    return () => {
      window.removeEventListener('storage', handleStorage)
      customEvents.forEach((eventName) => window.removeEventListener(eventName, handleStorage))
    }
  }, [enabled, load])

  const formattedStats = useMemo(() => state.stats, [state.stats])

  return {
    ...state,
    stats: formattedStats,
    refresh: load,
  }
}
