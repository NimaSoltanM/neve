interface PriceRange {
  min: number
  max: number
  label: string
}

export function calculatePriceRanges(
  products: Array<{
    type: 'regular' | 'auction'
    price?: string | null
    currentBid?: string | null
    startingPrice?: string | null
  }>,
): PriceRange[] {
  // Extract all prices
  const prices = products
    .map((p) => {
      if (p.type === 'auction') {
        return parseFloat(p.currentBid || p.startingPrice || '0')
      }
      return parseFloat(p.price || '0')
    })
    .filter((p) => p > 0)
    .sort((a, b) => a - b)

  if (prices.length === 0) {
    // Default ranges if no products
    return [
      { min: 0, max: 100, label: 'under-100' },
      { min: 100, max: 500, label: '100-500' },
      { min: 500, max: 1000, label: '500-1000' },
      { min: 1000, max: Infinity, label: 'above-1000' },
    ]
  }

  const minPrice = Math.floor(prices[0])
  const maxPrice = Math.ceil(prices[prices.length - 1])
  const range = maxPrice - minPrice

  // If range is small, use tighter brackets
  if (range < 100) {
    const step = Math.ceil(range / 4)
    return [
      { min: 0, max: minPrice + step, label: `under-${minPrice + step}` },
      {
        min: minPrice + step,
        max: minPrice + step * 2,
        label: `${minPrice + step}-${minPrice + step * 2}`,
      },
      {
        min: minPrice + step * 2,
        max: minPrice + step * 3,
        label: `${minPrice + step * 2}-${minPrice + step * 3}`,
      },
      {
        min: minPrice + step * 3,
        max: Infinity,
        label: `above-${minPrice + step * 3}`,
      },
    ]
  }

  // For larger ranges, use quartiles
  const q1 = Math.ceil(prices[Math.floor(prices.length * 0.25)])
  const q2 = Math.ceil(prices[Math.floor(prices.length * 0.5)])
  const q3 = Math.ceil(prices[Math.floor(prices.length * 0.75)])

  return [
    { min: 0, max: q1, label: `under-${q1}` },
    { min: q1, max: q2, label: `${q1}-${q2}` },
    { min: q2, max: q3, label: `${q2}-${q3}` },
    { min: q3, max: Infinity, label: `above-${q3}` },
  ]
}
