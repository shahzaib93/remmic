import Head from 'next/head'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import SecondaryMarket from '../components/SecondaryMarket'
import { getPropertiesByType, ensurePropertyImage, formatCurrency } from '../utils/propertyStorage'
import { useFirebase } from '../contexts/FirebaseContext'
import Footer from '../components/Footer'

const CRORE = 10000000
const LAKH = 100000
const MILLION = 1000000

const parseAmount = (value) => {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null

  const normalized = value.trim().toLowerCase()
  if (!normalized) return null

  let multiplier = 1
  if (normalized.includes('crore')) multiplier = CRORE
  else if (normalized.includes('lakh')) multiplier = LAKH
  else if (normalized.includes('million')) multiplier = MILLION
  else if (normalized.includes('billion')) multiplier = 1000 * MILLION

  const numeric = parseFloat(normalized.replace(/[^0-9.]/g, ''))
  if (!Number.isFinite(numeric)) return null

  return numeric * multiplier
}

const formatPercent = (value) => {
  if (!Number.isFinite(value)) return '0%'
  const rounded = Number(value.toFixed(1))
  const sign = rounded > 0 ? '+' : ''
  return `${sign}${rounded}%`
}

const generateMonthlyGrowthSeries = (portfolioValue, averageAnnualReturn) => {
  const data = []
  const baseValue = Number.isFinite(portfolioValue) ? portfolioValue : 0
  const avgReturn = Number.isFinite(averageAnnualReturn) ? averageAnnualReturn : 0
  const now = new Date()

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const progressRatio = (12 - i) / 12
    const growth = avgReturn * progressRatio
    const value = baseValue * (1 + growth / 100)

    data.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      growth: Number(growth.toFixed(2)),
      value: Number(value.toFixed(0)),
    })
  }

  return data
}

const formatHoldPeriod = (share) => {
  const holdMonths = share?.holdPeriodMonths || share?.holdPeriod || share?.durationMonths
  if (Number.isFinite(holdMonths) && holdMonths > 0) {
    if (holdMonths % 12 === 0) {
      const years = holdMonths / 12
      return `${years} year${years === 1 ? '' : 's'}`
    }
    return `${holdMonths} month${holdMonths === 1 ? '' : 's'}`
  }

  const holdYears = share?.holdPeriodYears || share?.durationYears
  if (Number.isFinite(holdYears) && holdYears > 0) {
    return `${holdYears} year${holdYears === 1 ? '' : 's'}`
  }

  return 'N/A'
}

const formatYieldPercent = (value) => {
  if (!Number.isFinite(value)) return 'N/A'
  const rounded = Number(value.toFixed(1))
  return `${rounded}%`
}

const ensureFeatureArraySafe = (raw) => {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object') {
          if (typeof item.label === 'string') return item.label
          if (typeof item.name === 'string') return item.name
        }
        return null
      })
      .filter(Boolean)
  }
  if (typeof raw === 'string') {
    return [raw]
  }
  return []
}

export default function InvestmentShares() {
  const [investmentShares, setInvestmentShares] = useState([])
  const [isMobile, setIsMobile] = useState(false)
  const [investmentAnalytics, setInvestmentAnalytics] = useState({
    totalPortfolioValue: 0,
    totalDistributedShares: 0,
    totalAvailableShares: 0,
    totalInvestors: 0,
    averageReturn: 0,
    averageSharePrice: 0,
    averageShareChangeValue: 0,
    monthlyGrowth: [],
    distributedSharesData: [],
    topPerformingInvestments: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all')
  const [filteredInvestments, setFilteredInvestments] = useState([])
  const { getAllProperties, getAllInvestments } = useFirebase()
  const router = useRouter()
  const scrollerRef = useRef(null)
  const autoScrollRef = useRef({ isPointerDown: false, isHovered: false })
  const [selectedSort, setSelectedSort] = useState('recommended')
  const rememberOpportunity = useCallback((opportunity) => {
    if (typeof window === 'undefined') return
    try {
      const payload = {
        savedAt: Date.now(),
        share: opportunity,
      }
      window.localStorage.setItem('selectedInvestmentOpportunity', JSON.stringify(payload))
    } catch (error) {
      console.warn('Failed to cache selected opportunity:', error)
    }
  }, [])
  const handleShareOpportunity = useCallback((opportunity) => {
    if (typeof window === 'undefined') return
    const shareUrl = `${window.location.origin}/investment-shares?id=${opportunity?.id || opportunity?.originalId || ''}`
    const shareData = {
      title: opportunity?.title || 'REMMIC Opportunity',
      text: `Explore ${opportunity?.title || 'this REMMIC investment'} on REMMIC.`,
      url: shareUrl
    }

    if (navigator.share) {
      navigator.share(shareData).catch(() => navigator.clipboard?.writeText(shareUrl))
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
    }
  }, [])

  // No carousel - just use filtered investments directly

  const highlightedId = useMemo(() => router.query.id?.toString() || null, [router.query.id])

  const availableLocations = useMemo(() => {
    const seen = new Set()
    const unique = []
    investmentShares.forEach((share) => {
      const location = (share.location || '').trim()
      if (!location) return
      const key = location.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(location)
      }
    })
    return unique
  }, [investmentShares])

  const availableRiskLevels = useMemo(() => {
    const seen = new Set()
    const unique = []
    investmentShares.forEach((share) => {
      const risk = (share.riskLevel || '').trim()
      if (!risk) return
      const key = risk.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(risk)
      }
    })
    return unique
  }, [investmentShares])


  useEffect(() => {
    if (
      selectedLocation !== 'all'
      && !availableLocations.some((location) => location.toLowerCase() === selectedLocation.toLowerCase())
    ) {
      setSelectedLocation('all')
    }
  }, [availableLocations, selectedLocation])

  useEffect(() => {
    if (
      selectedRiskLevel !== 'all'
      && !availableRiskLevels.some((risk) => risk.toLowerCase() === selectedRiskLevel.toLowerCase())
    ) {
      setSelectedRiskLevel('all')
    }
  }, [availableRiskLevels, selectedRiskLevel])

  const loadInvestments = useCallback(async () => {
    setIsLoading(true)

    try {
      const [propertyResponse, investmentResponse] = await Promise.all([
        typeof getAllProperties === 'function' ? getAllProperties() : Promise.resolve(null),
        typeof getAllInvestments === 'function' ? getAllInvestments() : Promise.resolve(null)
      ])

      const fetchedProperties = Array.isArray(propertyResponse?.properties) ? propertyResponse.properties : []
      const fallbackProperties = typeof window !== 'undefined' ? getPropertiesByType('investment') : []
      const rawProperties = fetchedProperties.length > 0 ? fetchedProperties : fallbackProperties

      const normalizedProperties = (rawProperties || []).filter((property) => {
        const type = (property?.type || '').toLowerCase()
        const status = (property?.status || '').toLowerCase()
        if (type && type !== 'investment') return false
        return status !== 'archived'
      })

      const fetchedInvestments = Array.isArray(investmentResponse?.investments) ? investmentResponse.investments : []
      let fallbackInvestments = []
      if (!fetchedInvestments.length && typeof window !== 'undefined') {
        try {
          fallbackInvestments = JSON.parse(window.localStorage.getItem('userInvestments') || '[]')
        } catch {
          fallbackInvestments = []
        }
      }
      const allInvestments = fetchedInvestments.length ? fetchedInvestments : fallbackInvestments

      const propertySummaries = normalizedProperties.map((property, index) => {
        const propertyId = property?.id != null ? property.id.toString() : property?.propertyId?.toString()
        if (!propertyId) return null

        const propertyInvestments = allInvestments.filter((investment) => {
          const investmentPropertyId = investment?.propertyId ?? investment?.property?.id
          if (!investmentPropertyId) return false
          return investmentPropertyId.toString() === propertyId
        })

        const shareOffering = property.shareOffering || {}

        const priceNumericCandidates = [
          Number(property.priceNumeric),
          parseAmount(property.price),
          parseAmount(property.valuation),
          parseAmount(property.totalValue)
        ].filter((value) => Number.isFinite(value))
        const priceNumeric = priceNumericCandidates.length ? priceNumericCandidates[0] : 0

        const sharePriceCandidates = [
          Number(shareOffering.sharePrice),
          parseAmount(property.sharePrice),
          parseAmount(property.minInvestment),
          parseAmount(property.minimumInvestment),
          parseAmount(property.minInvestmentAmount),
          parseAmount(property.minimumContribution)
        ].filter((value) => Number.isFinite(value))

        const totalSharesFromOffering = Number.isFinite(Number(shareOffering.totalShares))
          ? Number(shareOffering.totalShares)
          : Number(property.totalShares)

        const sharesSoldFromOffering = Number.isFinite(Number(shareOffering.sharesSold))
          ? Number(shareOffering.sharesSold)
          : null

        const sharesAvailableFromOffering = Number.isFinite(Number(shareOffering.sharesAvailable))
          ? Number(shareOffering.sharesAvailable)
          : null

        const propertyInvestmentsShares = propertyInvestments.reduce((sum, inv) => {
          const shareCount = Number(inv?.shares ?? inv?.sharesOwned) || 0
          return sum + shareCount
        }, 0)

        const propertyInvestmentsAmount = propertyInvestments.reduce((sum, inv) => {
          const amount = Number(inv?.amount ?? inv?.totalAmount) || 0
          return sum + amount
        }, 0)

        const inferredSharesSold = sharesSoldFromOffering != null
          ? sharesSoldFromOffering
          : propertyInvestmentsShares

        const inferredTotalShares = Number.isFinite(totalSharesFromOffering)
          ? totalSharesFromOffering
          : Math.max(propertyInvestmentsShares, Number(property.totalShares) || 0, 100)

        const baselineSharePrice = sharePriceCandidates.length > 0
          ? sharePriceCandidates[0]
          : (propertyInvestmentsShares > 0 && propertyInvestmentsAmount > 0
              ? propertyInvestmentsAmount / propertyInvestmentsShares
              : (priceNumeric > 0 ? priceNumeric / Math.max(inferredTotalShares || 1, 1) : 50000))

        const inferredSharesAvailable = sharesAvailableFromOffering != null
          ? sharesAvailableFromOffering
          : Math.max(inferredTotalShares - inferredSharesSold, 0)

        let currentSharePrice = propertyInvestments.length > 0
          ? propertyInvestments.reduce((sum, inv) => {
              const shareCount = Number(inv?.shares ?? inv?.sharesOwned) || 0
              if (shareCount <= 0) return sum + baselineSharePrice
              const investmentCurrentValue = Number(inv?.currentValue) || Number(inv?.amount) || baselineSharePrice * shareCount
              return sum + (investmentCurrentValue / shareCount)
            }, 0) / propertyInvestments.length
          : baselineSharePrice

        let sharePriceDelta = currentSharePrice - baselineSharePrice
        let sharePriceDeltaPercent = baselineSharePrice > 0 ? (sharePriceDelta / baselineSharePrice) * 100 : 0

        if (!Number.isFinite(sharePriceDeltaPercent) || sharePriceDeltaPercent === 0) {
          const expectedAppreciation = Number(shareOffering.expectedAppreciation)
          if (Number.isFinite(expectedAppreciation) && expectedAppreciation !== 0) {
            sharePriceDeltaPercent = expectedAppreciation
            sharePriceDelta = baselineSharePrice * (expectedAppreciation / 100)
            currentSharePrice = baselineSharePrice + sharePriceDelta
          }
        }

        const normalizedSharesSold = Number.isFinite(inferredSharesSold) ? inferredSharesSold : 0
        const normalizedSharesAvailable = Number.isFinite(inferredSharesAvailable)
          ? inferredSharesAvailable
          : Math.max((inferredTotalShares || 0) - normalizedSharesSold, 0)

        const totalValueNumeric = baselineSharePrice * (inferredTotalShares || 0)
        const currentValueNumeric = currentSharePrice * (inferredTotalShares || 0)

        const minInvestmentCandidates = [
          Number(shareOffering.minInvestmentAmount),
          Number(shareOffering.minSharesPerInvestor) * baselineSharePrice,
          parseAmount(property.minInvestment),
          parseAmount(property.minimumInvestment),
          parseAmount(property.minInvestmentAmount)
        ].filter((value) => Number.isFinite(value) && value > 0)
        const minInvestmentValue = minInvestmentCandidates.length ? minInvestmentCandidates[0] : baselineSharePrice * Math.max(Number(shareOffering.minSharesPerInvestor) || 1, 1)

        const projectedYieldPercent = Number(shareOffering.projectedYield)
        const monthlyGrowthPercent = Number.isFinite(projectedYieldPercent) && projectedYieldPercent > 0
          ? projectedYieldPercent / 12
          : sharePriceDeltaPercent / 12

        const uniqueInvestorsFromOffering = Number.isFinite(Number(shareOffering.investorCount))
          ? Number(shareOffering.investorCount)
          : null

        const uniqueInvestors = uniqueInvestorsFromOffering != null
          ? uniqueInvestorsFromOffering
          : new Set(
              propertyInvestments.map((inv) => inv?.userId || inv?.userEmail || inv?.id)
            ).size

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const recentInvestments = propertyInvestments.filter((inv) => {
          const investmentDate = inv?.investmentDate || inv?.createdAt
          if (!investmentDate) return false
          const dateInstance = new Date(investmentDate)
          return !Number.isNaN(dateInstance.getTime()) && dateInstance >= thirtyDaysAgo
        }).length

        const projectedValueNumeric = currentValueNumeric * (1 + Math.max(sharePriceDeltaPercent || 5, 5) / 100)

        const fundingRaised = Number.isFinite(Number(shareOffering.fundingRaised))
          ? Number(shareOffering.fundingRaised)
          : propertyInvestmentsAmount

        const fundingTarget = baselineSharePrice * (inferredTotalShares || 0)
        const fundingPercent = fundingTarget > 0
          ? Math.min(100, Math.max(0, (fundingRaised / fundingTarget) * 100))
          : soldPercent

        const features = ensureFeatureArraySafe(property.features)
        const soldPercent = inferredTotalShares > 0 ? (normalizedSharesSold / inferredTotalShares) * 100 : 0
        const availablePercent = inferredTotalShares > 0
          ? (normalizedSharesAvailable / inferredTotalShares) * 100
          : 100

        const highlightMatch = highlightedId && propertyId === highlightedId

        const rawStatus = typeof property.status === 'string' ? property.status.trim() : ''
        const normalizedStatus = rawStatus.toLowerCase()
        const isComingSoon = normalizedStatus.includes('coming')

        const shareStatus = typeof shareOffering.status === 'string' ? shareOffering.status : ''

        const baseStatus = shareStatus
          ? shareStatus
          : isComingSoon
            ? 'Coming Soon'
          : soldPercent >= 85
            ? 'Limited Availability'
            : soldPercent >= 60
              ? 'Selling Fast'
              : 'Open for Investment'

        const statusLabel = rawStatus || baseStatus

        const creationDateCandidate = property?.createdAt
          || property?.created_at
          || property?.listedAt
          || property?.listed_at
          || property?.listingDate
          || property?.listing_date

        let isNew = false
        if (creationDateCandidate) {
          const creationDate = new Date(creationDateCandidate)
          if (!Number.isNaN(creationDate.getTime()) && creationDate >= thirtyDaysAgo) {
            isNew = true
          }
        }

        if (!isNew) {
          isNew = recentInvestments > 0 || normalizedStatus.includes('new')
        }

        return {
          id: propertyId,
          isHighlighted: Boolean(highlightMatch),
          isNew,
          isComingSoon,
          title: property.title || 'Investment Opportunity',
          location: property.location || property.city || 'Location not specified',
          totalValue: formatCurrency(totalValueNumeric, { maximumFractionDigits: 0 }) ?? '',
          currentValue: formatCurrency(currentValueNumeric, { maximumFractionDigits: 0 }) ?? '',
          totalValueNumeric,
          currentValueNumeric,
          minInvestment: formatCurrency(minInvestmentValue, { maximumFractionDigits: 0 }) ?? '',
          expectedReturn: `${formatPercent(sharePriceDeltaPercent || 0)} per share`,
          monthlyGrowth: formatPercent(monthlyGrowthPercent || 0),
          growthRate: Number.isFinite(monthlyGrowthPercent) ? Number(monthlyGrowthPercent.toFixed(2)) : 0,
          riskLevel: property.riskLevel || property.risk || ['Low', 'Medium', 'High'][index % 3],
          duration: property.duration || property.investmentHorizon || '3-5 years',
          image: ensurePropertyImage(property),
          status: statusLabel,
          totalInvestors: uniqueInvestors || property.totalInvestors || property.investorsCount || 0,
          recentActivity: (() => {
            const lastInvestmentAt = shareOffering.lastInvestmentAt || shareOffering.lastInvestment || property.lastInvestmentAt
            if (lastInvestmentAt) {
              const date = new Date(lastInvestmentAt)
              if (!Number.isNaN(date.getTime())) {
                return `Last investment ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
              }
            }
            if (recentInvestments > 0) {
              return `${recentInvestments} new investment${recentInvestments === 1 ? '' : 's'} in 30 days`
            }
            return 'No new investments in the last 30 days'
          })(),
          projectedValue: `${formatCurrency(projectedValueNumeric, { maximumFractionDigits: 0 }) ?? ''} (Projected)`,
          description: property.description || property.summary || 'High-potential investment with strong market demand.',
          landCost: property.landCost ? formatCurrency(property.landCost, { maximumFractionDigits: 0 }) : formatCurrency(minInvestmentValue, { maximumFractionDigits: 0 }) || '',
          areaSize: property.areaSize || property.area || '',
          plotNumber: property.plotNumber || property.plotno || '',
          landType: property.landType || property.landtype || '',
          developmentCost: property.developmentCost ? formatCurrency(property.developmentCost, { maximumFractionDigits: 0 }) : '',
          projectedYield: property.projectedYield ? formatPercent(property.projectedYield) : '',
          expectedAppreciation: property.expectedAppreciation ? formatPercent(property.expectedAppreciation) : '',
          holdingPeriodMonths: property.holdingPeriodMonths || property.holdPeriodMonths || '',
          features: features.length > 0
            ? features
            : ['Verified documentation', 'High demand location', 'Projected rental income', 'Professional management'],
          source: property.source || 'official',
          consortiumPartner: property.consortiumPartner || property.developer || property.partner || 'DHA Developers',
          sharesDistributed: normalizedSharesSold,
          sharesDistributedPercent: soldPercent,
          sharesAvailable: Math.round(availablePercent),
          sharesAvailablePercent: availablePercent,
          sharesSold: normalizedSharesSold,
          totalShares: inferredTotalShares,
          sharesAvailableCount: normalizedSharesAvailable,
          sharePrice: baselineSharePrice,
          sharePriceFormatted: formatCurrency(baselineSharePrice, { maximumFractionDigits: 0 }) ?? '',
          currentSharePriceFormatted: formatCurrency(currentSharePrice, { maximumFractionDigits: 0 }) ?? '',
          shareChangeValueFormatted: formatCurrency(Math.abs(sharePriceDelta), { maximumFractionDigits: 0 }) ?? '',
          shareChangeCurrencyFormatted: formatCurrency(sharePriceDelta, { maximumFractionDigits: 0 }) ?? 'PKR 0',
          shareChangeValue: sharePriceDelta,
          shareChangePercent: sharePriceDeltaPercent,
          shareChangeLabel: formatPercent(sharePriceDeltaPercent || 0),
          uniqueInvestors,
          statusCategory: isComingSoon
            ? 'coming-soon'
            : soldPercent >= 95
              ? 'fully-funded'
              : soldPercent >= 60
                ? 'selling'
                : 'live',
          fundingPercent,
          fundingRaised,
          fundingTarget,
          availabilityPercent: availablePercent
        }
      }).filter(Boolean)

      let dataset = propertySummaries
      if (highlightedId) {
        dataset = [...dataset].sort((a, b) => {
          const aMatch = a.id?.toString() === highlightedId
          const bMatch = b.id?.toString() === highlightedId
          if (aMatch === bMatch) return 0
          return aMatch ? -1 : 1
        })
      }

      const totalPortfolioValue = dataset.reduce((sum, prop) => sum + (prop.currentValueNumeric || 0), 0)
      const totalDistributedShares = dataset.reduce((sum, prop) => sum + (prop.sharesDistributed || prop.sharesSold || 0), 0)
      const totalAvailableShares = dataset.reduce((sum, prop) => sum + (prop.sharesAvailableCount || Math.max((prop.totalShares || 0) - (prop.sharesDistributed || 0), 0)), 0)
      const uniqueInvestorsAcross = new Set(
        allInvestments.map((inv) => inv?.userId || inv?.userEmail || inv?.id)
      ).size
      const averageReturn = dataset.length
        ? dataset.reduce((sum, prop) => sum + (prop.shareChangePercent || 0), 0) / dataset.length
        : 0
      const averageSharePrice = dataset.length
        ? dataset.reduce((sum, prop) => sum + (prop.sharePrice || 0), 0) / dataset.length
        : 0
      const averageShareChangeValue = dataset.length
        ? dataset.reduce((sum, prop) => sum + (prop.shareChangeValue || 0), 0) / dataset.length
        : 0

      setInvestmentAnalytics({
        totalPortfolioValue,
        totalDistributedShares,
        totalAvailableShares,
        totalInvestors: uniqueInvestorsAcross,
        averageReturn,
        averageSharePrice,
        averageShareChangeValue,
        monthlyGrowth: generateMonthlyGrowthSeries(totalPortfolioValue, averageReturn),
        distributedSharesData: dataset.map((prop) => ({
          propertyName: prop.title,
          distributedShares: prop.sharesDistributed || 0,
          distributedPercent: Number.isFinite(prop.sharesDistributedPercent)
            ? Number(prop.sharesDistributedPercent.toFixed(2))
            : 0,
          totalShares: prop.totalShares,
          investors: prop.uniqueInvestors ?? prop.totalInvestors ?? 0
        })),
        topPerformingInvestments: [...dataset]
          .sort((a, b) => (b.shareChangePercent || 0) - (a.shareChangePercent || 0))
          .slice(0, 5)
          .map((prop) => ({
            name: prop.title,
            returnPercent: Number(prop.shareChangePercent || 0),
            growthPercent: Math.max(prop.shareChangePercent || 0, 0),
            value: prop.currentValueNumeric || 0
          }))
      })

      const normalizedDataset = dataset.filter(Boolean)
      setInvestmentShares(normalizedDataset)
      setFilteredInvestments(normalizedDataset)
    } catch (error) {
      console.warn('Failed to load investment shares:', error)
      setInvestmentShares([])
      setFilteredInvestments([])
      setInvestmentAnalytics((prev) => ({
        ...prev,
        totalPortfolioValue: 0,
        totalDistributedShares: 0,
        totalAvailableShares: 0,
        totalInvestors: 0,
        averageReturn: 0,
        averageSharePrice: 0,
        averageShareChangeValue: 0,
        monthlyGrowth: generateMonthlyGrowthSeries(0, 0),
        distributedSharesData: [],
        topPerformingInvestments: []
      }))
    } finally {
      setIsLoading(false)
    }
  }, [getAllProperties, getAllInvestments, highlightedId])

  useEffect(() => {
    const lowered = searchTerm.trim().toLowerCase()
    const locationFilter = selectedLocation.toLowerCase()
    const riskFilter = selectedRiskLevel.toLowerCase()

    const matches = investmentShares.filter((opportunity) => {
      const matchesSearch = !lowered
        || opportunity.title?.toLowerCase().includes(lowered)
        || opportunity.consortiumPartner?.toLowerCase().includes(lowered)
        || opportunity.developer?.toLowerCase().includes(lowered)
        || opportunity.partner?.toLowerCase().includes(lowered)

      const statusValue = opportunity.status?.toLowerCase() || ''
      const fundedPercent = Number.isFinite(opportunity.sharesDistributedPercent)
        ? opportunity.sharesDistributedPercent
        : Number.isFinite(opportunity.fundingPercent)
          ? opportunity.fundingPercent
          : 0
      const availabilityPercent = Number.isFinite(opportunity.sharesAvailablePercent)
        ? opportunity.sharesAvailablePercent
        : Number.isFinite(opportunity.availabilityPercent)
          ? opportunity.availabilityPercent
          : 100 - fundedPercent

      const isComingSoon = Boolean(opportunity.isComingSoon)
        || statusValue.includes('coming')
        || statusValue.includes('upcoming')

      const isFullyFunded = fundedPercent >= 95
        || availabilityPercent <= 5
        || statusValue.includes('closed')
        || statusValue.includes('fully')
      const isLive = !isComingSoon && !isFullyFunded && availabilityPercent > 0
      const isNew = Boolean(opportunity.isNew) || statusValue.includes('new')

      const matchesFilter = selectedFilter === 'all'
        || (selectedFilter === 'live' && isLive)
        || (selectedFilter === 'new' && isNew)
        || (selectedFilter === 'coming-soon' && isComingSoon)
        || (selectedFilter === 'fully-funded' && isFullyFunded)

      const matchesLocation = selectedLocation === 'all'
        || opportunity.location?.toLowerCase().includes(locationFilter)

      const matchesRisk = selectedRiskLevel === 'all'
        || opportunity.riskLevel?.toLowerCase() === riskFilter

      return matchesSearch && matchesFilter && matchesLocation && matchesRisk
    })

    const parseCurrency = (value) => {
      if (value == null) return 0
      if (typeof value === 'number') return value
      const cleaned = value.toString().replace(/[^0-9.]/g, '')
      return Number(cleaned || 0)
    }

    const sortedMatches = [...matches]

    switch (selectedSort) {
      case 'roi-desc':
        sortedMatches.sort((a, b) => (b.shareChangePercent || 0) - (a.shareChangePercent || 0))
        break
      case 'roi-asc':
        sortedMatches.sort((a, b) => (a.shareChangePercent || 0) - (b.shareChangePercent || 0))
        break
      case 'min-low':
        sortedMatches.sort((a, b) => parseCurrency(a.minInvestment) - parseCurrency(b.minInvestment))
        break
      case 'min-high':
        sortedMatches.sort((a, b) => parseCurrency(b.minInvestment) - parseCurrency(a.minInvestment))
        break
      case 'alphabetical':
        sortedMatches.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        sortedMatches.sort((a, b) => {
          if (a.isHighlighted && !b.isHighlighted) return -1
          if (!a.isHighlighted && b.isHighlighted) return 1
          return (b.shareChangePercent || 0) - (a.shareChangePercent || 0)
        })
        break
    }

    setFilteredInvestments(sortedMatches)
  }, [investmentShares, searchTerm, selectedFilter, selectedLocation, selectedRiskLevel, selectedSort])

  useEffect(() => {

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    const handleStorageChange = (event) => {
      if (event.key === 'userProperties' || event.key === 'userInvestments') {
        loadInvestments()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('propertyAdded', loadInvestments)


    loadInvestments()

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('propertyAdded', loadInvestments)
    }
  }, [loadInvestments])

  const totalPortfolioDisplay = formatCurrency(investmentAnalytics.totalPortfolioValue, { maximumFractionDigits: 0 }) || 'PKR 0'
  const totalInvestorsDisplay = (investmentAnalytics.totalInvestors || 0).toLocaleString()
  const averageReturnDisplay = formatPercent(investmentAnalytics.averageReturn || 0)
  const activeOpportunitiesCount = filteredInvestments.length
  const activeOpportunityLabel = activeOpportunitiesCount === 1 ? 'opportunity' : 'opportunities'
  const heroPrimaryLocation = filteredInvestments[0]?.location || availableLocations[0] || 'Multiple markets'
  const heroStats = [
    {
      label: 'Assets Under Management',
      value: totalPortfolioDisplay,
      hint: 'Across live REMMIC offerings'
    },
    {
      label: 'Avg. Projected Returns',
      value: averageReturnDisplay,
      hint: 'Modeled IRR from active deals'
    },
    {
      label: 'Verified Investors',
      value: totalInvestorsDisplay,
      hint: 'Active members on the platform'
    },
    {
      label: 'Average Ticket Size',
      value: formatCurrency(investmentAnalytics.averageSharePrice, { maximumFractionDigits: 0 }) || 'PKR 0',
      hint: 'Investor commitment per deal'
    }
  ]

  return (
    <>
      <Head>
        <title>REMMIC Land Investments</title>
        <meta name="description" content="Invest in premium properties through REMMIC's exclusive consortium partnerships." />
      </Head>
      
      <div
        className="page-wrapper"
        style={{ background: '#f9fafb', minHeight: '100vh' }}
      >
        <Navbar />
        
        <main className="pt-24 bg-gray-50">

          <section id="live-market" className="investment-market">
            <div className="investment-market__shell">
              <div className="investment-market__header">
                <div className="investment-market__intro">
                  <h2 className="investment-market__title">Live Investment Opportunities</h2>
                  <p className="investment-market__subtitle">
                    Invest in premium properties through REMMIC's exclusive consortium partnerships. We connect you with opportunities from trusted developers that you can't access alone.
                  </p>
                  <div className="investment-market__meta">
                    <span className="investment-market__meta-dot" aria-hidden="true" />
                    <span>{activeOpportunitiesCount} active {activeOpportunityLabel}</span>
                    <span className="investment-market__meta-divider" aria-hidden="true">&bull;</span>
                    <span>{heroPrimaryLocation}</span>
                  </div>
                  <div className="investment-market__hero-cta">
                    <a className="investment-market__hero-button" href="#live-market">Browse live deals</a>
                    <a className="investment-market__hero-link" href="mailto:invest@remmic.com">Talk to an advisor</a>
                  </div>
                </div>
                <div className="investment-market__stats">
                  {heroStats.map((stat) => (
                    <div key={stat.label} className="investment-market__stat">
                      <span className="investment-market__stat-label">{stat.label}</span>
                      <span className="investment-market__stat-value">{stat.value}</span>
                      <span className="investment-market__stat-hint">{stat.hint}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="investment-market__filters">
                <div className="investment-market__top-filters">
                  <div className="investment-market__search">
                    <label htmlFor="investment-market-search">Search opportunities</label>
                    <div className="investment-market__search-input">
                      <input
                        id="investment-market-search"
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search by project or company name"
                      />
                    </div>
                  </div>

                  <div className="investment-market__select-group">
                    <label htmlFor="investment-market-location">Location</label>
                    <select
                      id="investment-market-location"
                      value={selectedLocation}
                      onChange={(event) => setSelectedLocation(event.target.value)}
                    >
                      <option value="all">All locations</option>
                      {availableLocations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="investment-market__select-group">
                    <label htmlFor="investment-market-sort">Sort by</label>
                    <select
                      id="investment-market-sort"
                      value={selectedSort}
                      onChange={(event) => setSelectedSort(event.target.value)}
                    >
                      <option value="recommended">Recommended</option>
                      <option value="roi-desc">Highest ROI</option>
                      <option value="roi-asc">Lowest ROI</option>
                      <option value="min-low">Lowest min. investment</option>
                      <option value="min-high">Highest min. investment</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                  </div>
                </div>

                <div className="investment-market__chip-row">
                  {[{ key: 'all', label: 'All' }, { key: 'live', label: 'Live' }, { key: 'new', label: 'New' }, { key: 'coming-soon', label: 'Coming Soon' }, { key: 'fully-funded', label: 'Fully Funded' }].map((chip) => {
                    const isActive = selectedFilter === chip.key
                    return (
                      <button
                        key={chip.key}
                        type="button"
                        onClick={() => setSelectedFilter(chip.key)}
                        className={`investment-market__chip${isActive ? ' is-active' : ''}`}
                      >
                        {chip.label}
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  className="investment-market__reset"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedFilter('all')
                    setSelectedLocation('all')
                    setSelectedRiskLevel('all')
                    setSelectedSort('recommended')
                  }}
                >
                  Reset filters
                </button>
              </div>

              {/* Results Summary */}
              <div className="investment-market__results-summary">
                <span className="investment-market__results-count">
                  {filteredInvestments.length} {filteredInvestments.length === 1 ? 'opportunity' : 'opportunities'} found
                </span>
              </div>

              {/* Investment Cards Grid */}
              <div ref={scrollerRef} className="investment-market__scroller">
                <div className="investment-market__grid">
                  {filteredInvestments.map((share, index) => {
                    const cardKey = share.__duplicate ? share.__duplicateKey || `duplicate-${index}` : share.id || `share-${index}`
                    const shareId = share.originalId || share.id

                    const statusKey = (share.statusCategory || '').toLowerCase()
                    const normalizedStatus = (share.status || '').toLowerCase()
                    const statusVariant = statusKey === 'coming-soon'
                      ? 'coming'
                      : statusKey === 'fully-funded'
                        ? 'limited'
                        : normalizedStatus.includes('limited')
                          ? 'limited'
                          : normalizedStatus.includes('selling') || normalizedStatus.includes('fast')
                            ? 'selling'
                            : 'live'

                    const statusLabel = statusKey === 'coming-soon'
                      ? 'Coming Soon'
                      : statusKey === 'fully-funded'
                        ? 'Fully Funded'
                        : statusVariant === 'live'
                          ? 'Live'
                          : statusVariant === 'selling'
                            ? 'Selling Fast'
                            : share.status || 'Available'

                    const statusAccent = ({
                      live: '#16a34a',
                      selling: '#c9a227',
                      limited: '#dc2626',
                      coming: '#6366f1'
                    })[statusVariant] || '#16a34a'

                    const roiPercent = Math.round(share.shareChangePercent ?? 8.5)
                    const fundedPercentValue = Number.isFinite(share.sharesDistributedPercent)
                      ? share.sharesDistributedPercent
                      : Number.isFinite(share.fundingPercent)
                        ? share.fundingPercent
                        : 0
                    const investedPercent = Math.max(0, Math.min(100, Math.round(fundedPercentValue)))
                    const cardImage = share.image || ensurePropertyImage(share)
                    const riskLabel = share.riskLevel || 'Managed'

                    return (
                      <article
                        key={cardKey}
                        className={`investment-card${share.isHighlighted ? ' investment-card--featured' : ''}`}
                      >
                        {/* Card Image */}
                        <div className="investment-card__image">
                          <img src={cardImage} alt={share.title} loading="lazy" />
                          <span className="investment-card__status" style={{ background: statusAccent }}>
                            {statusLabel}
                          </span>
                        </div>

                        {/* Card Content */}
                        <div className="investment-card__content">
                          {/* Header */}
                          <div className="investment-card__header">
                            <h3 className="investment-card__title">{share.title}</h3>
                            <p className="investment-card__location">{share.location}</p>
                          </div>

                          {/* Key Metrics */}
                          <div className="investment-card__metrics">
                            <div className="investment-card__metric">
                              <span className="investment-card__metric-value">{roiPercent}%</span>
                              <span className="investment-card__metric-label">Target ROI</span>
                            </div>
                            <div className="investment-card__metric">
                              <span className="investment-card__metric-value">{share.minInvestment || 'PKR 3L'}</span>
                              <span className="investment-card__metric-label">Min. Investment</span>
                            </div>
                            <div className="investment-card__metric">
                              <span className="investment-card__metric-value">{riskLabel}</span>
                              <span className="investment-card__metric-label">Risk Level</span>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="investment-card__progress">
                            <div className="investment-card__progress-info">
                              <span>{investedPercent}% funded</span>
                            </div>
                            <div className="investment-card__progress-bar">
                              <div className="investment-card__progress-fill" style={{ width: `${investedPercent}%` }} />
                            </div>
                          </div>

                          {/* CTA */}
                          <a
                            href={`/investment-shares/${shareId}`}
                            className="investment-card__cta"
                            onClick={() => rememberOpportunity(share)}
                          >
                            View Details
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                          </a>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>

              {/* Load More / Pagination hint */}
              {filteredInvestments.length > 6 && (
                <div className="investment-market__pagination-hint">
                  <p>Showing all {filteredInvestments.length} opportunities</p>
                </div>
              )}
            </div>          <style jsx>{`
              .investment-market {
                position: relative;
                background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
                border-bottom: 1px solid rgba(15, 23, 42, 0.08);
                padding: clamp(72px, 8vw, 110px) 0;
              }

              .investment-market__shell {
                width: min(1600px, 95%);
                margin: 0 auto;
                padding: 0 clamp(24px, 4vw, 48px);
                display: flex;
                flex-direction: column;
                gap: clamp(40px, 6vw, 60px);
              }

              .investment-market__header {
                display: grid;
                grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
                gap: clamp(28px, 5vw, 48px);
                align-items: stretch;
              }

              .investment-market__intro {
                display: flex;
                flex-direction: column;
                gap: clamp(18px, 3vw, 24px);
              }

              .investment-market__eyebrow {
                align-self: flex-start;
                padding: 6px 16px;
                border-radius: 999px;
                background: rgba(201, 162, 39, 0.12);
                color: #c9a227;
                letter-spacing: 0.16em;
                font-size: 0.78rem;
                font-weight: 700;
                text-transform: uppercase;
              }

              .investment-market__title {
                margin: 0;
                font-size: clamp(2.4rem, 4.8vw, 3.1rem);
                font-weight: 800;
                color: #0f172a;
                line-height: 1.12;
                letter-spacing: -0.01em;
              }

              .investment-market__subtitle {
                margin: 0;
                font-size: 1.05rem;
                color: #475569;
                line-height: 1.7;
                max-width: 520px;
              }

              .investment-market__meta {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 0.95rem;
                color: #64748b;
              }

              .investment-market__meta-dot {
                width: 9px;
                height: 9px;
                border-radius: 999px;
                background: #16a34a;
              }

              .investment-market__meta-divider {
                color: rgba(100, 116, 139, 0.4);
              }

              .investment-market__hero-cta {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                align-items: center;
              }

              .investment-market__hero-button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0.85rem 1.8rem;
                border-radius: 14px;
                background: linear-gradient(135deg, #c9a227, #d4b13d);
                color: #0a0a0a;
                font-weight: 600;
                text-decoration: none;
                box-shadow: 0 18px 45px -24px rgba(201, 162, 39, 0.55);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
              }

              .investment-market__hero-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 26px 55px -24px rgba(201, 162, 39, 0.65);
              }

              .investment-market__hero-link {
                color: #c9a227;
                font-weight: 600;
                text-decoration: none;
                display: inline-flex;
                gap: 6px;
                align-items: center;
                transition: color 0.2s ease;
              }

              .investment-market__hero-link::after {
                content: '';
                font-size: 1rem;
              }

              .investment-market__hero-link:hover {
                color: #0f172a;
              }

              .investment-market__stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: clamp(16px, 4vw, 24px);
                width: 100%;
              }

              .investment-market__stat {
                background: #f9fafb;
                border-radius: 18px;
                padding: clamp(20px, 3.4vw, 28px);
                border: 1px solid rgba(226, 232, 240, 0.6);
                box-shadow: 0 18px 45px -32px rgba(15, 23, 42, 0.45);
                display: flex;
                flex-direction: column;
                gap: 8px;
                min-height: 170px;
              }

              .investment-market__stat-label {
                font-size: 0.74rem;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                color: #64748b;
                font-weight: 700;
                white-space: normal;
                overflow-wrap: anywhere;
              }

              .investment-market__stat-value {
                font-size: clamp(1.35rem, 2.4vw, 1.8rem);
                font-weight: 700;
                color: #0f172a;
                white-space: normal;
                word-break: break-word;
                overflow-wrap: anywhere;
                hyphens: auto;
              }

              .investment-market__stat-hint {
                font-size: 0.88rem;
                color: #64748b;
                line-height: 1.4;
                white-space: normal;
                overflow-wrap: anywhere;
              }

              .investment-market__filters {
                background: #f9fafb;
                border: 1px solid rgba(226, 232, 240, 0.6);
                border-radius: 24px;
                box-shadow: 0 20px 45px -32px rgba(15, 23, 42, 0.45);
                padding: clamp(24px, 4vw, 32px);
                display: flex;
                flex-direction: column;
                gap: clamp(18px, 4vw, 26px);
              }

              .investment-market__trust {
                display: grid;
                gap: clamp(14px, 3vw, 18px);
                margin-top: clamp(18px, 3vw, 22px);
                padding: clamp(20px, 3.5vw, 26px);
                border-radius: 20px;
                border: 1px solid rgba(226, 232, 240, 0.65);
                background: #f9fafb;
                box-shadow: 0 20px 45px -32px rgba(15, 23, 42, 0.38);
              }

              .investment-market__trust-intro {
                display: grid;
                gap: 6px;
              }

              .investment-market__trust-eyebrow {
                font-size: 0.74rem;
                font-weight: 700;
                letter-spacing: 0.14em;
                text-transform: uppercase;
                color: #c9a227;
              }

              .investment-market__trust-copy {
                margin: 0;
                font-size: 0.95rem;
                color: #475569;
                line-height: 1.55;
              }

              .investment-market__trust-badges {
                display: grid;
                gap: 12px;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                list-style: none;
                padding: 0;
                margin: 0;
              }

              .investment-market__trust-badges li {
                background: #f9fafb;
                border: 1px solid rgba(226, 232, 240, 0.6);
                border-radius: 14px;
                padding: 12px 16px;
                font-weight: 600;
                color: #0f172a;
                letter-spacing: 0.08em;
              }


              .investment-market__search {
                display: flex;
                flex-direction: column;
                gap: 10px;
              }

              .investment-market__top-filters {
                display: flex;
                gap: 16px;
                align-items: flex-end;
                margin-bottom: 20px;
              }

              .investment-market__top-filters .investment-market__search {
                flex: 2;
                min-width: 400px;
              }

              .investment-market__top-filters .investment-market__select-group {
                flex: 0 0 200px;
              }

              .investment-market__search label {
                font-size: 0.82rem;
                font-weight: 700;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                color: #0f172a;
              }

              .investment-market__search-input {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 0.5rem 1rem;
                border: 1px solid rgba(148, 163, 184, 0.35);
                border-radius: 12px;
                background: #f9fafb;
                transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
              }

              .investment-market__search-input:focus-within {
                border-color: rgba(37, 99, 235, 0.55);
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
                background: var(--neutral--white-200);
              }

              .investment-market__search-input input {
                flex: 1;
                border: none;
                background: transparent;
                font-size: 1rem;
                color: #0f172a;
              }

              .investment-market__chip-row {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: center;
              }

              .investment-market__chip {
                border-radius: 999px;
                padding: 0.6rem 1.6rem;
                border: 1px solid rgba(226, 232, 240, 0.8);
                background: #f9fafb;
                color: #0f172a;
                font-weight: 600;
                font-size: 0.95rem;
                cursor: pointer;
                transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
                box-shadow: 0 8px 18px -15px rgba(15, 23, 42, 0.6);
              }

              .investment-market__chip:hover {
                border-color: rgba(201, 162, 39, 0.6);
                color: #b8941f;
                background: rgba(253, 251, 235, 0.85);
              }

              .investment-market__chip.is-active {
                border-color: rgba(201, 162, 39, 0.75);
                background: linear-gradient(135deg, #c9a227, #d4b13d);
                color: #0a0a0a;
                box-shadow: 0 18px 35px -22px rgba(201, 162, 39, 0.7);
                transform: translateY(-1px);
              }

              .investment-market__select-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 18px;
                justify-content: center;
                align-items: flex-start;
              }

              .investment-market__select-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
                min-width: 220px;
                flex: 1 1 220px;
              }

              .investment-market__select-group label {
                font-size: 0.78rem;
                font-weight: 700;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                color: #475569;
              }

              .investment-market__select-group select {
                width: 100%;
                border: 1px solid rgba(148, 163, 184, 0.35);
                border-radius: 12px;
                padding: 0.8rem 0.9rem;
                font-size: 0.95rem;
                background: #f9fafb;
                color: #0f172a;
                transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
              }

              .investment-market__select-group select:focus {
                outline: none;
                border-color: rgba(37, 99, 235, 0.55);
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.16);
                background: var(--neutral--white-200);
              }

              .investment-market__reset {
                align-self: center;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: none;
                border: 1px solid rgba(201, 162, 39, 0.4);
                padding: 0.5rem 1.5rem;
                border-radius: 999px;
                font-weight: 600;
                font-size: 0.875rem;
                color: #c9a227;
                cursor: pointer;
                transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
                white-space: nowrap;
              }

              .investment-market__reset:hover {
                background: rgba(201, 162, 39, 0.12);
                color: #b8941f;
                border-color: rgba(201, 162, 39, 0.6);
                box-shadow: 0 10px 18px -14px rgba(201, 162, 39, 0.35);
              }

              .investment-market__reset:focus-visible {
                outline: none;
                background: rgba(201, 162, 39, 0.18);
                border-color: rgba(201, 162, 39, 0.65);
              }

              .investment-market__scroller {
                position: relative;
                padding: 0 0 clamp(18px, 3.5vw, 24px);
              }

              .investment-market__grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 28px;
              }

              .investment-market__results-summary {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 4px;
                margin-bottom: 8px;
              }

              .investment-market__results-count {
                font-size: 0.95rem;
                color: #64748b;
                font-weight: 500;
              }

              .investment-market__pagination-hint {
                text-align: center;
                padding: 24px 0 0;
                color: #94a3b8;
                font-size: 0.9rem;
              }

              /* ===== Investment Card Component ===== */
              .investment-card {
                background: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                border: 1px solid rgba(226, 232, 240, 0.8);
                display: flex;
                flex-direction: column;
                transition: transform 0.25s ease, box-shadow 0.25s ease;
                height: 100%;
                min-height: 420px;
              }

              .investment-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.15);
              }

              .investment-card--featured {
                border: 2px solid #c9a227;
                box-shadow: 0 0 0 4px rgba(201, 162, 39, 0.1);
              }

              .investment-card__image {
                position: relative;
                height: 180px;
                overflow: hidden;
              }

              .investment-card__image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.4s ease;
              }

              .investment-card:hover .investment-card__image img {
                transform: scale(1.05);
              }

              .investment-card__status {
                position: absolute;
                top: 14px;
                left: 14px;
                padding: 6px 14px;
                border-radius: 999px;
                font-size: 0.72rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: #ffffff;
              }

              .investment-card__content {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: 20px;
                flex: 1;
              }

              .investment-card__header {
                display: flex;
                flex-direction: column;
                gap: 4px;
              }

              .investment-card__title {
                margin: 0;
                font-size: 1.1rem;
                font-weight: 700;
                color: #0f172a;
                line-height: 1.3;
              }

              .investment-card__location {
                margin: 0;
                font-size: 0.85rem;
                color: #64748b;
                display: flex;
                align-items: center;
                gap: 4px;
              }

              .investment-card__metrics {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                padding: 14px;
                background: #f8fafc;
                border-radius: 12px;
                border: 1px solid rgba(226, 232, 240, 0.6);
              }

              .investment-card__metric {
                display: flex;
                flex-direction: column;
                gap: 2px;
                text-align: center;
              }

              .investment-card__metric-value {
                font-size: 1rem;
                font-weight: 700;
                color: #0f172a;
              }

              .investment-card__metric-label {
                font-size: 0.68rem;
                font-weight: 600;
                letter-spacing: 0.04em;
                text-transform: uppercase;
                color: #94a3b8;
              }

              .investment-card__progress {
                display: flex;
                flex-direction: column;
                gap: 8px;
              }

              .investment-card__progress-info {
                display: flex;
                justify-content: space-between;
                font-size: 0.85rem;
                color: #475569;
                font-weight: 500;
              }

              .investment-card__progress-bar {
                width: 100%;
                height: 6px;
                border-radius: 999px;
                background: rgba(201, 162, 39, 0.15);
                overflow: hidden;
              }

              .investment-card__progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #c9a227 0%, #d4b13d 100%);
                border-radius: 999px;
                transition: width 0.4s ease;
              }

              .investment-card__cta {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                margin-top: auto;
                padding: 12px 20px;
                border-radius: 10px;
                background: linear-gradient(135deg, #c9a227, #d4b13d);
                color: #0a0a0a;
                font-weight: 600;
                font-size: 0.95rem;
                text-decoration: none;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
              }

              .investment-card__cta:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 24px -8px rgba(201, 162, 39, 0.5);
              }

              .investment-card__cta svg {
                transition: transform 0.2s ease;
              }

              .investment-card__cta:hover svg {
                transform: translateX(3px);
              }

              @keyframes investmentCardReveal {
                from {
                  opacity: 0;
                  transform: translateY(14px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              .investment-market__card {
                background: #f9fafb;
                border-radius: 16px;
                overflow: hidden;
                border: 1px solid rgba(15, 23, 42, 0.08);
                box-shadow: none;
                display: flex;
                flex-direction: column;
                transition: transform 0.25s ease, box-shadow 0.25s ease;
                opacity: 0;
                transform: translateY(12px);
                animation: investmentCardReveal 0.6s ease forwards;
                will-change: transform;
                min-height: 320px;
              }

              .investment-market__card:nth-child(1) { animation-delay: 0.05s; }
              .investment-market__card:nth-child(2) { animation-delay: 0.1s; }
              .investment-market__card:nth-child(3) { animation-delay: 0.15s; }
              .investment-market__card:nth-child(4) { animation-delay: 0.2s; }
              .investment-market__card:nth-child(5) { animation-delay: 0.25s; }
              .investment-market__card:nth-child(6) { animation-delay: 0.3s; }

              .investment-market__card[data-highlighted="true"] {
                border: 2px solid rgba(201, 162, 39, 0.65);
                box-shadow: none;
              }

              .investment-market__media {
                position: relative;
                height: 320px;
                overflow: hidden;
                margin: 0 -1rem;
              }

              .investment-market__media img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.45s ease;
              }

              .investment-market__status {
                position: absolute;
                top: 18px;
                left: 18px;
                padding: 0.45rem 1.2rem;
                border-radius: 999px;
                font-size: 0.78rem;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                font-weight: 700;
                color: #ffffff;
              }

              .investment-market__roi {
                position: absolute;
                top: 18px;
                right: 18px;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 999px;
                background: rgba(15, 23, 42, 0.9);
                color: #f8fafc;
                text-transform: uppercase;
                letter-spacing: 0.12em;
                font-size: 0.7rem;
                font-weight: 700;
              }

              .investment-market__roi-value {
                font-size: 0.8rem;
                letter-spacing: 0.08em;
              }

              .investment-market__roi-label {
                font-size: 0.66rem;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                color: rgba(226, 232, 240, 0.78);
              }

              .investment-market__body {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: clamp(16px, 3vw, 24px);
              }

              .investment-market__heading {
                display: flex;
                flex-direction: column;
                gap: 10px;
              }

              .investment-market__tag {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 4px 12px;
                border-radius: 999px;
                font-size: 0.7rem;
                font-weight: 700;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                color: #c9a227;
                background: rgba(201, 162, 39, 0.12);
              }

              .investment-market__heading h3 {
                margin: 0;
                font-size: 1.18rem;
                line-height: 1.28;
                color: #0f172a;
              }

              .investment-market__location {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 0.82rem;
                font-weight: 600;
                color: #475569;
              }

              .investment-market__summary {
                margin: 0;
                font-size: 0.85rem;
                line-height: 1.5;
                color: #64748b;
              }

              .investment-market__metrics,
              .investment-market__details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 12px;
                padding: 14px 16px;
                border-radius: 14px;
                border: 1px solid rgba(203, 213, 225, 0.45);
                background: rgba(248, 250, 252, 0.9);
              }

              .investment-market__metric,
              .investment-market__details-item {
                display: flex;
                flex-direction: column;
                gap: 4px;
              }

              .investment-market__metric-label,
              .investment-market__details-label {
                font-size: 0.68rem;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                font-weight: 600;
                color: #94a3b8;
              }

              .investment-market__metric-value,
              .investment-market__details-value {
                font-size: 0.95rem;
                font-weight: 600;
                color: #0f172a;
              }

              .investment-market__insights {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
                gap: 10px;
                padding: 14px 16px;
                border-radius: 12px;
                background: rgba(248, 250, 252, 0.86);
                border: 1px dashed rgba(203, 213, 225, 0.6);
              }

              .investment-market__insight {
                display: grid;
                gap: 4px;
              }

              .investment-market__insight-label {
                font-size: 0.64rem;
                letter-spacing: 0.16em;
                text-transform: uppercase;
                color: #64748b;
                font-weight: 600;
              }

              .investment-market__insight-value {
                font-size: 0.9rem;
                font-weight: 700;
                color: #0f172a;
              }

              .investment-market__progress {
                display: flex;
                flex-direction: column;
                gap: 10px;
              }

              .investment-market__progress-header {
                display: flex;
                justify-content: space-between;
                font-size: 0.9rem;
                font-weight: 600;
                color: #475569;
              }

              .investment-market__progress-bar {
                position: relative;
                width: 100%;
                height: 8px;
                border-radius: 999px;
                background: rgba(201, 162, 39, 0.12);
                overflow: hidden;
              }

              .investment-market__progress-fill {
                position: absolute;
                inset: 0;
                background: linear-gradient(90deg, #c9a227 0%, #d4b13d 100%);
                border-radius: 999px;
                transition: width 0.4s ease;
              }

              .investment-market__actions {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;
                gap: 12px;
                margin-top: 6px;
              }

              .investment-market__actions > * {
                flex: 0 1 210px;
                max-width: 220px;
              }

              .cta-button-wrapper .button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                padding: 0.75rem 1.6rem;
                border-radius: 12px;
                font-weight: 600;
                text-decoration: none;
                letter-spacing: 0.01em;
              }

              .cta-button-wrapper .button-text {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 100%;
              }

              .investment-market__secondary,
              .investment-market__primary {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                padding: 0.75rem 1.6rem;
                border-radius: 12px;
                font-weight: 600;
                text-decoration: none;
                transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
              }

              .investment-market__secondary {
                border: 1px solid rgba(15, 23, 42, 0.12);
                color: #0f172a;
                background: rgba(15, 23, 42, 0.05);
              }

              .investment-market__secondary:hover {
                transform: translateY(-1px);
                background: rgba(201, 162, 39, 0.12);
                border-color: rgba(201, 162, 39, 0.55);
                color: #b8941f;
              }

              .investment-market__primary {
                background: linear-gradient(135deg, #c9a227, #d4b13d);
                color: #0a0a0a;
                box-shadow: 0 16px 35px -20px rgba(201, 162, 39, 0.75);
              }

              .investment-market__primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 20px 45px -20px rgba(201, 162, 39, 0.8);
              }

              .investment-market__support {
                margin-top: 10px;
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
              }

              .investment-market__support > * {
                flex: 0 1 auto;
                white-space: nowrap;
              }

              @media (min-width: 768px) {
                .investment-market__support {
                  flex-wrap: nowrap;
                }
              }

              .investment-market__document,
              .investment-market__share {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0.55rem 1.1rem;
                border-radius: 8px;
                font-weight: 600;
                border: 1px solid rgba(15, 23, 42, 0.12);
                background: #f9fafb;
                color: #0f172a;
                text-decoration: none;
                transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
              }

              .investment-market__document:hover,
              .investment-market__share:hover {
                transform: translateY(-1px);
                background: rgba(226, 232, 240, 0.9);
                box-shadow: 0 10px 25px -18px rgba(15, 23, 42, 0.4);
                color: #0f172a;
              }

              .investment-market__share {
                cursor: pointer;
              }

              @media (max-width: 1024px) {
                .investment-market__header {
                  grid-template-columns: 1fr;
                  gap: 32px;
                }

                .investment-market__stats {
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                }

                .investment-market__top-filters {
                  flex-direction: column;
                  align-items: stretch;
                  gap: 18px;
                }

                .investment-market__top-filters .investment-market__search,
                .investment-market__top-filters .investment-market__select-group {
                  flex: 1 1 100%;
                  min-width: 0;
                  width: 100%;
                }

                .investment-market__top-filters .investment-market__search input,
                .investment-market__top-filters select {
                  width: 100%;
                }

                .investment-market__grid {
                  grid-template-columns: repeat(2, 1fr);
                  gap: 24px;
                }

                .investment-card {
                  min-height: 400px;
                }
              }

              @media (max-width: 768px) {
                .investment-market__filters {
                  padding: 26px;
                }

                .investment-market__stats {
                  grid-template-columns: 1fr;
                }

                .investment-market__grid {
                  grid-template-columns: 1fr;
                  gap: 20px;
                }

                .investment-card {
                  min-height: auto;
                }

                .investment-card__image {
                  height: 200px;
                }

                .investment-card__metrics {
                  gap: 8px;
                  padding: 12px;
                }

                .investment-card__metric-value {
                  font-size: 0.95rem;
                }

                .investment-market__actions {
                  flex-direction: column;
                }

                .investment-market__actions > * {
                  max-width: 100%;
                }

                .investment-market__trust-badges {
                  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                }

                .investment-market__insights {
                  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                }
              }

              @media (max-width: 575px) {
                .investment-market__shell {
                  gap: 32px;
                  padding: 0 16px;
                }

                .investment-market__filters {
                  padding: 18px;
                  gap: 16px;
                  border-radius: 16px;
                }

                .investment-market__stats {
                  grid-template-columns: repeat(2, 1fr);
                  gap: 12px;
                }

                .investment-market__stat {
                  padding: 14px;
                  min-height: auto;
                  border-radius: 12px;
                }

                .investment-market__stat-value {
                  font-size: 1.1rem;
                }

                .investment-market__stat-label {
                  font-size: 0.65rem;
                }

                .investment-market__search-input {
                  padding: 0.65rem 0.9rem;
                }

                .investment-market__chip {
                  flex: 1 1 calc(50% - 6px);
                  text-align: center;
                  padding: 0.5rem 1rem;
                  font-size: 0.85rem;
                }

                .investment-market__select-group {
                  min-width: 100%;
                }

                .investment-market__reset {
                  width: 100%;
                  text-align: center;
                  padding: 0.55rem 1rem;
                  font-size: 0.9rem;
                }

                /* Card mobile styles */
                .investment-card__content {
                  padding: 16px;
                  gap: 14px;
                }

                .investment-card__title {
                  font-size: 1rem;
                }

                .investment-card__metrics {
                  grid-template-columns: repeat(3, 1fr);
                  gap: 6px;
                  padding: 10px;
                }

                .investment-card__metric-value {
                  font-size: 0.85rem;
                }

                .investment-card__metric-label {
                  font-size: 0.6rem;
                }

                .investment-card__cta {
                  padding: 10px 16px;
                  font-size: 0.9rem;
                }

                .investment-market__support {
                  flex-direction: column;
                }

                .investment-market__trust {
                  padding: 16px;
                  gap: 12px;
                }

                .investment-market__trust-badges {
                  grid-template-columns: repeat(2, 1fr);
                }

                .investment-market__insights {
                  grid-template-columns: repeat(2, 1fr);
                }
              }
            `}</style>
          </section>

          <section className="investment-how-it-works">
            <div className="investment-how-it-works__shell">
              <div className="investment-how-it-works__intro">
                <span className="investment-how-it-works__eyebrow">How REMMIC works</span>
                <h3>From discovery to distributions in three simple steps</h3>
                <p>Navigate a fully digital, compliance-ready investment experience tailored for serious property investors.</p>
              </div>
              <div className="investment-how-it-works__grid">
                <article className="investment-how-it-works__card">
                  <span className="investment-how-it-works__step">01</span>
                  <h4>Review the deal room</h4>
                  <p>Access property decks, sponsor track records, and underwriting models. Every asset is internally reviewed and third-party verified.</p>
                </article>
                <article className="investment-how-it-works__card">
                  <span className="investment-how-it-works__step">02</span>
                  <h4>Commit capital digitally</h4>
                  <p>Reserve your allocation, sign documents with e-sign, and fund through segregated escrow - no manual paperwork required.</p>
                </article>
                <article className="investment-how-it-works__card">
                  <span className="investment-how-it-works__step">03</span>
                  <h4>Track performance & payouts</h4>
                  <p>Monitor rental income, value appreciation, and quarterly statements directly from your REMMIC dashboard.</p>
                </article>
              </div>
            </div>
            <style jsx>{`
              .investment-how-it-works {
                padding: clamp(60px, 8vw, 90px) clamp(20px, 6vw, 60px);
                background: #f9fafb;
                color: #0f172a;
              }

              .investment-how-it-works__shell {
                width: min(1100px, 100%);
                margin: 0 auto;
                display: grid;
                gap: clamp(32px, 6vw, 40px);
              }

              .investment-how-it-works__intro {
                display: grid;
                gap: 12px;
                text-align: center;
              }

              .investment-how-it-works__eyebrow {
                font-size: 0.78rem;
                letter-spacing: 0.16em;
                text-transform: uppercase;
                color: #c9a227;
                font-weight: 700;
              }

              .investment-how-it-works__intro h3 {
                margin: 0;
                font-size: clamp(1.8rem, 4vw, 2.6rem);
                font-weight: 700;
                color: #0f172a;
              }

              .investment-how-it-works__intro p {
                margin: 0;
                font-size: 1rem;
                color: #475569;
              }

              .investment-how-it-works__grid {
                display: grid;
                gap: clamp(18px, 4vw, 24px);
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
              }

              .investment-how-it-works__card {
                background: #f9fafb;
                border: 1px solid rgba(203, 213, 225, 0.55);
                border-radius: 20px;
                padding: clamp(20px, 4vw, 28px);
                display: grid;
                gap: 12px;
                text-align: left;
                box-shadow: none;
              }

              .investment-how-it-works__step {
                font-size: 0.78rem;
                letter-spacing: 0.2em;
                text-transform: uppercase;
                color: rgba(249, 115, 22, 0.9);
                font-weight: 700;
              }

              .investment-how-it-works__card h4 {
                margin: 0;
                font-size: 1.2rem;
                font-weight: 600;
                color: #0f172a;
              }

              .investment-how-it-works__card p {
                margin: 0;
                font-size: 0.95rem;
                color: #475569;
                line-height: 1.6;
              }

              @media (max-width: 640px) {
                .investment-how-it-works__intro {
                  text-align: left;
                }
              }
            `}</style>
          </section>

          <section className="investment-insight">
            <div className="investment-insight__shell">
              <div className="investment-insight__column">
                <h3>Investor spotlight</h3>
                <blockquote>
                  "REMMIC's digital workflows cut our investment time in half. Escrow updates, sponsor calls, and documents are all in one place."
                </blockquote>
                <cite>Fatima H., Karachi-based investor</cite>
              </div>
              <div className="investment-insight__column">
                <h4>Need a quick answer?</h4>
                <ul>
                  <li><a href="#">How funding and escrow works</a></li>
                  <li><a href="#">Liquidity options & secondary market</a></li>
                  <li><a href="#">Sponsor due diligence process</a></li>
                  <li><a href="#">Tax statements & reporting</a></li>
                </ul>
                <a className="investment-insight__cta" href="mailto:invest@remmic.com">Email our investment desk</a>
              </div>
              <div className="investment-insight__column">
                <h4>Upcoming milestones</h4>
                <div className="investment-insight__timeline">
                  <div>
                    <strong>March 28</strong>
                    <span>New Islamabad rental pool closes</span>
                  </div>
                  <div>
                    <strong>April 04</strong>
                    <span>Virtual sponsor Q&A session</span>
                  </div>
                  <div>
                    <strong>April 18</strong>
                    <span>Dividend distribution window</span>
                  </div>
                </div>
              </div>
            </div>
            <style jsx>{`
              .investment-insight {
                padding: clamp(60px, 7vw, 90px) clamp(20px, 6vw, 60px);
                background: #f9fafb;
              }

              .investment-insight__shell {
                width: min(1100px, 100%);
                margin: 0 auto;
                display: grid;
                gap: clamp(24px, 6vw, 32px);
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
              }

              .investment-insight__column {
                background: #f9fafb;
                border-radius: 20px;
                border: 1px solid rgba(226, 232, 240, 0.6);
                box-shadow: none;
                padding: clamp(20px, 4vw, 28px);
                display: grid;
                gap: 16px;
              }

              blockquote {
                margin: 0;
                font-size: 1.05rem;
                color: #0f172a;
                line-height: 1.6;
              }

              cite {
                font-size: 0.9rem;
                color: #475569;
              }

              .investment-insight__column ul {
                list-style: none;
                padding: 0;
                margin: 0;
                display: grid;
                gap: 10px;
              }

              .investment-insight__column a {
                color: #0f172a;
                text-decoration: none;
                font-weight: 600;
              }

              .investment-insight__cta {
                display: inline-flex;
                align-items: center;
                gap: 6px;
              }

              .investment-insight__cta::after {
                content: '';
              }

              .investment-insight__timeline {
                display: grid;
                gap: 12px;
              }

              .investment-insight__timeline strong {
                display: block;
                font-weight: 700;
                color: #0f172a;
              }

              .investment-insight__timeline span {
                color: #475569;
                font-size: 0.92rem;
              }
            `}</style>
          </section>


          {/* Why REMMIC Section */}          {/* Why REMMIC Section */}
          

          {/* CTA Section */}
          <section className="cta-section">
            <div className="cta-section__container">
              <div className="cta-section__content">
                <span className="cta-section__eyebrow">Start Investing Today</span>
                <h2 className="cta-section__title">Ready to Build Your Real Estate Portfolio?</h2>
                <p className="cta-section__description">
                  Join thousands of investors who are already earning passive income through REMMIC's
                  professionally managed property investments.
                </p>
                <div className="cta-section__buttons">
                  <a href="/signup" className="cta-section__button cta-section__button--primary">
                    Create Free Account
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                  <a href="/contact" className="cta-section__button cta-section__button--secondary">
                    Talk to Advisor
                  </a>
                </div>
              </div>
              <div className="cta-section__visual">
                <div className="cta-section__image-wrapper">
                  <img
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80"
                    alt="REMMIC Investment Platform"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <style jsx>{`
              .cta-section {
                padding: clamp(60px, 8vw, 100px) clamp(20px, 4vw, 48px);
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                position: relative;
                overflow: hidden;
              }

              .cta-section::before {
                content: '';
                position: absolute;
                top: -50%;
                right: -20%;
                width: 60%;
                height: 200%;
                background: radial-gradient(ellipse, rgba(201, 162, 39, 0.08) 0%, transparent 70%);
                pointer-events: none;
              }

              .cta-section__container {
                max-width: 1200px;
                margin: 0 auto;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: clamp(40px, 6vw, 80px);
                align-items: center;
                position: relative;
                z-index: 1;
              }

              .cta-section__content {
                display: flex;
                flex-direction: column;
                gap: 24px;
              }

              .cta-section__eyebrow {
                display: inline-block;
                align-self: flex-start;
                padding: 6px 16px;
                border-radius: 999px;
                background: rgba(201, 162, 39, 0.12);
                color: #c9a227;
                font-size: 0.78rem;
                font-weight: 700;
                letter-spacing: 0.12em;
                text-transform: uppercase;
              }

              .cta-section__title {
                margin: 0;
                font-size: clamp(2rem, 4vw, 2.8rem);
                font-weight: 700;
                color: #0f172a;
                line-height: 1.2;
              }

              .cta-section__description {
                margin: 0;
                font-size: 1.1rem;
                color: #475569;
                line-height: 1.7;
                max-width: 480px;
              }

              .cta-section__stats {
                display: flex;
                gap: 32px;
                padding: 24px 0;
                border-top: 1px solid rgba(15, 23, 42, 0.08);
                border-bottom: 1px solid rgba(15, 23, 42, 0.08);
              }

              .cta-section__stat {
                display: flex;
                flex-direction: column;
                gap: 4px;
              }

              .cta-section__stat-value {
                font-size: 1.5rem;
                font-weight: 700;
                color: #0f172a;
              }

              .cta-section__stat-label {
                font-size: 0.82rem;
                color: #64748b;
                font-weight: 500;
              }

              .cta-section__buttons {
                display: flex;
                gap: 16px;
                flex-wrap: wrap;
                margin-top: 8px;
              }

              .cta-section__button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 14px 28px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 1rem;
                text-decoration: none;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
              }

              .cta-section__button--primary {
                background: linear-gradient(135deg, #c9a227, #d4b13d);
                color: #0a0a0a;
                box-shadow: 0 12px 28px -8px rgba(201, 162, 39, 0.4);
              }

              .cta-section__button--primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 18px 36px -8px rgba(201, 162, 39, 0.5);
              }

              .cta-section__button--primary svg {
                transition: transform 0.2s ease;
              }

              .cta-section__button--primary:hover svg {
                transform: translateX(4px);
              }

              .cta-section__button--secondary {
                background: #0f172a;
                color: #ffffff;
              }

              .cta-section__button--secondary:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 28px -8px rgba(15, 23, 42, 0.3);
              }

              .cta-section__visual {
                display: flex;
                justify-content: center;
                align-items: center;
              }

              .cta-section__image-wrapper {
                position: relative;
                width: 100%;
                max-width: 500px;
                border-radius: 24px;
                overflow: hidden;
                box-shadow: 0 32px 64px -16px rgba(15, 23, 42, 0.2);
              }

              .cta-section__image-wrapper::before {
                content: '';
                position: absolute;
                inset: 0;
                border: 2px solid rgba(201, 162, 39, 0.2);
                border-radius: 24px;
                pointer-events: none;
                z-index: 1;
              }

              .cta-section__image-wrapper img {
                width: 100%;
                height: auto;
                display: block;
              }

              @media (max-width: 1024px) {
                .cta-section__container {
                  grid-template-columns: 1fr;
                  text-align: center;
                }

                .cta-section__content {
                  align-items: center;
                }

                .cta-section__description {
                  max-width: 600px;
                }

                .cta-section__stats {
                  justify-content: center;
                }

                .cta-section__buttons {
                  justify-content: center;
                }

                .cta-section__visual {
                  order: -1;
                }

                .cta-section__image-wrapper {
                  max-width: 400px;
                }
              }

              @media (max-width: 640px) {
                .cta-section__stats {
                  flex-direction: column;
                  gap: 16px;
                  align-items: center;
                }

                .cta-section__stat {
                  align-items: center;
                }

                .cta-section__buttons {
                  flex-direction: column;
                  width: 100%;
                }

                .cta-section__button {
                  width: 100%;
                }

                .cta-section__image-wrapper {
                  max-width: 320px;
                }
              }
            `}</style>
          </section>

          {/* Testimonial Section */}
          <section className="testimonials">
            <div className="testimonials__container">
              <div className="testimonials__header">
                <span className="testimonials__eyebrow">Testimonials</span>
                <h2 className="testimonials__title">Trusted by Investors Across Pakistan</h2>
                <p className="testimonials__subtitle">
                  Hear from real estate investors who have transformed their portfolios with REMMIC
                </p>
              </div>

              <div className="testimonials__grid">
                {/* Testimonial 1 */}
                <article className="testimonial-card">
                  <div className="testimonial-card__stars">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#c9a227">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <blockquote className="testimonial-card__quote">
                    "REMMIC has completely transformed how I invest in real estate. The transparency, professional management, and consistent returns have exceeded my expectations. I've already recommended it to my entire network."
                  </blockquote>
                  <div className="testimonial-card__author">
                    <div className="testimonial-card__avatar">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face&auto=format&q=80" alt="Ahmed Khan" />
                    </div>
                    <div className="testimonial-card__info">
                      <span className="testimonial-card__name">Ahmed Khan</span>
                      <span className="testimonial-card__role">Real Estate Investor, Lahore</span>
                    </div>
                  </div>
                </article>

                {/* Testimonial 2 */}
                <article className="testimonial-card testimonial-card--featured">
                  <div className="testimonial-card__badge">Featured</div>
                  <div className="testimonial-card__stars">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#c9a227">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <blockquote className="testimonial-card__quote">
                    "As a first-time real estate investor, I was hesitant. REMMIC made the process incredibly smooth. From documentation to returns tracking, everything is handled professionally. My investment has grown 18% in just one year."
                  </blockquote>
                  <div className="testimonial-card__author">
                    <div className="testimonial-card__avatar">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face&auto=format&q=80" alt="Fatima Malik" />
                    </div>
                    <div className="testimonial-card__info">
                      <span className="testimonial-card__name">Fatima Malik</span>
                      <span className="testimonial-card__role">Portfolio Manager, Karachi</span>
                    </div>
                  </div>
                </article>

                {/* Testimonial 3 */}
                <article className="testimonial-card">
                  <div className="testimonial-card__stars">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#c9a227">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <blockquote className="testimonial-card__quote">
                    "The consortium model is brilliant. I can invest in premium properties that would otherwise be out of reach. The quarterly reports and dividend distributions are always on time. Highly professional team."
                  </blockquote>
                  <div className="testimonial-card__author">
                    <div className="testimonial-card__avatar">
                      <span className="testimonial-card__avatar-initials">UR</span>
                    </div>
                    <div className="testimonial-card__info">
                      <span className="testimonial-card__name">Usman Raza</span>
                      <span className="testimonial-card__role">Business Owner, Islamabad</span>
                    </div>
                  </div>
                </article>
              </div>

              <div className="testimonials__cta">
                <a href="/contact" className="testimonials__button">
                  Start Your Investment Journey
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </div>

            <style jsx>{`
              .testimonials {
                padding: clamp(60px, 8vw, 100px) clamp(20px, 4vw, 48px);
                background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
              }

              .testimonials__container {
                max-width: 1200px;
                margin: 0 auto;
              }

              .testimonials__header {
                text-align: center;
                margin-bottom: clamp(40px, 6vw, 60px);
              }

              .testimonials__eyebrow {
                display: inline-block;
                padding: 6px 16px;
                border-radius: 999px;
                background: rgba(201, 162, 39, 0.15);
                color: #c9a227;
                font-size: 0.78rem;
                font-weight: 700;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                margin-bottom: 16px;
              }

              .testimonials__title {
                margin: 0 0 16px;
                font-size: clamp(1.8rem, 4vw, 2.8rem);
                font-weight: 700;
                color: #ffffff;
                line-height: 1.2;
              }

              .testimonials__subtitle {
                margin: 0;
                font-size: 1.05rem;
                color: rgba(255, 255, 255, 0.6);
                max-width: 600px;
                margin: 0 auto;
              }

              .testimonials__grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 24px;
                margin-bottom: 48px;
              }

              .testimonial-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 20px;
                padding: clamp(24px, 4vw, 32px);
                display: flex;
                flex-direction: column;
                gap: 20px;
                transition: transform 0.3s ease, border-color 0.3s ease;
                position: relative;
              }

              .testimonial-card:hover {
                transform: translateY(-4px);
                border-color: rgba(201, 162, 39, 0.3);
              }

              .testimonial-card--featured {
                background: linear-gradient(135deg, rgba(201, 162, 39, 0.08) 0%, rgba(201, 162, 39, 0.02) 100%);
                border-color: rgba(201, 162, 39, 0.25);
              }

              .testimonial-card__badge {
                position: absolute;
                top: -1px;
                right: 24px;
                background: linear-gradient(135deg, #c9a227, #d4b13d);
                color: #0a0a0a;
                padding: 6px 14px;
                border-radius: 0 0 8px 8px;
                font-size: 0.72rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
              }

              .testimonial-card__stars {
                display: flex;
                gap: 4px;
              }

              .testimonial-card__quote {
                margin: 0;
                font-size: 1rem;
                line-height: 1.7;
                color: rgba(255, 255, 255, 0.85);
                font-style: normal;
                flex: 1;
              }

              .testimonial-card__author {
                display: flex;
                align-items: center;
                gap: 14px;
                padding-top: 16px;
                border-top: 1px solid rgba(255, 255, 255, 0.08);
              }

              .testimonial-card__avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                overflow: hidden;
                background: linear-gradient(135deg, #c9a227, #d4b13d);
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              }

              .testimonial-card__avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }

              .testimonial-card__avatar-initials {
                font-size: 1rem;
                font-weight: 700;
                color: #0a0a0a;
              }

              .testimonial-card__info {
                display: flex;
                flex-direction: column;
                gap: 2px;
              }

              .testimonial-card__name {
                font-size: 0.95rem;
                font-weight: 600;
                color: #ffffff;
              }

              .testimonial-card__role {
                font-size: 0.82rem;
                color: rgba(255, 255, 255, 0.5);
              }

              .testimonials__cta {
                text-align: center;
              }

              .testimonials__button {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                padding: 14px 28px;
                border-radius: 12px;
                background: linear-gradient(135deg, #c9a227, #d4b13d);
                color: #0a0a0a;
                font-weight: 600;
                font-size: 1rem;
                text-decoration: none;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
              }

              .testimonials__button:hover {
                transform: translateY(-2px);
                box-shadow: 0 16px 32px -8px rgba(201, 162, 39, 0.4);
              }

              .testimonials__button svg {
                transition: transform 0.2s ease;
              }

              .testimonials__button:hover svg {
                transform: translateX(4px);
              }

              @media (max-width: 1024px) {
                .testimonials__grid {
                  grid-template-columns: repeat(2, 1fr);
                }

                .testimonial-card:last-child {
                  grid-column: 1 / -1;
                  max-width: 500px;
                  margin: 0 auto;
                }
              }

              @media (max-width: 640px) {
                .testimonials__grid {
                  grid-template-columns: 1fr;
                }

                .testimonial-card:last-child {
                  max-width: 100%;
                }

                .testimonial-card {
                  padding: 20px;
                }

                .testimonial-card__quote {
                  font-size: 0.95rem;
                }
              }
            `}</style>
          </section>

        </main>

        {/* Secondary Market Section */}
        <section style={{ background: '#f9fafb', padding: '60px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                Secondary Market
              </h2>
              <p style={{ fontSize: '18px', color: '#6b7280', margin: 0 }}>
                Trade shares with other investors in our secure secondary marketplace
              </p>
            </div>
            {filteredInvestments.length > 0 && (
              <div className="secondary-market-wrapper">
              <SecondaryMarket 
                propertyId={investmentShares[0]?.id || 'demo-property'}
                propertyTitle={investmentShares[0]?.title || 'Model Town Residency'}
                currentSharePrice={investmentShares[0]?.sharePrice || 50000}
              />
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  )
}































































