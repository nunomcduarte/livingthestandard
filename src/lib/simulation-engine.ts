interface SimulationInputs {
  monthlySalary: number
  monthlyExpenses: number
  timeframe: number
  startYear: number
}

interface SimulationResults {
  euroFinalBalance: number
  euroRealValue: number
  euroPurchasingPowerChange: number
  euroInflationRate: number
  bitcoinFinalBalance: number
  bitcoinValueChange: number
  bitcoinAccumulated: number
  netDifference: number
  chartData: Array<{
    period: string
    euro: number
    bitcoin: number
  }>
}

// Historical Bitcoin prices (approximate yearly averages in EUR)
const bitcoinPrices: Record<number, number> = {
  2015: 230,
  2016: 430,
  2017: 2400,
  2018: 6500,
  2019: 7200,
  2020: 9500,
  2021: 35000,
  2022: 20000,
  2023: 27000,
  2024: 55000,
  2025: 65000,
}

// European inflation rates (approximate)
const inflationRates: Record<number, number> = {
  2015: 0.0,
  2016: 0.2,
  2017: 1.5,
  2018: 1.8,
  2019: 1.2,
  2020: 0.3,
  2021: 2.6,
  2022: 8.4,
  2023: 5.4,
  2024: 2.4,
  2025: 2.2,
}

export function calculateSimulation(inputs: SimulationInputs): SimulationResults {
  const monthlySavings = inputs.monthlySalary - inputs.monthlyExpenses
  const months = inputs.timeframe * 12

  let euroBalance = 0
  let bitcoinBalance = 0
  let bitcoinAmount = 0

  const chartData: Array<{ period: string; euro: number; bitcoin: number }> = []

  // Calculate month by month
  for (let month = 0; month <= months; month++) {
    const currentYear = inputs.startYear + Math.floor(month / 12)
    const btcPrice = getBitcoinPrice(currentYear, month % 12)

    if (month > 0) {
      // Add monthly savings
      euroBalance += monthlySavings

      // Buy Bitcoin with monthly savings
      const btcPurchased = monthlySavings / btcPrice
      bitcoinAmount += btcPurchased
    }

    // Calculate current Bitcoin value
    bitcoinBalance = bitcoinAmount * btcPrice

    // Add data points for chart (every 3 months)
    if (month % 3 === 0) {
      const yearLabel = currentYear + (month % 12) / 12
      chartData.push({
        period: yearLabel.toFixed(1),
        euro: Math.round(euroBalance),
        bitcoin: Math.round(bitcoinBalance),
      })
    }
  }

  // Calculate inflation impact on euro savings
  let cumulativeInflation = 1
  for (let year = inputs.startYear; year < inputs.startYear + inputs.timeframe; year++) {
    const rate = inflationRates[year] || 2.0
    cumulativeInflation *= 1 + rate / 100
  }

  const euroRealValue = euroBalance / cumulativeInflation
  const euroPurchasingPowerChange = ((euroRealValue - euroBalance) / euroBalance) * 100

  // Calculate average inflation rate
  const avgInflation =
    Object.values(inflationRates)
      .filter((_, idx) => {
        const year = inputs.startYear + idx
        return year >= inputs.startYear && year < inputs.startYear + inputs.timeframe
      })
      .reduce((sum, rate) => sum + rate, 0) / inputs.timeframe

  // Calculate Bitcoin value change
  const initialBtcPrice = bitcoinPrices[inputs.startYear] || 10000
  const finalBtcPrice = getBitcoinPrice(inputs.startYear + inputs.timeframe, 0)
  const bitcoinValueChange = ((bitcoinBalance - euroBalance) / euroBalance) * 100

  return {
    euroFinalBalance: Math.round(euroBalance),
    euroRealValue: Math.round(euroRealValue),
    euroPurchasingPowerChange,
    euroInflationRate: avgInflation,
    bitcoinFinalBalance: Math.round(bitcoinBalance),
    bitcoinValueChange,
    bitcoinAccumulated: bitcoinAmount,
    netDifference: Math.round(bitcoinBalance - euroBalance),
    chartData,
  }
}

function getBitcoinPrice(year: number, month: number): number {
  const basePrice = bitcoinPrices[year] || 30000
  const nextYearPrice = bitcoinPrices[year + 1] || basePrice

  // Interpolate between years with some volatility
  const yearProgress = month / 12
  const interpolated = basePrice + (nextYearPrice - basePrice) * yearProgress

  // Add some monthly volatility (±15%)
  const volatility = 1 + Math.sin(month * 0.5) * 0.15

  return interpolated * volatility
}
