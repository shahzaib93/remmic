const getStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }
  return window.localStorage
}

const generateFallbackId = () => `prop_${Date.now()}_${Math.floor(Math.random() * 1e6)}`

const parsePrice = (value) => {
  if (value == null) return null
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const numeric = parseFloat(value.replace(/[^0-9.]/g, ''))
    return Number.isFinite(numeric) ? numeric : null
  }
  return null
}

const normalizeProperty = (property) => {
  if (!property || typeof property !== 'object') {
    return null
  }

  const id = property.id != null ? property.id.toString() : generateFallbackId()
  const type = (property.type || property.listingType || '').toLowerCase()
  const priceNumeric = parsePrice(property.price)

  return {
    ...property,
    id,
    type,
    priceNumeric,
  }
}

export const getAllStoredProperties = () => {
  const storage = getStorage()
  if (!storage) return []

  try {
    const raw = storage.getItem('userProperties')
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map(normalizeProperty)
      .filter(Boolean)
  } catch (error) {
    console.error('Failed to load stored properties:', error)
    return []
  }
}

export const getPropertiesByType = (type) => {
  if (!type) return []
  const target = type.toLowerCase()
  return getAllStoredProperties().filter((property) => 
    property.type === target && property.status === 'approved'
  )
}

export const getPropertyById = (id) => {
  if (!id) return null
  const idString = id.toString()
  return getAllStoredProperties().find((property) => property.id === idString || property.id === id)
}

const DEFAULT_CURRENCY_PREFIX = 'PKR'

export const formatCurrency = (amount, { prefix = DEFAULT_CURRENCY_PREFIX, suffix = '', maximumFractionDigits = 0 } = {}) => {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return null
  }

  const formatted = amount.toLocaleString('en-PK', { maximumFractionDigits })
  const resolvedPrefix = typeof prefix === 'string' ? prefix.trim() : ''
  const resolvedSuffix = typeof suffix === 'string' ? suffix.trim() : ''

  return [resolvedPrefix, formatted, resolvedSuffix].filter(Boolean).join(' ').trim()
}


export const ensurePropertyImage = (property) => {
  const isValidUrl = (url) => {
    try {
      if (!url || typeof url !== 'string' || url.trim() === '') return false
      return url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')
    } catch {
      return false
    }
  }

  const propertyType = (property?.type || property?.landType || property?.landtype || 'residential').toLowerCase()

  const fallbackImages = {
    bidding: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=640&auto=format&fit=crop&q=80',
    rental: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=640&auto=format&fit=crop&q=80',
    investment: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=640&auto=format&fit=crop&q=80',
    commercial: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=640&auto=format&fit=crop&q=80',
    house: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=640&auto=format&fit=crop&q=80',
    residential: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=640&auto=format&fit=crop&q=80',
    apartment: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=640&auto=format&fit=crop&q=80',
    villa: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=640&auto=format&fit=crop&q=80'
  }

  const getUnsplashFallback = () => fallbackImages[propertyType] || fallbackImages.residential

  const sanitizeImageUrl = (url) => {
    if (!isValidUrl(url)) return null
    const trimmed = url.trim()
    if (trimmed.startsWith('/')) {
      const lower = trimmed.toLowerCase()
      if (lower.startsWith('/images/properties') || lower.startsWith('/assets/images/properties') || lower.startsWith('images/properties')) {
        return getUnsplashFallback()
      }
      return trimmed
    }
    return trimmed
  }

  const extractImage = (source) => {
    if (!source || typeof source !== 'object') return null

    const direct = sanitizeImageUrl(source.image)
    if (direct) return direct

    if (Array.isArray(source.images)) {
      for (const entry of source.images) {
        if (typeof entry === 'string') {
          const sanitized = sanitizeImageUrl(entry)
          if (sanitized) return sanitized
          continue
        }
        if (entry && typeof entry === 'object') {
          const fromUrl = sanitizeImageUrl(entry.url)
          if (fromUrl) return fromUrl
          const fromPath = sanitizeImageUrl(entry.path)
          if (fromPath) return fromPath
          const fromSrc = sanitizeImageUrl(entry.src)
          if (fromSrc) return fromSrc
        }
      }
    }

    const imageUrlCandidate = sanitizeImageUrl(source.imageUrl)
    if (imageUrlCandidate) return imageUrlCandidate

    const photoCandidate = sanitizeImageUrl(source.photo)
    if (photoCandidate) return photoCandidate

    return null
  }

  const primaryImage = extractImage(property)
  if (primaryImage) {
    return primaryImage
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = JSON.parse(window.localStorage.getItem('userProperties') || '[]')
      const targetId = property?.id ?? property?.propertyId
      if (targetId != null) {
        const match = stored.find((item) => {
          const matchId = item?.id ?? item?.propertyId
          return matchId != null && matchId.toString() === targetId.toString()
        })
        if (match) {
          const localImage = extractImage(match)
          if (localImage) {
            return localImage
          }
        }
      }
    } catch (error) {
      console.warn('Failed to read local property images:', error)
    }
  }

  return getUnsplashFallback()
}


