import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import PropertyMap from '../components/PropertyMap'
import { geocodeAddress } from '../utils/geocode'
import { addBid, getBidsForProperty, addBiddingPayment, getUserBiddingPayments } from '../lib/firebase'

export default function BiddingDetail() {
  const router = useRouter()
  const { id } = router.query
  const [isClient, setIsClient] = useState(false)
  const [property, setProperty] = useState(null)
  const [currentBid, setCurrentBid] = useState('')
  const [bidAmount, setBidAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bidMessage, setBidMessage] = useState('')
  
  // Enhanced bidding system state
  const [userHasPaidFee, setUserHasPaidFee] = useState(false)
  const [canPlaceBid, setCanPlaceBid] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false) // Permanently disabled
  const [paymentData, setPaymentData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cnic: '',
    paymentMethod: 'bank',
    senderAccount: '',
    transactionReference: '',
    paymentNotes: '',
    paymentSlip: null,
    paymentSlipName: ''
  })
  const [auctionTimer, setAuctionTimer] = useState(null)
  const [auctionStatus, setAuctionStatus] = useState('active') // active, ended, pending
  const [bidHistory, setBidHistory] = useState([])
  const [auctionEnded, setAuctionEnded] = useState(false)
  const [winner, setWinner] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  
  // Enhanced Auto-Bid System State
  const [userAutoBidEnabled, setUserAutoBidEnabled] = useState(false)
  const [userAutoBidMax, setUserAutoBidMax] = useState('')
  const autoBidTrackerRef = useRef(null)
  const [showFullPaymentModal, setShowFullPaymentModal] = useState(false)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [propertyOwned, setPropertyOwned] = useState(false)
  const [adminApprovalPending, setAdminApprovalPending] = useState(false)
  const [feeStatus, setFeeStatus] = useState('required')
  const [isCheckingFeeStatus, setIsCheckingFeeStatus] = useState(false)
  const [countdownDisplay, setCountdownDisplay] = useState('Calculating...')

  const getActiveUserId = () => {
    if (currentUser?.id || currentUser?.uid || currentUser?.userId) {
      return currentUser.id || currentUser.uid || currentUser.userId
    }

    if (typeof window === 'undefined') {
      return null
    }

    try {
      const stored = window.localStorage.getItem('userData')
      if (!stored) {
        return null
      }
      const parsed = JSON.parse(stored)
      return parsed.id || parsed.uid || parsed.userId || parsed.userID || null
    } catch (error) {
      console.warn('Failed to resolve active user for bidding fee status:', error)
      return null
    }
  }

  const fetchLatestBiddingFeeStatus = async (propertyKey, userId) => {
    if (!propertyKey || !userId) {
      return { status: 'required', message: '' }
    }

    const normalizedPropertyId = propertyKey.toString()

    let payments = []
    try {
      const result = await getUserBiddingPayments(userId)
      if (result?.success && Array.isArray(result.payments)) {
        payments = result.payments.slice()
      }
    } catch (error) {
      console.warn('Failed to load bidding fee payments from Firestore:', error)
    }

    if (typeof window !== 'undefined') {
      try {
        const localPayments = JSON.parse(window.localStorage.getItem('biddingFeePayments') || '[]')
        if (Array.isArray(localPayments) && localPayments.length > 0) {
          payments = payments.concat(localPayments)
        }
      } catch (error) {
        console.warn('Failed to read local bidding fee payments:', error)
      }
    }

    const relevantPayments = payments
      .filter((payment) => payment?.propertyId != null && payment.propertyId.toString() === normalizedPropertyId)

    if (relevantPayments.length === 0) {
      return { status: 'required', message: '' }
    }

    relevantPayments.sort((a, b) => {
      const aDate = new Date(a.approvedAt || a.paidAt || a.createdAt || 0).getTime()
      const bDate = new Date(b.approvedAt || b.paidAt || b.createdAt || 0).getTime()
      return bDate - aDate
    })

    const latestPayment = relevantPayments[0]
    const normalizedStatus = (latestPayment.status || 'pending').toLowerCase()

    if (normalizedStatus === 'approved') {
      return {
        status: 'approved',
        message: 'Admin approved your bidding fee. You can now place bids.'
      }
    }

    if (normalizedStatus === 'rejected') {
      return {
        status: 'rejected',
        message: 'Admin rejected your bidding fee. Please submit the form again.'
      }
    }

    return {
      status: 'pending',
      message: 'Payment submitted. Waiting for admin approval.'
    }
  }

  const describeFeeStatus = (status, feeAmount) => {
    if (status === 'approved') {
      return 'Admin approved your bidding fee. You can place bids now.'
    }
    if (status === 'pending') {
      return 'Payment submitted. Waiting for admin approval. Please contact an admin if you need it expedited.'
    }
    if (status === 'rejected') {
      return 'Payment rejected. Please submit the fee again.'
    }
    if (feeAmount) {
      return 'PKR ' + feeAmount.toLocaleString() + ' required to bid'
    }
    return 'Bidding fee required to place a bid'
  }


  const parseRupeesInput = (input) => {
    if (!input) return 0
    const numeric = parseFloat(String(input).replace(/,/g, ''))
    return Number.isNaN(numeric) ? 0 : numeric
  }

  const formatRupeeValue = (value) => {
    if (!value || isNaN(value)) return 'PKR 0'
    return `PKR ${parseFloat(value).toLocaleString()}`
  }

  const PAYMENT_WINDOW_HOURS = 24
  const PENALTY_PERCENTAGE = 0.02

  const normalizeBidAmount = (value) => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/,/g, ''))
      return Number.isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  const hoursToMilliseconds = (hours) => (Number.isFinite(hours) ? hours * 60 * 60 * 1000 : 0)

  const formatCountdownLabel = (deadline) => {
    if (!deadline) {
      return ''
    }
    const target = new Date(deadline).getTime()
    if (Number.isNaN(target)) {
      return ''
    }
    const diff = target - Date.now()
    if (diff <= 0) {
      return '00:00:00'
    }
    const totalSeconds = Math.floor(diff / 1000)
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
    const seconds = String(totalSeconds % 60).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  const derivePenaltyAmount = (amount) => {
    const numeric = normalizeBidAmount(amount)
    return Number.isFinite(numeric) ? numeric * PENALTY_PERCENTAGE : 0
  }

  const derivePaymentWindowHours = (property) => {
    const biddingConfig = property?.bidding || property?.biddingFormData || {}
    if (typeof biddingConfig.paymentWindowHours === 'number' && biddingConfig.paymentWindowHours > 0) {
      return biddingConfig.paymentWindowHours
    }
    return PAYMENT_WINDOW_HOURS
  }

  const buildSettlementQueue = (bids = []) => (
    bids
      .map((bid, index) => ({
        bidId: bid.id || bid.bidId || `bid_${index + 1}`,
        bidderId: bid.bidderId || bid.userId || bid.userID || 'anonymous',
        bidderName: bid.bidder || bid.bidderName || bid.userEmail || 'Unknown bidder',
        bidderEmail: bid.userEmail || '',
        amount: normalizeBidAmount(bid.amount),
        placedAt: bid.timestamp instanceof Date ? bid.timestamp.toISOString() : (bid.placedAt || bid.createdAt || new Date().toISOString()),
        status: bid.status || 'queued',
      }))
      .filter((entry) => entry.amount > 0)
      .sort((a, b) => {
        if (b.amount !== a.amount) {
          return b.amount - a.amount
        }
        return new Date(a.placedAt) - new Date(b.placedAt)
      })
  )

  const buildInitialSettlement = (property, rankedBids = []) => {
    const nowIso = new Date().toISOString()
    const paymentWindowHours = derivePaymentWindowHours(property)
    if (!rankedBids.length) {
      return {
        status: 'no_bids',
        paymentWindowHours,
        penaltyAmount: 0,
        currentWinner: null,
        queue: [],
        forfeited: [],
        history: [],
        createdAt: nowIso,
        lastUpdated: nowIso,
      }
    }
    const [first, ...rest] = rankedBids
    const deadline = new Date(Date.now() + hoursToMilliseconds(paymentWindowHours)).toISOString()
    return {
      status: 'awaiting_payment',
      paymentWindowHours,
      penaltyAmount: derivePenaltyAmount(first.amount),
      currentWinner: {
        ...first,
        status: 'pending_payment',
        assignedAt: nowIso,
        deadline,
      },
      queue: rest.map((entry) => ({ ...entry, status: 'queued' })),
      forfeited: [],
      history: [],
      createdAt: nowIso,
      lastUpdated: nowIso,
    }
  }

  const handlePaymentSlipUpload = async (file) => {
    if (!file) {
      setPaymentData((prev) => ({ ...prev, paymentSlip: null, paymentSlipName: '' }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Slip size should be less than 5MB. Please upload a smaller file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result
      setPaymentData((prev) => ({
        ...prev,
        paymentSlip: base64,
        paymentSlipName: file.name
      }))
    }
    reader.readAsDataURL(file)
  }

  // Function to check if a property can be bid on based on auction timing
  const canBidOnProperty = (property) => {
    if (!property?.bidding && !property?.biddingFormData) {
      // If no bidding dates, check if auction has ended manually
      return !auctionEnded
    }

    // Check bidding dates from land registration form data
    const biddingData = property.bidding || property.biddingFormData
    if (!biddingData?.startDateTime || !biddingData?.endDateTime) {
      // If no specific dates, rely on auction status
      return !auctionEnded && auctionStatus === 'active'
    }

    const now = new Date()
    const startDate = new Date(biddingData.startDateTime)
    const endDate = new Date(biddingData.endDateTime)

    // Can only bid if current time is between start and end dates
    return now >= startDate && now <= endDate && !auctionEnded
  }

  // Function to get auction status message
  const getAuctionStatusMessage = (property) => {
    if (auctionEnded) {
      return { status: 'ended', message: 'This auction has ended. No more bids are accepted.' }
    }

    const biddingData = property?.bidding || property?.biddingFormData
    if (!biddingData?.startDateTime || !biddingData?.endDateTime) {
      return { status: 'active', message: '' }
    }

    const now = new Date()
    const startDate = new Date(biddingData.startDateTime)
    const endDate = new Date(biddingData.endDateTime)

    if (now < startDate) {
      const timeUntilStart = startDate - now
      const days = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      
      let timeLeft = ''
      if (days > 0) {
        timeLeft = `Auction starts in ${days} day${days > 1 ? 's' : ''}`
      } else if (hours > 0) {
        timeLeft = `Auction starts in ${hours} hour${hours > 1 ? 's' : ''}`
      } else {
        timeLeft = 'Auction starting soon'
      }
      
      return { status: 'upcoming', message: `${timeLeft}. Bidding is not yet available.` }
    } else if (now > endDate) {
      return { status: 'ended', message: 'This auction has ended. No more bids are accepted.' }
    } else {
      return { status: 'active', message: '' }
    }
  }
  
  // Admin Configuration State
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false) // Check real admin status
  const [adminConfig, setAdminConfig] = useState({
    autoBidEnabled: true,
    autoBidMaxLimit: 35000000,
    autoBidIncrement: 300000,
    reservePrice: 30000000,
    maxBidLimit: 1000000000,
    minBidIncrement: 500000
  })


  useEffect(() => {
    setIsClient(true)
    if (id) {
      loadPropertyDetails(id)
    }
  }, [id])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      const storedUser = window.localStorage.getItem('userData')
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.warn('Failed to load current user information:', error)
    }
  }, [])

  useEffect(() => {
    if (!isClient) {
      return
    }

    const rawPropertyKey = property?.id || (typeof id === 'string' ? id : Array.isArray(id) ? id[0] : null)
    const userId = getActiveUserId()

    if (!rawPropertyKey || !userId) {
      setFeeStatus('required')
      setUserHasPaidFee(false)
      setCanPlaceBid(false)
      return
    }

    let isActive = true

    const run = async () => {
      setIsCheckingFeeStatus(true)
      try {
        const statusResult = await fetchLatestBiddingFeeStatus(rawPropertyKey, userId)
        if (!isActive) {
          return
        }
        setFeeStatus(statusResult.status)
        const approved = statusResult.status === 'approved'
        setUserHasPaidFee(approved)
        setCanPlaceBid(approved)
        if (statusResult.status === 'rejected') {
          setBidMessage('Admin rejected your previous bidding fee submission. Please submit the fee again.')
        }
      } finally {
        if (isActive) {
          setIsCheckingFeeStatus(false)
        }
      }
    }

    run()

    const handlePaymentsRefresh = () => {
      run()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handlePaymentsRefresh)
      window.addEventListener('biddingFeePaymentsUpdated', handlePaymentsRefresh)
    }

    return () => {
      isActive = false
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handlePaymentsRefresh)
        window.removeEventListener('biddingFeePaymentsUpdated', handlePaymentsRefresh)
      }
    }
  }, [isClient, property?.id, id, currentUser])


  // Check for auction end and determine winner
  useEffect(() => {
    if (!property) return

    const checkAuctionEnd = () => {
      const now = new Date()
      const endTime = new Date(property.biddingFormData?.endDateTime || Date.now() + 24 * 60 * 60 * 1000)
      
      if (now >= endTime && !auctionEnded) {
        setAuctionEnded(true)
        
        // Determine winner - highest bidder wins
        if (bidHistory.length > 0) {
          const highestBid = bidHistory[0] // bidHistory is sorted with highest first
          setWinner({
            bidder: highestBid.bidder,
            amount: highestBid.amount,
            winningTime: new Date()
          })
          setBidMessage(`Auction ended! Winner: ${highestBid.bidder} with bid of PKR ${parseFloat(highestBid.amount).toLocaleString()}`)
        } else {
          setBidMessage('Auction ended with no bids.')
        }
      }
    }

    // Check every minute
    const timer = setInterval(checkAuctionEnd, 60000)
    checkAuctionEnd() // Check immediately

    return () => clearInterval(timer)
  }, [property, bidHistory, auctionEnded])

  // Load property details from uploaded data
  const loadPropertyDetails = async (propertyIdParam) => {
    try {
      const propertyId = propertyIdParam?.toString().trim()
      if (!propertyId) {
        setProperty(null)
        return
      }

      // Get properties from localStorage (uploaded via dashboard/land registration)
      const allProperties = JSON.parse(localStorage.getItem('userProperties') || '[]')
      const foundProperty = allProperties.find(p => p.id?.toString() === propertyId)
      
      if (foundProperty && foundProperty.type === 'bidding') {
        let normalizedCoordinates = null
        if (foundProperty.coordinates && typeof foundProperty.coordinates === 'object') {
          const lat = parseFloat(foundProperty.coordinates.lat)
          const lng = parseFloat(foundProperty.coordinates.lng)
          if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            normalizedCoordinates = {
              lat,
              lng,
              provider: foundProperty.coordinates.provider,
              fetchedAt: foundProperty.coordinates.fetchedAt,
            }
          }
        }

        // If we do not have stored coordinates, attempt to geocode now and persist
        if (!normalizedCoordinates && foundProperty.location) {
          try {
            const freshCoordinates = await geocodeAddress(foundProperty.location)
            if (freshCoordinates) {
              normalizedCoordinates = freshCoordinates
              const updatedProperties = allProperties.map(propertyItem =>
                propertyItem.id?.toString() === propertyId
                  ? { ...propertyItem, coordinates: freshCoordinates }
                  : propertyItem
              )
              localStorage.setItem('userProperties', JSON.stringify(updatedProperties))
            }
          } catch (geocodeError) {
            console.error('Failed to geocode property during detail load:', geocodeError)
          }
        }

        // Use bidding data from property form if available, fallback to legacy settings
        const biddingData = foundProperty.bidding || {}
        
        // Fallback to legacy settings if no form data available
        const bidSettings = JSON.parse(localStorage.getItem('propertyBidSettings') || '{}')
        const propertyBidSettings = bidSettings[foundProperty.id] || {}
        
        // Load bidding timings - use form data if available
        let propertyTiming
        if (biddingData.startDateTime && biddingData.endDateTime) {
          propertyTiming = {
            startTime: biddingData.startDateTime,
            endTime: biddingData.endDateTime,
            status: new Date() < new Date(biddingData.endDateTime) ? 'active' : 'ended'
          }
        } else {
          const timings = JSON.parse(localStorage.getItem('biddingTimings') || '{}')
          propertyTiming = timings[foundProperty.id] || {
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active'
          }
        }
        
        // Load existing bids from Firestore first, fallback to localStorage
        let propertyBids = []
        try {
          const bidsResult = await getBidsForProperty(foundProperty.id)
          if (bidsResult.success) {
            propertyBids = bidsResult.bids
            console.log('Loaded bids from Firestore:', propertyBids.length)
          } else {
            throw new Error('Failed to load from Firestore')
          }
        } catch (error) {
          console.warn('Loading bids from localStorage as fallback:', error)
          const allBids = JSON.parse(localStorage.getItem('propertyBids') || '{}')
          propertyBids = allBids[foundProperty.id] || []
        }
        
        // Transform property data to use rupees directly from form
        const baseStartingBid = biddingData.minBidAmount || propertyBidSettings.minBidAmount || 10000000
        const currentBidValue = propertyBids.length > 0 ? Math.max(...propertyBids.map(bid => parseFloat(bid.amount) || 0)) : baseStartingBid
        const minBidIncrement = 500000 // Fixed increment
        const maxBidLimit = biddingData.maxBidAmount || propertyBidSettings.maxBidAmount || 1000000000
        const biddingFees = biddingData.fees || 50000

        // Get the proper image from form data
        let propertyImage = foundProperty.image
        if (!propertyImage && foundProperty.images && foundProperty.images.length > 0) {
          propertyImage = foundProperty.images[0].url || foundProperty.images[0]
        }

        const transformedProperty = {
          id: foundProperty.id,
          title: foundProperty.title,
          description: foundProperty.description || 'Property details will be updated soon.',
          image: propertyImage,
          area: foundProperty.areaSize || foundProperty.area || 'Not specified',
          location: foundProperty.location || 'Location not specified',
          ownerId: foundProperty.userId || null,
          startingBid: `PKR ${baseStartingBid.toLocaleString()}`,
          currentBid: `PKR ${currentBidValue.toLocaleString()}`,
          startingBidDisplay: `PKR ${baseStartingBid.toLocaleString()}`,
          currentBidDisplay: `PKR ${currentBidValue.toLocaleString()}`,
          status: propertyTiming.status === 'active' ? 'Live Auction' : 'Auction Ended',
          auctionEnd: calculateTimeLeft(propertyTiming.endTime),
          bidders: propertyBids.length,
          beds: 0,
          baths: 0,
          features: ['Property Details', 'Location Access', 'Investment Opportunity'],
          // Bidding system settings from form
          minBidIncrement: minBidIncrement,
          maxBidLimit: maxBidLimit,
          biddingFee: biddingFees,
          startTime: propertyTiming.startTime,
          endTime: propertyTiming.endTime,
          currentBidValue: currentBidValue,
          minNextBid: baseStartingBid,
          // Auto-bid settings
          autoBidEnabled: true,
          autoBidMaxLimit: maxBidLimit * 0.8,
          autoBidIncrement: 0.03,
                reservePrice: baseStartingBid,
          // Original bidding form data for reference
          biddingFormData: biddingData
        }
        
        setProperty({
          ...transformedProperty,
          coordinates: normalizedCoordinates,
        })
        setCurrentBid(transformedProperty.currentBidDisplay)
        setUserHasPaidFee(false)

        // Load bid history
        const transformedBidHistory = propertyBids.map((bid, index) => ({
          id: index + 1,
          bidder: bid.bidderName || 'Anonymous',
          amount: bid.amount,
          timestamp: new Date(bid.placedAt || Date.now())
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        
        setBidHistory(transformedBidHistory)
        
        // Check if user owns this property
        const propertyOwnership = localStorage.getItem(`property_owned_${foundProperty.id}`)
        if (propertyOwnership) {
          const ownershipData = JSON.parse(propertyOwnership)
          setPropertyOwned(true)
          setAdminApprovalPending(ownershipData.approvalStatus === 'pending')
        }
        
      } else {
        setProperty(null)
      }
    } catch (error) {
      console.error('Error loading property details:', error)
      setProperty(null)
    }
  }

  // Calculate time left for auction
  const calculateTimeLeft = (endTime) => {
    if (!endTime) return 'Schedule pending'

    const now = new Date()
    const end = new Date(endTime)
    if (Number.isNaN(end.getTime())) return 'Schedule pending'

    const timeDiff = end - now

    if (timeDiff <= 0) return 'Auction Ended'

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} left`
    return 'Less than 1 minute left'
  }

  useEffect(() => {
    if (!property) {
      setCountdownDisplay('')
      return
    }

    const endTime = property?.biddingFormData?.endDateTime || property?.bidding?.endDateTime || property?.endTime
    if (!endTime) {
      setCountdownDisplay(property?.auctionEnd || 'Schedule pending')
      return
    }

    let timerId = null

    const updateCountdown = () => {
      const value = auctionEnded ? 'Auction Ended' : calculateTimeLeft(endTime)
      setCountdownDisplay(value)
      if (value === 'Auction Ended' && timerId) {
        clearInterval(timerId)
        timerId = null
      }
    }

    updateCountdown()

    if (!auctionEnded) {
      timerId = setInterval(updateCountdown, 1000)
    }

    return () => {
      if (timerId) {
        clearInterval(timerId)
      }
    }
  }, [property?.id, property?.biddingFormData?.endDateTime, property?.bidding?.endDateTime, property?.endTime, auctionEnded])

  // Payment processing for bidding fee
  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setBidMessage('')

    try {
      if (!paymentData.senderAccount.trim() || !paymentData.transactionReference.trim()) {
        setBidMessage('Please enter the account/wallet you paid from and the transaction reference or slip number.')
        setIsSubmitting(false)
        return
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      const paymentDataForFirestore = {
        propertyId: property?.id || id || 'unknown-property',
        feeAmount: property?.biddingFee || 0,
        fullName: paymentData.fullName,
        email: paymentData.email,
        phone: paymentData.phone,
        cnic: paymentData.cnic,
        paymentMethod: paymentData.paymentMethod,
        senderAccount: paymentData.senderAccount,
        transactionReference: paymentData.transactionReference,
        paymentNotes: paymentData.paymentNotes,
        paymentSlipName: paymentData.paymentSlipName,
        paymentSlip: paymentData.paymentSlip,
        status: 'pending'
      }

      const paymentResult = await addBiddingPayment(paymentDataForFirestore)

      if (paymentResult.success) {
        console.log('Payment saved to Firestore successfully:', paymentResult.payment.id)
      } else {
        console.error('Failed to save payment to Firestore:', paymentResult.error)
        try {
          const paymentRecord = {
            id: Date.now(),
            ...paymentDataForFirestore,
            paidAt: new Date().toISOString()
          }
          const existingPayments = JSON.parse(window.localStorage.getItem('biddingFeePayments') || '[]')
          existingPayments.push(paymentRecord)
          window.localStorage.setItem('biddingFeePayments', JSON.stringify(existingPayments))
        } catch (storageError) {
          console.warn('Failed to record bidding fee payment locally:', storageError)
        }
      }

      setFeeStatus('pending')
      setUserHasPaidFee(false)
      setCanPlaceBid(false)
      setShowPaymentModal(false)
      setBidMessage('Payment submitted. Waiting for admin approval.')
      setPaymentData((prev) => ({
        ...prev,
        transactionReference: '',
        paymentNotes: '',
        paymentSlip: null,
        paymentSlipName: ''
      }))
    } catch (error) {
      setBidMessage('Payment failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Refund function for admins and property owners
  const handleRefundForAdminOrOwner = async () => {
    const isUserAdmin = localStorage.getItem('isAdmin') === 'true'
    const isPropertyOwner = propertyOwned
    
    if (!isUserAdmin && !isPropertyOwner) {
      setBidMessage('Refunds are only available for admins and property owners.')
      return
    }

    try {
      // Check if user has paid
      const existingPayments = JSON.parse(window.localStorage.getItem('biddingFeePayments') || '[]')
      const propertyPayments = existingPayments.filter(payment => payment.propertyId === property.id)
      
      if (propertyPayments.length === 0) {
        setBidMessage('No payment found for this property. No refund needed.')
        return
      }

      // Remove payments for this property from localStorage
      const remainingPayments = existingPayments.filter(payment => payment.propertyId !== property.id)
      window.localStorage.setItem('biddingFeePayments', JSON.stringify(remainingPayments))
      
      // Reset payment status
      setUserHasPaidFee(false)
      
      const userType = isUserAdmin ? 'admin' : 'property owner'
      setBidMessage(`Payment refunded! As a ${userType}, you can enable Auto Bid without payment.`)
      
    } catch (error) {
      console.error('Refund processing error:', error)
      setBidMessage('Error processing refund. Please contact support.')
    }
  }

  // User Auto-Bid Response Function
  const triggerUserAutoBidResponse = async (currentBidValue) => {
    if (!userAutoBidEnabled || !userAutoBidMax) return false

    // Auto-bid is now free for all users

    const maxAutoBidAmount = parseFloat(userAutoBidMax)
    
    // Check if user's auto-bid should respond
    if (currentBidValue >= maxAutoBidAmount) {
      setBidMessage('Your auto-bid maximum limit reached. Auto-bidding disabled.')
      setUserAutoBidEnabled(false)
      return false
    }

    // Calculate next auto-bid amount
    let nextAutoBid = currentBidValue + property.minBidIncrement
    
    // Don't exceed user's maximum
    if (nextAutoBid > maxAutoBidAmount) {
      nextAutoBid = maxAutoBidAmount
    }

    // Don't exceed auction maximum
    if (nextAutoBid > property.maxBidLimit) {
      setBidMessage('Auto-bid would exceed auction limit.')
      return false
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Update property with auto-bid
    property.currentBidValue = nextAutoBid
    property.minNextBid = nextAutoBid + property.minBidIncrement
    property.bidders += 1
    
    setCurrentBid(formatRupeeValue(nextAutoBid))
    
    // Add auto-bid to history
    const autoBid = {
      id: bidHistory.length + 1,
      bidder: `${paymentData.fullName || 'You'} (Auto-Bid)`,
      amount: nextAutoBid.toString(),
      timestamp: new Date(),
      isAutoBid: true
    }
    setBidHistory(prev => [autoBid, ...prev])

    // Save auto-bid to localStorage
    const allBids = JSON.parse(localStorage.getItem('propertyBids') || '{}')
    if (!allBids[property.id]) {
      allBids[property.id] = []
    }
    
    // Save auto-bid to Firestore
    const autoBidData = {
      propertyId: property.id,
      bidderName: `${paymentData.fullName || 'Auto-User'} (Auto-Bid)`,
      bidderEmail: paymentData.email || 'Auto-bid',
      bidderPhone: paymentData.phone || 'Auto-bid',
      amount: nextAutoBid,
      propertyTitle: property.title,
      bidType: 'auto',
      isAutoBid: true
    }
    
    const autoBidResult = await addBid(autoBidData)
    
    if (autoBidResult.success) {
      console.log('Auto-bid saved to Firestore successfully:', autoBidResult.bid.id)
    } else {
      console.error('Failed to save auto-bid to Firestore:', autoBidResult.error)
      // Fallback to localStorage if Firestore fails
      const bidForStorage = {
        id: `auto_bid_${Date.now()}`,
        bidderName: `${paymentData.fullName || 'Auto-User'} (Auto-Bid)`,
        bidderEmail: paymentData.email || 'Auto-bid',
        bidderPhone: paymentData.phone || 'Auto-bid',
        amount: nextAutoBid.toString(),
        placedAt: new Date().toISOString(),
        isAutoBid: true
      }
      
      allBids[property.id].push(bidForStorage)
      localStorage.setItem('propertyBids', JSON.stringify(allBids))
    }    
    if (nextAutoBid >= maxAutoBidAmount) {
      setBidMessage(`Auto-bid placed final bid of ${formatRupeeValue(nextAutoBid)}. Maximum limit reached.`)
      setUserAutoBidEnabled(false)
      autoBidTrackerRef.current = null
      if (!propertyOwned) {
        setShowFullPaymentModal(true)
      }
    } else {
      const remaining = maxAutoBidAmount - nextAutoBid
      setBidMessage(`Auto-bid placed: ${formatRupeeValue(nextAutoBid)} (Remaining budget: ${formatRupeeValue(Math.max(remaining, 0))}).`)
    }
    
    return true
  }


  useEffect(() => {
    if (!userAutoBidEnabled || !userAutoBidMax || !property) {
      return
    }

    if (!bidHistory.length) {
      return
    }

    const latestBid = bidHistory[0]
    const latestBidder = latestBid?.bidder || latestBid?.bidderName || ''
    const latestAmount = parseRupeesInput(latestBid?.amount || property.currentBidValue)
    if (!latestAmount) {
      return
    }

    const activeName = paymentData.fullName || currentUser?.name || currentUser?.email || ''
    if (activeName && latestBidder && latestBidder.toLowerCase() === activeName.toLowerCase()) {
      return
    }

    if (autoBidTrackerRef.current === latestBid?.id) {
      return
    }

    if (latestAmount >= parseFloat(userAutoBidMax)) {
      return
    }

    autoBidTrackerRef.current = latestBid?.id || latestAmount
    triggerUserAutoBidResponse(latestAmount)
  }, [bidHistory, userAutoBidEnabled, userAutoBidMax, property, paymentData.fullName, currentUser])


  // Enhanced bid submission with auto-bid system
  const handleBidSubmit = async (e) => {
    e.preventDefault()
    
    // First check if auction timing allows bidding
    if (!canBidOnProperty(property)) {
      const statusInfo = getAuctionStatusMessage(property)
      setBidMessage(statusInfo.message)
      return
    }
    
    // Check if user can place a bid (after fee payment)
    if (!canPlaceBid) {
      if (feeStatus === 'pending') {
        setBidMessage('Your bidding fee payment is awaiting admin approval. Please contact an admin to approve it before bidding.')
        return
      }
      setBidMessage('Please pay the bidding fee before placing a bid.')
      setShowPaymentModal(true)
      return
    }

    const bidAmountRupees = parseRupeesInput(bidAmount)
    const bidderName = paymentData.fullName || currentUser?.name || currentUser?.email || 'You'

    // Validate bid amount - just check if it's a valid number
    if (!bidAmountRupees || bidAmountRupees <= 0) {
      setBidMessage('Please enter a valid bid amount')
      return
    }

    setIsSubmitting(true)
    setBidMessage('')

    try {
      // Simulate bid submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update property data with user bid (using rupees directly)
      property.currentBidValue = bidAmountRupees
      property.bidders += 1
      
      setCurrentBid(`PKR ${bidAmountRupees.toLocaleString()}`)
      
      // Add user bid to history
      const newBid = {
        id: bidHistory.length + 1,
        bidder: bidderName,
        amount: bidAmountRupees.toString(),
        timestamp: new Date()
      }
      setBidHistory(prev => [newBid, ...prev])      
      // Trigger user auto-bid if enabled (for other users' bids)
      if (userAutoBidEnabled && userAutoBidMax > bidAmountRupees) {
        setTimeout(() => {
          triggerUserAutoBidResponse(bidAmountRupees)
        }, 1500)
      }

      // Save bid to localStorage for dashboard display
      const allBids = JSON.parse(localStorage.getItem('propertyBids') || '{}')
      if (!allBids[property.id]) {
        allBids[property.id] = []
      }
      
      // Save bid to Firestore
      const bidData = {
        propertyId: property.id,
        bidderName: bidderName,
        bidderEmail: paymentData.email || 'No email provided',
        bidderPhone: paymentData.phone || 'No phone provided',
        amount: bidAmountRupees,
        propertyTitle: property.title,
        bidType: 'manual'
      }
      
      const bidResult = await addBid(bidData)
      
      if (bidResult.success) {
        console.log('Bid saved to Firestore successfully:', bidResult.bid.id)
      } else {
        console.error('Failed to save bid to Firestore:', bidResult.error)
        // Fallback to localStorage if Firestore fails
        const allBids = JSON.parse(localStorage.getItem('propertyBids') || '{}')
        if (!allBids[property.id]) {
          allBids[property.id] = []
        }
        
        const bidForStorage = {
          id: `bid_${Date.now()}`,
          bidderName: bidderName,
          bidderEmail: paymentData.email || 'No email provided',
          bidderPhone: paymentData.phone || 'No phone provided',
          amount: bidAmountRupees.toString(),
          placedAt: new Date().toISOString()
        }
        
                allBids[property.id].push(bidForStorage)
        localStorage.setItem('propertyBids', JSON.stringify(allBids))
      }

      // Trigger user auto-bid for other bidders if they have it enabled
      await triggerUserAutoBidResponse(bidAmountRupees)

      setBidAmount('')
      setBidMessage(prev => prev || 'Your bid has been placed successfully!')

    } catch (error) {
      setBidMessage('Failed to place bid. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }


  // User Auto-Bid Handler (for property owners and admins only)
  const handleUserAutoBid = () => {
    if (!canPlaceBid) {
      setBidMessage('You need to pay the bidding fee before enabling Auto Bid.')
      return
    }

    if (!property) {
      setBidMessage('Property details are still loading. Please try again in a moment.')
      return
    }

    const toggleState = !userAutoBidEnabled
    setUserAutoBidEnabled(toggleState)

    if (toggleState) {
      const suggestedMin = property.minNextBid || property.currentBidValue + (property.minBidIncrement || 0)
      const promptDefault = String(Math.max(suggestedMin || 0, property.currentBidValue + (property.minBidIncrement || 0)))
      const maxAmountInput = prompt('Enter your maximum auto-bid amount (PKR):', promptDefault)
      const parsedAmount = maxAmountInput ? parseFloat(maxAmountInput) : NaN
      if (!Number.isFinite(parsedAmount)) {
        setUserAutoBidEnabled(false)
        setBidMessage('Auto Bid cancelled - please enter a valid number.')
        return
      }
      if (parsedAmount <= property.currentBidValue) {
        setUserAutoBidEnabled(false)
        setBidMessage('Your auto-bid maximum must be higher than the current bid.')
        return
      }
      setUserAutoBidMax(parsedAmount)
      autoBidTrackerRef.current = null
      setBidMessage(`Auto Bid enabled! We'll bid automatically up to ${formatRupeeValue(parsedAmount)}.`)
    } else {
      setUserAutoBidMax('')
      autoBidTrackerRef.current = null
      setBidMessage('Auto Bid disabled.')
    }
  }


  // Admin configuration functions  }


  // Admin configuration functions
  const updateAdminConfig = (field, value) => {
    const numValue = parseFloat(value)
    
    // Validation: max bid limit should be higher than current bid
    if (field === 'maxBidLimit' && property && numValue <= property.currentBidValue) {
      setBidMessage(`Max bid limit must be higher than current bid (${formatRupeeValue(property.currentBidValue)})`)
      return
    }
    
    setAdminConfig(prev => ({
      ...prev,
      [field]: isNaN(numValue) ? value : numValue
    }))
    
    // Update property with new configuration immediately
    if (property) {
      property[field] = isNaN(numValue) ? value : numValue
      
      // Update min next bid if minBidIncrement changed
      if (field === 'minBidIncrement') {
        property.minNextBid = property.currentBidValue + numValue
      }
      
      setBidMessage(`${field} updated to ${formatRupeeValue(numValue)} - Changes applied immediately`)
    }
  }

  const saveAdminConfiguration = () => {
    if (!property) return
    
    // Apply all admin configurations to property
    Object.keys(adminConfig).forEach(key => {
      property[key] = adminConfig[key]
    })
    
    // Update minimum next bid based on new increment
    property.minNextBid = property.currentBidValue + adminConfig.minBidIncrement
    
    setBidMessage('Admin configuration saved successfully!')
    setShowAdminPanel(false)
  }

  const resetAdminConfig = () => {
    setAdminConfig({
      autoBidEnabled: true,
      autoBidMaxLimit: 35000000,
      autoBidIncrement: 300000,
        reservePrice: 30000000,
      maxBidLimit: 1000000000,
      minBidIncrement: 500000
    })
    setBidMessage('Admin configuration reset to defaults')
  }

  // Full property payment handler
  const handleFullPayment = async (paymentDetails) => {
    setIsSubmitting(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setPropertyOwned(true)
      setShowFullPaymentModal(false)
      setShowPaymentSuccess(true)
      setAdminApprovalPending(true)
      setBidMessage(`Payment successful! Your property purchase is complete.`)
      
      // Store in localStorage for persistence
      localStorage.setItem(`property_owned_${property.id}`, JSON.stringify({
        propertyId: property.id,
        winningBid: property.currentBidValue,
        paymentCompleted: true,
        purchaseDate: new Date().toISOString(),
        approvalStatus: 'pending'
      }))
      
    } catch (error) {
      setBidMessage('Payment failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isClient) {
    return null
  }

  if (!property) {
    return (
      <>
        <Head>
          <title>Property Not Found - REMMIC</title>
        </Head>
        <div className="page-wrapper">
          <Navbar />
          <div style={{padding: '100px 20px', textAlign: 'center'}}>
            <h2 style={{fontSize: '2rem', color: '#1f2937', marginBottom: '15px'}}>
              Bidding Property Not Found
            </h2>
            <p style={{fontSize: '1.1rem', color: '#6b7280', marginBottom: '10px'}}>
              The bidding property you're looking for doesn't exist or hasn't been listed for auction yet.
            </p>
            <p style={{fontSize: '1rem', color: '#6b7280', marginBottom: '30px'}}>
              Properties uploaded through dashboard or land registration with "bidding" type will appear here.
            </p>
            <div style={{display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap'}}>
              <button
                onClick={() => router.push('/bidding')}
                style={{
                  padding: '12px 24px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                View All Auctions
              </button>
              <button
                onClick={() => router.push('/add-property')}
                style={{
                  padding: '12px 24px',
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                List Property for Bidding
              </button>
              <button
                onClick={() => router.push('/land-registration')}
                style={{
                  padding: '12px 24px',
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Register Land
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  const isFeeApproved = feeStatus === 'approved'
  const isFeePending = feeStatus === 'pending'
  const isFeeRejected = feeStatus === 'rejected'
  const feeStatusHeading = isFeeApproved
    ? 'Bidding Fee Approved'
    : isFeePending
      ? 'Payment Pending Admin Approval'
      : isFeeRejected
        ? 'Bidding Fee Rejected'
        : 'Bidding Fee Required'
  const feeCardBackground = isFeeApproved
    ? '#dcfce7'
    : isFeePending
      ? '#fef3c7'
      : isFeeRejected
        ? '#fee2e2'
        : '#fef3c7'
  const feeCardAccent = isFeeApproved
    ? '#166534'
    : isFeePending
      ? '#d97706'
      : isFeeRejected
        ? '#b91c1c'
        : '#d97706'
  const feeStatusHelperText = describeFeeStatus(feeStatus, property?.biddingFee)
  const shouldShowFeeButton = feeStatus === 'required' || isFeeRejected
  const feeButtonLabel = isFeeRejected ? 'Resubmit Bidding Fee' : 'Pay Bidding Fee'


  return (
    <>
      <Head>
        <title>{property.title} - Bidding Details | REMMIC</title>
        <meta content={property.description} property="description"/>
        <meta content={`${property.title} - Bidding Details | REMMIC`} property="og:title"/>
        <meta content={`${property.title} - Bidding Details | REMMIC`} property="twitter:title"/>
        <meta content="width=device-width, initial-scale=1" name="viewport"/>
        <meta content="Webflow" name="generator"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/css/opixo.webflow.shared.269830e95.css" rel="stylesheet" type="text/css"/>
        <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js" type="text/javascript"/>
        <script type="text/javascript" dangerouslySetInnerHTML={{__html: `WebFont.load({ google: { families: ["Manrope:300,regular,500,600,700,800"] }});`}} />
        <script type="text/javascript" dangerouslySetInnerHTML={{__html: `!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);`}} />
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68b576a462172f27e0264706_32.png" rel="shortcut icon" type="image/x-icon"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68b576a587e457b5e3256985_256.png" rel="apple-touch-icon"/>
      </Head>

      <style jsx>{`
        :root {
          --primary-color: #000000;
          --secondary-color: #ffffff;
          --dark-color: #000000;
          --light-gray-color: #F5F5F5;
          --gray-text: #834c4c;
          --white-color: #ffffff;
          --border-radius: 12px;
          --box-shadow: 0 4px 15px rgb(255, 255, 255);
          --success-color: #080808;
        }
        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          background-color: var(--light-gray-color);
          color: var(--dark-color);
          padding-top: 0px;
        }
        .container {
          max-width: 1200px;
          margin: auto;
          padding: 0 20px;
        }
        .main-content {
          padding-top: 40px;
          padding-bottom: 60px;
        }
        .property-header {
          margin-bottom: 30px;
        }
        .property-header h1 {
          font-size: 2.5rem;
          margin-bottom: 5px;
          color: var(--primary-color);
        }
        .property-header p {
          font-size: 1.2rem;
          color: var(--gray-text);
          margin-top: 0;
        }
        .top-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 30px;
          margin-bottom: 30px;
          align-items: stretch;
        }
        .property-media,
        .map-container {
          min-height: 320px;
        }
        .map-container {
          display: flex;
          flex-direction: column;
        }
        .bottom-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 30px;
          align-items: start;
        }
        .property-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
        }
        .map-container iframe {
          width: 100%;
          height: 100%;
          border: 0;
          border-radius: var(--border-radius);
          flex: 1;
        }
        .property-info-card,
        .bidding-box {
          background: var(--light-gray-color);
          padding: 30px;
          border-radius: var(--border-radius);
          border: 2px solid #F5F5F5;
          outline: 6px solid #ffffff;
        }
        .section-title {
          font-size: 1.8rem;
          color: var(--primary-color);
          padding-bottom: 10px;
          border-bottom: 2px solid #eee;
          margin-top: 0;
          margin-bottom: 20px;
        }
        .property-specs {
          display: flex;
          gap: 30px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .spec-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1rem;
        }
        .spec-item svg { 
          width: 24px; 
          height: 24px; 
          color: var(--primary-color); 
        }
        .bidding-box-wrapper {
          position: sticky;
          top: 120px;
        }
        .countdown {
          text-align: center;
          font-size: 1.5rem;
          font-weight: 700;
          background-color: var(--secondary-color);
          color: var(--dark-color);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .bid-stat { 
          margin-bottom: 15px; 
        }
        .bid-stat p { 
          margin: 0; 
          color: var(--gray-text); 
        }
        .bid-stat span {
          font-size: 2rem;
          font-weight: 700;
          color: #0f172a;
        }
        .bid-form .form-group {
          margin-bottom: 15px;
        }
        .bid-form label { 
          font-weight: 600; 
          display: block; 
          margin-bottom: 5px; 
        }
        .bid-form input {
          width: 100%;
          padding: 12px;
          font-size: 1.2rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-sizing: border-box;
        }
        .bid-increment-note { 
          font-size: 0.9rem; 
          color: var(--gray-text); 
          margin-bottom: 15px; 
        }
        .btn-place-bid,
        .btn-Auto-bid {
          width: 100%;
          padding: 15px;
          font-size: 1.2rem;
          font-weight: 700;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 10px;
        }
        .btn-place-bid { 
          background-color: #fc7628; 
          color: #ffffff; 
        }
        .btn-Auto-bid { 
          background-color: #5D5D5D; 
          color: #ffffff; 
        }
        .bid-history { 
          margin-top: 20px; 
        }
        .bid-history h4 { 
          margin-bottom: 10px; 
        }
        .bid-history ul { 
          list-style: none; 
          padding: 0; 
          margin: 0; 
          max-height: 150px; 
          overflow-y: auto; 
        }
        .bid-history li { 
          padding: 8px 0; 
          border-bottom: 1px solid #eee; 
        }
        @media (max-width: 992px) {
          .top-grid, .bottom-grid { 
            grid-template-columns: 1fr; 
          }
          .map-container { 
            min-height: 300px; 
          }
          .bidding-box-wrapper { 
            position: static; 
          }
        }
      `}</style>

      <div className="page-wrapper">
        <Navbar />

        <main className="main-content">
          <div className="container">
            {/* Property Status Badges */}
            <div style={{display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap'}}>
              <div style={{
                padding: '8px 16px',
                background: property.status === 'Live Auction' ? '#ef4444' : '#f59e0b',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {property.status}
              </div>
              <div style={{
                padding: '8px 16px',
                background: 'rgba(0,0,0,0.1)',
                borderRadius: '8px',
                fontSize: '14px'
              }}>
                {countdownDisplay || property?.auctionEnd || 'Schedule pending'}
              </div>
              <div style={{
                padding: '8px 16px',
                background: '#f9fafb',
                color: '#0f172a',
                borderRadius: '8px',
                fontSize: '14px',
                border: '1px solid #e2e8f0'
              }}>
                {property.bidders} Active Bidders
              </div>
            </div>

            <div className="property-header">
              <h1>{property.title}</h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '10px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#6b7280'
                }}>
                <span>{property.location || 'Location not specified'}</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#6b7280'
                }}>
                  <span>{property.area || 'Area not specified'}</span>
                </div>
                {property.beds > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#6b7280'
                  }}>
                  <span>{property.beds} Beds</span>
                  </div>
                )}
                {property.baths > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#6b7280'
                  }}>
                    <span>{property.baths} Baths</span>
                  </div>
                )}
              </div>
              
              {/* Property Type and ID */}
              
            </div>
            <div className="top-grid">
              <div className="property-media">
                {property.image ? (
                  <img 
                    src={property.image} 
                    alt={property.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 'var(--border-radius)'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'
                      e.target.alt = 'Property placeholder image'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    borderRadius: 'var(--border-radius)',
                    textAlign: 'center'
                  }}>
                    {property.title}
                  </div>
                )}
              </div>
              <div className="map-container">
                <PropertyMap
                  coordinates={property.coordinates}
                  address={property.location}
                  height="100%"
                  borderRadius="var(--border-radius)"
                />
              </div>
            </div>
            <div className="bottom-grid">
              <div className="property-info-card">
                <h2 className="section-title">Property Details</h2>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginBottom: '15px'
                }}>
                  <span style={{
                    padding: '4px 8px',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Property ID: {property.id}
                  </span>
                  <span style={{
                    padding: '4px 8px',
                    background: '#f0fdf4',
                    color: '#166534',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Type: {property.type || 'Bidding Property'}
                  </span>
                </div>

                <div className="property-specs">
                  <div className="spec-item">{property.area}</div>
                  {property.beds > 0 && <div className="spec-item">{property.beds} Beds</div>}
                  {property.baths > 0 && <div className="spec-item">{property.baths} Baths</div>}
                </div>
                <h3 style={{marginTop: '30px'}}>Description</h3>
                <p>{property.description}</p>
                
                <h3 style={{marginTop: '30px'}}>Features</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginTop: '15px'}}>
                  {property.features.map((feature, index) => (
                    <div key={index} style={{
                      padding: '8px 12px',
                      background: '#f1f5f9',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}>
                      - {feature}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bidding-box-wrapper">
                <div className="bidding-box">
                  <div className="countdown">Ends in: {countdownDisplay || property?.auctionEnd || 'Schedule pending'}</div>
                  <div className="bid-stat">
                    <p>Starting Bid</p>
                  <span style={{fontSize: '1.5rem'}}>{property.startingBid}</span>
                  </div>
                  <div className="bid-stat">
                    <p>Current Bid</p>
                  <span>{currentBid}</span>
                  </div>
                  <div className="bid-stat">
                    <p>Total Bids</p>
                  <span>{property.bidders}</span>
                  </div>
                  {/* Bidding Fee Status */}
                  <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    background: feeCardBackground,
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: feeStatus === 'rejected' ? '1px solid #f87171' : 'none'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: feeCardAccent,
                      marginBottom: '5px'
                    }}>
                      {feeStatusHeading}
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280'}}>
                      {feeStatusHelperText}
                    </div>
                    {isFeePending && (
                      <div style={{fontSize: '12px', color: '#92400e', marginTop: '8px'}}>
                        Please ask an admin to approve your payment so bidding unlocks.
                      </div>
                    )}
                    {shouldShowFeeButton && (
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        disabled={!canBidOnProperty(property)}
                        className="button is-secondary w-inline-block"
                        style={{
                          marginTop: '10px',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          cursor: canBidOnProperty(property) ? 'pointer' : 'not-allowed',
                          opacity: canBidOnProperty(property) ? 1 : 0.6
                        }}
                      >
                        <div className="button-text">
                          {canBidOnProperty(property) 
                            ? feeButtonLabel
                            : getAuctionStatusMessage(property).status === 'upcoming' 
                              ? 'Auction Not Started' 
                              : 'Auction Ended'
                          }
                        </div>
                      </button>
                    )}
                  </div>


                  {/* Auto-Bid Status Display */}
                  {userAutoBidEnabled && (
                    <div style={{
                      marginBottom: '20px',
                      padding: '15px',
                      background: '#e0f2fe',
                      border: '2px solid #0891b2',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0c4a6e',
                        marginBottom: '5px'
                      }}>
                        Auto-Bidding Active
                      </div>
                      <div style={{fontSize: '12px', color: '#0c4a6e'}}>
                        Maximum: {formatRupeeValue(userAutoBidMax)} (from dashboard settings)
                      </div>
                      <div style={{fontSize: '11px', color: '#0369a1', marginTop: '5px'}}>
                        Will automatically bid when outbid, up to your maximum limit
                      </div>
                    </div>
                  )}

                  {/* Auction Status */}
                  {(() => {
                    const statusInfo = getAuctionStatusMessage(property)
                    const isAuctionActive = canBidOnProperty(property)
                    
                    if (statusInfo.message) {
                      return (
                        <div style={{
                          marginBottom: '20px',
                          padding: '15px',
                          background: statusInfo.status === 'ended' 
                            ? '#fee2e2' 
                            : statusInfo.status === 'upcoming' 
                              ? '#fef3c7' 
                              : '#fee2e2',
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            fontSize: '16px', 
                            fontWeight: '700', 
                            color: statusInfo.status === 'ended' 
                              ? '#dc2626' 
                              : statusInfo.status === 'upcoming' 
                                ? '#d97706' 
                                : '#dc2626', 
                            marginBottom: '5px'
                          }}>
                            {statusInfo.status === 'ended' 
                              ? 'Auction Ended' 
                              : statusInfo.status === 'upcoming' 
                                ? 'Auction Not Started' 
                                : 'Auction Status'
                            }
                          </div>
                          <div style={{
                            fontSize: '14px', 
                            color: statusInfo.status === 'ended' 
                              ? '#7f1d1d' 
                              : statusInfo.status === 'upcoming' 
                                ? '#92400e' 
                                : '#7f1d1d'
                          }}>
                            {statusInfo.message}
                          </div>
                          {statusInfo.status === 'ended' && winner && (
                            <div style={{fontSize: '14px', color: '#7f1d1d', marginTop: '5px'}}>
                              Winner: {winner.bidder}
                            </div>
                          )}
                        </div>
                      )
                    }
                    return null
                  })()}

                  <form className="bid-form" onSubmit={handleBidSubmit}>
                    <div className="form-group">
                      <label htmlFor="bid-amount">Your Bid Amount (PKR)</label>
                      <input 
                        type="number" 
                        step="1000"
                        id="bid-amount" 
                        placeholder={canBidOnProperty(property) ? "Enter your bid amount" : "Bidding not available"}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        disabled={!userHasPaidFee || auctionEnded || !canBidOnProperty(property)}
                        required
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="button is-secondary w-inline-block"
                      disabled={isSubmitting || !canPlaceBid || auctionEnded || !canBidOnProperty(property)}
                      style={{
                        width: '100%',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        opacity: (!canPlaceBid || auctionEnded || !canBidOnProperty(property)) ? 0.5 : 1,
                        cursor: (!canPlaceBid || auctionEnded || !canBidOnProperty(property)) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <div className="button-text">
                        {isSubmitting 
                          ? 'Placing Bid...' 
                          : !canBidOnProperty(property) 
                            ? getAuctionStatusMessage(property).status === 'upcoming' 
                              ? 'Auction Not Started' 
                              : 'Auction Ended'
                            : 'Place Your Bid'
                        }
                      </div>
                    </button>

                    {/* User Auto Bid button - available for property owners and admins only */}
                    {((canPlaceBid && userHasPaidFee) || userAutoBidEnabled) && (
                      <button 
                        type="button" 
                        className="button w-inline-block"
                        onClick={handleUserAutoBid}
                        disabled={auctionEnded || !canBidOnProperty(property)}
                        style={{
                          width: '100%',
                          marginTop: '10px',
                          opacity: (auctionEnded || !canBidOnProperty(property)) ? 0.5 : 1,
                          cursor: (auctionEnded || !canBidOnProperty(property)) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <div className="button-text">
                          {userAutoBidEnabled ? 'Disable Auto Bid' : 'Enable Auto Bid'}
                        </div>
                      </button>
                    )}

                    {/* Refund button for admins and property owners who have paid */}
                    {(localStorage.getItem('isAdmin') === 'true' || propertyOwned) && userHasPaidFee && (
                      <button 
                        type="button" 
                        className="button w-inline-block"
                        onClick={handleRefundForAdminOrOwner}
                        style={{
                          width: '100%',
                          marginTop: '10px',
                          opacity: 1,
                          cursor: 'pointer',
                          background: '#f97316',
                          borderColor: '#f97316'
                        }}
                      >
                        <div className="button-text">
                          Refund Payment (Admin/Owner)
                        </div>
                      </button>
                    )}
                    
                </form>
                  
                  {bidMessage && (
                    <div style={{
                      marginTop: '15px',
                      padding: '10px',
                      background: bidMessage.includes('success') || bidMessage.includes('??') ? '#dcfce7' : '#fee2e2',
                      color: bidMessage.includes('success') || bidMessage.includes('??') ? '#166534' : '#dc2626',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}>
                      {bidMessage}
                    </div>
                  )}

                  {/* Winner Display when auction ends */}
                  {auctionEnded && winner && (
                    <div style={{
                      marginTop: '20px',
                      padding: '20px',
                      background: 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)',
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: '3px solid #d97706'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#92400e',
                        marginBottom: '10px'
                      }}>
                        AUCTION WINNER
                      </h3>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#78350f',
                        marginBottom: '8px'
                      }}>
                        {winner.bidder}
                      </div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#92400e'
                      }}>
                        Winning Bid: PKR {parseFloat(winner.amount).toLocaleString()}
                      </div>
                      
                      {/* Full Payment Button for Winner */}
                      <button
                        onClick={() => setShowFullPaymentModal(true)}
                        className="button is-secondary w-inline-block"
                        style={{
                          marginTop: '20px',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <div className="button-text">Complete Full Payment</div>
                      </button>
                    </div>
                  )}

                  <div className="bid-history">
                    <h4>Recent Bids</h4>
                    <ul>
                      {bidHistory.length > 0 ? bidHistory.map((bid) => (
                        <li key={bid.id}>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div>
                              <strong>{bid.bidder}</strong> - PKR {parseFloat(bid.amount).toLocaleString()}
                            </div>
                            <div style={{fontSize: '12px', color: '#6b7280'}}>
                              {bid.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </li>
                      )) : (
                        <li style={{textAlign: 'center', color: '#6b7280', fontStyle: 'italic', padding: '20px'}}>
                          No bids placed yet. Be the first to bid!
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div style={{marginTop: '40px'}}>
              <button
                onClick={() => router.back()}
                className="button w-inline-block"
              >
                <div className="button-text">Back to Properties</div>
              </button>
            </div>
          </div>
        </main>

        {/* Payment Modal for regular bidding */}
        {showPaymentModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h3 style={{margin: 0, fontSize: '20px', fontWeight: '700'}}>Pay Bidding Fee</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{
                padding: '15px',
                background: '#f3f4f6',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <div style={{fontSize: '16px', fontWeight: '600', marginBottom: '5px'}}>
                  Bidding Fee: PKR {property?.biddingFee?.toLocaleString()}
                </div>
                <div style={{fontSize: '14px', color: '#6b7280'}}>
                  This fee allows you to participate in the auction
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit}>
                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={paymentData.fullName}
                    onChange={(e) => setPaymentData({...paymentData, fullName: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>

                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={paymentData.email}
                    onChange={(e) => setPaymentData({...paymentData, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>

                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={paymentData.phone}
                    onChange={(e) => setPaymentData({...paymentData, phone: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>

                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                    CNIC *
                  </label>
                  <input
                    type="text"
                    value={paymentData.cnic}
                    onChange={(e) => setPaymentData({...paymentData, cnic: e.target.value})}
                    placeholder="12345-1234567-1"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>

                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                    Payment Method *
                  </label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="bank">Bank Transfer</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="mobile">Mobile Banking</option>
                  </select>
                </div>

                <div style={{
                  marginBottom: '20px',
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{ fontWeight: '600', color: '#c2410c', marginBottom: '8px' }}>
                    Transfer Instructions
                  </div>
                  <div style={{ fontSize: '13px', color: '#9a3412', lineHeight: 1.6 }}>
                    Send the bidding fee to:<br/>
                    <strong>Account Title:</strong> REMMIC Escrow Services<br/>
                    <strong>Bank:</strong> HBL, F-7 Markaz Branch<br/>
                    <strong>Account No:</strong> 00123456789011<br/>
                    <strong>IBAN:</strong> PK12 HABB 0001 2345 6789 011<br/>
                    <strong>Mobile Wallet:</strong> 0300-1112233 (REMMIC)
                  </div>
                </div>

                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                    Sender Account / Wallet *
                  </label>
                  <input
                    type="text"
                    value={paymentData.senderAccount}
                    onChange={(e) => setPaymentData({...paymentData, senderAccount: e.target.value})}
                    placeholder="e.g. 00123456789011 or 03001234567"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>

                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                    Transaction Reference / Slip ID *
                  </label>
                  <input
                    type="text"
                    value={paymentData.transactionReference}
                    onChange={(e) => setPaymentData({...paymentData, transactionReference: e.target.value})}
                    placeholder="Bank reference number or mobile transaction ID"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>

                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                    Payment Slip (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handlePaymentSlipUpload(e.target.files?.[0] || null)}
                    style={{
                      width: '100%',
                      padding: '10px 0',
                      fontSize: '14px'
                    }}
                  />
                  {paymentData.paymentSlipName && (
                    <div style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#6b7280',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                    <span>Attached: {paymentData.paymentSlipName}</span>
                      <button
                        type="button"
                        onClick={() => handlePaymentSlipUpload(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                    Notes (optional)
                  </label>
                  <textarea
                    value={paymentData.paymentNotes}
                    onChange={(e) => setPaymentData({...paymentData, paymentNotes: e.target.value})}
                    placeholder="Any additional details about the payment"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div style={{display: 'flex', gap: '15px'}}>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#6b7280',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '16px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: isSubmitting ? '#9ca3af' : '#ff5e01',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '16px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: isSubmitting ? 'none' : '0 10px 24px -12px rgba(255, 94, 1, 0.6)'
                    }}
                  >
                    {isSubmitting ? 'Processing...' : 'Pay Now'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Full Property Payment Modal */}
        {showFullPaymentModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{textAlign: 'center', marginBottom: '25px'}}>
                <h2 style={{fontSize: '1.8rem', fontWeight: '700', color: '#1f2937', marginBottom: '10px'}}>
                  Congratulations! You Won the Auction
                </h2>
                <p style={{color: '#6b7280', fontSize: '1.1rem'}}>
                  Complete your payment to secure the property
                </p>
                <div style={{
                  background: '#dcfce7',
                  border: '1px solid #22c55e',
                  borderRadius: '8px',
                  padding: '15px',
                  marginTop: '15px'
                }}>
                  <div style={{fontWeight: '600', color: '#166534'}}>
                    Winning Bid: {formatRupeeValue(property?.currentBidValue)}
                  </div>
                  <div style={{fontSize: '14px', color: '#166534', marginTop: '5px'}}>
                    Property: {property?.title}
                  </div>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault()
                handleFullPayment({
                  fullName: paymentData.fullName,
                  email: paymentData.email,
                  phone: paymentData.phone,
                  cnic: paymentData.cnic,
                  paymentMethod: paymentData.paymentMethod,
                  amount: property?.currentBidValue,
                  propertyId: property?.id
                })
              }}>
                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={paymentData.fullName}
                    onChange={(e) => setPaymentData({...paymentData, fullName: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={paymentData.email}
                    onChange={(e) => setPaymentData({...paymentData, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={paymentData.phone}
                      onChange={(e) => setPaymentData({...paymentData, phone: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                      CNIC Number *
                    </label>
                    <input
                      type="text"
                      value={paymentData.cnic}
                      onChange={(e) => setPaymentData({...paymentData, cnic: e.target.value})}
                      placeholder="12345-6789012-3"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                    Payment Method *
                  </label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="bank">Bank Transfer</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="financing">Property Financing</option>
                    <option value="installments">Installment Plan</option>
                  </select>
                </div>

                {/* Payment Summary */}
                <div style={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '25px'
                }}>
                  <h3 style={{margin: '0 0 15px 0', color: '#374151'}}>Payment Summary</h3>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span>Winning Bid Amount:</span>
                  <span style={{fontWeight: '600'}}>{formatRupeeValue(property?.currentBidValue)}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span>Processing Fee (2%):</span>
                  <span style={{fontWeight: '600'}}>{formatRupeeValue((property?.currentBidValue || 0) * 0.02)}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span>Legal Documentation:</span>
                  <span style={{fontWeight: '600'}}>{formatRupeeValue(0.05)}</span>
                  </div>
                  <hr style={{margin: '15px 0', border: 'none', borderTop: '2px solid #e2e8f0'}} />
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '700'}}>
                  <span>Total Amount:</span>
                  <span style={{color: '#dc2626'}}>{formatRupeeValue((property?.currentBidValue || 0) * 1.02 + 0.05)}</span>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  <div style={{fontWeight: '600', color: '#92400e', marginBottom: '8px'}}>
                    Important Terms & Conditions:
                  </div>
                  <ul style={{margin: '0', paddingLeft: '20px', color: '#92400e'}}>
                    <li>Payment must be completed within 24 hours</li>
                    <li>Property transfer subject to admin approval</li>
                    <li>All fees are non-refundable</li>
                    <li>Legal documentation will be processed within 7 business days</li>
                  </ul>
                </div>

                <div style={{display: 'flex', gap: '15px'}}>
                  <button
                    type="button"
                    onClick={() => setShowFullPaymentModal(false)}
                    style={{
                      flex: 1,
                      padding: '15px',
                      background: '#6b7280',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      flex: 2,
                      padding: '15px',
                      background: isSubmitting ? '#9ca3af' : '#059669',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? 'Processing Payment...' : `Complete Payment - ${formatRupeeValue((property?.currentBidValue || 0) * 1.02 + 0.05)}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Success Modal */}
        {showPaymentSuccess && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '40px',
              maxWidth: '500px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '40px',
                color: 'white'
              }}>
                ?
              </div>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '15px'
              }}>
                Payment Successful!
              </h2>
              
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                marginBottom: '25px',
                lineHeight: '1.6'
              }}>
                Congratulations! Your property purchase is complete. Our team will contact you soon to complete the property transfer process.
              </p>
              
              <div style={{
                background: '#f3f4f6',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '25px'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#374151',
                  marginBottom: '10px',
                  fontWeight: '600'
                }}>
                  Property Details:
                </div>
                <div style={{fontSize: '16px', color: '#1f2937', fontWeight: '600', marginBottom: '5px'}}>
                  {property?.title}
                </div>
                <div style={{fontSize: '14px', color: '#6b7280', marginBottom: '5px'}}>
                  Final Amount: {formatRupeeValue(property?.currentBidValue)}
                </div>
                <div style={{fontSize: '14px', color: '#6b7280'}}>
                  Property ID: {property?.id}
                </div>
              </div>
              
              <div style={{
                background: '#eff6ff',
                border: '2px solid #3b82f6',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '25px'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e40af',
                  marginBottom: '10px'
                }}>
                  Need Help or Have Questions?
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1e40af'
                }}>
                  Contact us: 03218200550
                </div>
              </div>
              
              <button
                onClick={() => setShowPaymentSuccess(false)}
                style={{
                  padding: '12px 30px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}















