export const parsePriceNumber = (value) => {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null

  const normalized = value.trim().toLowerCase()
  if (!normalized) return null

  let multiplier = 1
  if (normalized.includes('crore') || normalized.includes('cr')) multiplier = 10000000
  else if (normalized.includes('lac') || normalized.includes('lakh')) multiplier = 100000
  else if (normalized.includes('million')) multiplier = 1000000
  else if (normalized.includes('billion')) multiplier = 1000000000

  const numeric = parseFloat(normalized.replace(/[^0-9.]/g, ''))
  return Number.isFinite(numeric) ? numeric * multiplier : null
}

export const formatPrice = (price) => {
  const numericPrice = parsePriceNumber(price)
  if (!numericPrice) return 'PKR --'

  if (numericPrice >= 10000000) {
    return `PKR ${(numericPrice / 10000000).toFixed(1)} Cr`
  }
  if (numericPrice >= 100000) {
    return `PKR ${(numericPrice / 100000).toFixed(0)} Lac`
  }
  return `PKR ${numericPrice.toLocaleString()}`
}

export const formatPricePKR = (price) => {
  const numericPrice = parsePriceNumber(price)
  if (!numericPrice) return 'PKR --'

  if (numericPrice >= 10000000) {
    return `PKR ${(numericPrice / 10000000).toFixed(2)} Crore`
  }
  if (numericPrice >= 100000) {
    return `PKR ${(numericPrice / 100000).toFixed(0)} Lac`
  }
  return `PKR ${numericPrice.toLocaleString()}`
}
