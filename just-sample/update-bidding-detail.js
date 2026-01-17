const fs = require('fs');
const path = 'pages/bidding-detail.js';

let source = fs.readFileSync(path, 'utf8');

const replace = (pattern, replacement, description) => {
  const regex = new RegExp(pattern, 's');
  if (!regex.test(source)) {
    throw new Error(`Pattern not found for ${description}`);
  }
  source = source.replace(regex, replacement);
};

replace(
  "  const \\\\\\\\[showFullPaymentModal, setShowFullPaymentModal\\\\\\\\] = useState\\\\(false\\\\)\\n  const \\\\\\\\[showPaymentSuccess, setShowPaymentSuccess\\\\\\\\] = useState\\\\(false\\\\)\\n  const \\\\\\\\[propertyOwned, setPropertyOwned\\\\\\\\] = useState\\\\(false\\\\)\\n  const \\\\\\\\[adminApprovalPending, setAdminApprovalPending\\\\\\\\] = useState\\\\(false\\\\)\\n\\n\\n  const parseRupeesInput = \(input\) => \{",
  `  const [showFullPaymentModal, setShowFullPaymentModal] = useState(false)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [propertyOwned, setPropertyOwned] = useState(false)
  const [adminApprovalPending, setAdminApprovalPending] = useState(false)

  const resolveActiveUserId = useCallback(() => {
    if (currentUser?.id) {
      return currentUser.id
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
      console.warn('Failed to resolve active user id for bidding fee status:', error)
      return null
    }
  }, [currentUser])

  const buildBiddingFeeKey = (propertyId, userId) => {
    if (!propertyId || !userId) {
      return null
    }
    return \`biddingFeePaid_\${propertyId}_\${userId}\`
  }

  const refreshBiddingFeeStatus = useCallback(async (propertyId, options = {}) => {
    if (!propertyId || typeof window === 'undefined') {
      return
    }

    const { forceRefresh = false } = options
    const userId = resolveActiveUserId()

    if (!userId) {
      setUserHasPaidFee(false)
      setCanPlaceBid(false)
      return
    }

    const propertyKey = propertyId.toString()
    const storageKey = buildBiddingFeeKey(propertyKey, userId)

    let feeConfirmed = false

    if (storageKey) {
      feeConfirmed = window.localStorage.getItem(storageKey) === 'paid'
    }

    if (forceRefresh || !feeConfirmed) {
      try {
        const paymentsResult = await getUserBiddingPayments(userId)
        if (paymentsResult.success) {
          feeConfirmed = paymentsResult.payments.some((payment) => {
            const paymentPropertyId = payment?.propertyId
            const matchesProperty = paymentPropertyId != null && paymentPropertyId.toString() === propertyKey
            const isApproved = !payment?.status || payment.status === 'approved' || payment.status === 'pending'
            return matchesProperty && isApproved
          })
        }
      } catch (error) {
        console.warn('Failed to refresh bidding fee status:', error)
      }
    }

    if (feeConfirmed) {
      setUserHasPaidFee(true)
      setCanPlaceBid(true)
      if (storageKey) {
        window.localStorage.setItem(storageKey, 'paid')
      }
    } else {
      setUserHasPaidFee(false)
      setCanPlaceBid(false)
      if (storageKey) {
        window.localStorage.removeItem(storageKey)
      }
    }
  }, [resolveActiveUserId])


  const parseRupeesInput = (input) => {`,
  'fee helpers insertion'
);

replace(
  "const formatRupeeValue = \\(? :value\\)? => \\{\\s+if \\(!value \\|\\| isNaN\\(?value\\)?\\) return '[^']*'\\s+return `[^`]*`\\s+\\}",
  "const formatRupeeValue = (value) => {\n    if (!value || isNaN(value)) return '? 0'\n    return `? ${parseFloat(value).toLocaleString()}`\n  }",
  'rupee formatter'
);

fs.writeFileSync(path, source);
