import Papa from 'papaparse'

interface CSVRecord {
  Date: string        // "10/26/2025"
  Price: string       // "97,614.1"
  Open: string
  High: string
  Low: string
  "Vol.": string
  "Change %": string
}

// Cache for loaded prices: Map<"2025-10-26", 97614.1>
let bitcoinPriceCache: Map<string, number> = new Map()
let isLoaded = false

/**
 * Parse CSV and load Bitcoin prices into cache
 */
export function loadBitcoinPrices(csvText: string): void {
  const parsed = Papa.parse<CSVRecord>(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  parsed.data.forEach((row) => {
    if (!row.Date || !row.Price) return

    // Parse date from "MM/DD/YYYY" to "YYYY-MM-DD"
    const [month, day, year] = row.Date.split('/')
    const dateKey = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

    // Parse price: remove commas and convert to number
    const price = parseFloat(row.Price.replace(/,/g, ''))

    if (!isNaN(price)) {
      bitcoinPriceCache.set(dateKey, price)
    }
  })

  isLoaded = true
  console.log(`✅ Loaded ${bitcoinPriceCache.size} Bitcoin price records`)
}

/**
 * Get Bitcoin price for a specific date
 * Falls back to previous days if exact date not found (for weekends/holidays)
 */
export function getBitcoinPriceByDate(date: Date): number {
  if (!isLoaded) {
    console.warn('⚠️ Bitcoin prices not loaded yet, using fallback price')
    return 42250 // Fallback price
  }

  const dateStr = date.toISOString().split('T')[0] // "YYYY-MM-DD"

  // Try exact date first
  if (bitcoinPriceCache.has(dateStr)) {
    return bitcoinPriceCache.get(dateStr)!
  }

  // Try previous 7 days (for weekends/holidays)
  for (let i = 1; i <= 7; i++) {
    const prevDate = new Date(date)
    prevDate.setDate(prevDate.getDate() - i)
    const prevDateStr = prevDate.toISOString().split('T')[0]

    if (bitcoinPriceCache.has(prevDateStr)) {
      return bitcoinPriceCache.get(prevDateStr)!
    }
  }

  // If still not found, return fallback
  console.warn(`⚠️ No Bitcoin price found for ${dateStr}, using fallback`)
  return 42250
}

/**
 * Check if prices are loaded
 */
export function isPriceDataLoaded(): boolean {
  return isLoaded
}

/**
 * Get date range of available data
 */
export function getAvailableDateRange(): { start: Date; end: Date } | null {
  if (!isLoaded || bitcoinPriceCache.size === 0) return null

  const dates = Array.from(bitcoinPriceCache.keys()).sort()
  return {
    start: new Date(dates[0]),
    end: new Date(dates[dates.length - 1]),
  }
}

