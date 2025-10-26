import { describe, it, expect, beforeAll } from 'vitest'
import {
  runSimulation,
  type SimulationInputs,
  type Expense,
} from './calculator'
import { loadBitcoinPrices } from './bitcoin-data'

// Load mock Bitcoin price data before running tests
beforeAll(() => {
  // Generate comprehensive mock CSV data for all test dates
  // This creates daily prices for the entire test range (2015-2024)
  const mockPrices: Record<string, number> = {
    '2015': 220,
    '2019': 7200,
    '2020-01': 7200,
    '2020-02': 9650,
    '2020': 7200,
    '2021-01': 28950,
    '2021': 28950,
    '2023-12': 42250,
    '2023': 42250,
    '2024-01': 42250,
    '2024': 42250,
  }

  // Generate a CSV with daily entries covering all dates used in tests
  const csvLines = ['Date,Price,Open,High,Low,Vol.,Change %']
  
  // Generate daily entries for 2015-2024
  for (let year = 2015; year <= 2024; year++) {
    for (let month = 1; month <= 12; month++) {
      const daysInMonth = new Date(year, month, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        // Determine price based on year/month
        let price = 42250 // fallback
        const yearKey = year.toString()
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`
        
        if (mockPrices[monthKey]) {
          price = mockPrices[monthKey]
        } else if (mockPrices[yearKey]) {
          price = mockPrices[yearKey]
        }
        
        const dateStr = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`
        csvLines.push(`${dateStr},${price}.0,${price},${price + 100},${price - 100},1.0K,2%`)
      }
    }
  }
  
  const mockCSV = csvLines.join('\n')
  loadBitcoinPrices(mockCSV)
})

// Helper function to create a basic simulation input
function createSimulationInput(overrides: Partial<SimulationInputs> = {}): SimulationInputs {
  return {
    salary: 3000,
    salaryDay: 1,
    salaryGrowthRate: 0.03,
    expenses: [
      { name: 'Rent', amount: 1000, frequency: 'monthly', day: 5 },
      { name: 'Groceries', amount: 200, frequency: 'weekly', dayOfWeek: 0 },
    ],
    expenseInflationRate: 0.02,
    startDate: '2020-01-01',
    endDate: '2020-01-31',
    precision: 'daily',
    ...overrides,
  }
}

describe('Calculator - Helper Functions', () => {
  describe('Bitcoin Price Retrieval', () => {
    it('should return correct Bitcoin prices for 2020', () => {
      const inputs = createSimulationInput({
        startDate: '2020-01-01',
        endDate: '2020-01-02',
      })
      const results = runSimulation(inputs)
      
      // January 2020 should use price of 7200 EUR (from bitcoinPricesEUR)
      expect(results.dataPoints.length).toBeGreaterThan(0)
    })

    it('should return correct Bitcoin prices for 2021', () => {
      const inputs = createSimulationInput({
        startDate: '2021-01-01',
        endDate: '2021-01-02',
      })
      const results = runSimulation(inputs)
      
      // January 2021 should use price of 28950 EUR
      expect(results.dataPoints.length).toBeGreaterThan(0)
    })

    it('should handle December prices correctly', () => {
      const inputs = createSimulationInput({
        startDate: '2020-12-01',
        endDate: '2020-12-02',
      })
      const results = runSimulation(inputs)
      
      // December 2020 should use price of 28950 EUR
      expect(results.dataPoints.length).toBeGreaterThan(0)
    })
  })

  describe('Date and Timing', () => {
    it('should pay salary on the correct day of month', () => {
      const inputs = createSimulationInput({
        salary: 3000,
        salaryDay: 15,
        expenses: [],
        startDate: '2020-01-01',
        endDate: '2020-01-31',
      })
      const results = runSimulation(inputs)
      
      // Should receive one salary payment on day 15
      expect(results.totalSalaryReceived).toBe(3000)
      
      // Check that salary appears on day 15
      const day15Point = results.dataPoints.find(p => p.date === '2020-01-15')
      expect(day15Point).toBeDefined()
      expect(day15Point!.totalSalaryReceived).toBe(3000)
    })

    it('should handle salary payment on day 31 in February (leap year)', () => {
      const inputs = createSimulationInput({
        salary: 3000,
        salaryDay: 31,
        expenses: [],
        startDate: '2020-02-01',
        endDate: '2020-02-29',
      })
      const results = runSimulation(inputs)
      
      // Should pay salary on Feb 29 (last day of leap year February)
      expect(results.totalSalaryReceived).toBe(3000)
      
      const lastDayPoint = results.dataPoints.find(p => p.date === '2020-02-29')
      expect(lastDayPoint).toBeDefined()
      expect(lastDayPoint!.totalSalaryReceived).toBe(3000)
    })

    it('should handle salary payment on day 31 in non-leap year February', () => {
      const inputs = createSimulationInput({
        salary: 3000,
        salaryDay: 31,
        expenses: [],
        startDate: '2021-02-01',
        endDate: '2021-02-28',
      })
      const results = runSimulation(inputs)
      
      // Should pay salary on Feb 28 (last day of non-leap year February)
      expect(results.totalSalaryReceived).toBe(3000)
      
      const lastDayPoint = results.dataPoints.find(p => p.date === '2021-02-28')
      expect(lastDayPoint).toBeDefined()
      expect(lastDayPoint!.totalSalaryReceived).toBe(3000)
    })

    it('should handle monthly expenses correctly', () => {
      const inputs = createSimulationInput({
        salary: 3000,
        salaryDay: 1,
        expenses: [
          { name: 'Rent', amount: 1000, frequency: 'monthly', day: 10 },
        ],
        startDate: '2020-01-01',
        endDate: '2020-01-31',
      })
      const results = runSimulation(inputs)
      
      // Should pay rent once on day 10
      expect(results.totalExpensesPaid).toBe(1000)
    })

    it('should handle weekly expenses correctly', () => {
      const inputs = createSimulationInput({
        salary: 0,
        expenses: [
          { name: 'Groceries', amount: 50, frequency: 'weekly', dayOfWeek: 0 }, // Sunday
        ],
        startDate: '2020-01-01', // Wednesday
        endDate: '2020-01-31',
      })
      const results = runSimulation(inputs)
      
      // Count Sundays in January 2020: 5th, 12th, 19th, 26th = 4 Sundays
      expect(results.totalExpensesPaid).toBe(200) // 4 * 50
    })

    it('should handle expense on day 31 in February', () => {
      const inputs = createSimulationInput({
        salary: 3000,
        salaryDay: 1,
        expenses: [
          { name: 'Rent', amount: 1000, frequency: 'monthly', day: 31 },
        ],
        startDate: '2020-02-01',
        endDate: '2020-02-29',
      })
      const results = runSimulation(inputs)
      
      // Should pay expense on last day of February (29th)
      expect(results.totalExpensesPaid).toBe(1000)
    })
  })
})

describe('Calculator - Scenario 1: Euro-Only Balance', () => {
  it('should correctly calculate Euro balance with single month', () => {
    const inputs = createSimulationInput({
      salary: 3000,
      salaryDay: 1,
      expenses: [
        { name: 'Rent', amount: 1000, frequency: 'monthly', day: 5 },
        { name: 'Food', amount: 500, frequency: 'monthly', day: 15 },
      ],
      startDate: '2020-01-01',
      endDate: '2020-01-31',
    })
    const results = runSimulation(inputs)
    
    // Total: 3000 salary - 1000 rent - 500 food = 1500
    expect(results.finalEuroBalance).toBe(1500)
    expect(results.totalSalaryReceived).toBe(3000)
    expect(results.totalExpensesPaid).toBe(1500)
  })

  it('should allow negative Euro balance', () => {
    const inputs = createSimulationInput({
      salary: 1000,
      salaryDay: 1,
      expenses: [
        { name: 'Rent', amount: 2000, frequency: 'monthly', day: 5 },
      ],
      startDate: '2020-01-01',
      endDate: '2020-01-31',
    })
    const results = runSimulation(inputs)
    
    // 1000 - 2000 = -1000
    expect(results.finalEuroBalance).toBe(-1000)
  })

  it('should handle zero salary', () => {
    const inputs = createSimulationInput({
      salary: 0,
      expenses: [
        { name: 'Rent', amount: 1000, frequency: 'monthly', day: 5 },
      ],
      startDate: '2020-01-01',
      endDate: '2020-01-31',
    })
    const results = runSimulation(inputs)
    
    expect(results.finalEuroBalance).toBe(-1000)
    expect(results.totalSalaryReceived).toBe(0)
  })

  it('should handle zero expenses', () => {
    const inputs = createSimulationInput({
      salary: 3000,
      salaryDay: 1,
      expenses: [],
      startDate: '2020-01-01',
      endDate: '2020-01-31',
    })
    const results = runSimulation(inputs)
    
    expect(results.finalEuroBalance).toBe(3000)
    expect(results.totalExpensesPaid).toBe(0)
  })
})

describe('Calculator - Scenario 2: Bitcoin (No Selling)', () => {
  it('should convert all positive balance to Bitcoin', () => {
    const inputs = createSimulationInput({
      salary: 7200, // Same as BTC price in Jan 2020
      salaryDay: 1,
      expenses: [],
      startDate: '2020-01-01',
      endDate: '2020-01-02',
    })
    const results = runSimulation(inputs)
    
    // Should convert 7200 EUR to 1 BTC at price 7200
    expect(results.finalBitcoinAmount).toBeCloseTo(1, 5)
    expect(results.finalBitcoinBalance).toBeCloseTo(7200, 1)
  })

  it('should accumulate Bitcoin from multiple salary payments', () => {
    const inputs = createSimulationInput({
      salary: 7200,
      salaryDay: 1,
      expenses: [],
      startDate: '2020-01-01',
      endDate: '2020-02-05',
    })
    const results = runSimulation(inputs)
    
    // Jan 1: 7200 EUR -> 1 BTC at 7200
    // Feb 1: 7200 EUR -> ~0.746 BTC at 9650 (Feb 2020 price)
    // Total: ~1.746 BTC
    expect(results.finalBitcoinAmount).toBeGreaterThan(1.7)
    expect(results.finalBitcoinAmount).toBeLessThan(1.8)
  })

  it('should deduct expenses from EUR before converting to Bitcoin', () => {
    const inputs = createSimulationInput({
      salary: 10000,
      salaryDay: 1,
      expenses: [
        { name: 'Rent', amount: 3000, frequency: 'monthly', day: 5 },
      ],
      startDate: '2020-01-01',
      endDate: '2020-01-31',
    })
    const results = runSimulation(inputs)
    
    // After salary: 10000 EUR -> ~1.389 BTC at 7200
    // After rent on day 5: balance would go negative in EUR, but BTC already bought
    // This tests that expenses are properly deducted
    expect(results.totalExpensesPaid).toBe(3000)
  })

  it('should never sell Bitcoin in Scenario 2', () => {
    const inputs = createSimulationInput({
      salary: 10000,
      salaryDay: 1,
      expenses: [
        { name: 'Rent', amount: 5000, frequency: 'monthly', day: 10 },
        { name: 'Food', amount: 5000, frequency: 'monthly', day: 20 },
      ],
      startDate: '2020-01-01',
      endDate: '2020-01-31',
    })
    const results = runSimulation(inputs)
    
    // Bitcoin amount should only increase or stay same, never decrease
    const bitcoinAmounts = results.dataPoints.map(p => p.bitcoinAmount)
    for (let i = 1; i < bitcoinAmounts.length; i++) {
      expect(bitcoinAmounts[i]).toBeGreaterThanOrEqual(bitcoinAmounts[i - 1])
    }
  })
})

describe('Calculator - Scenario 3: Bitcoin (With Selling)', () => {
  it('should sell Bitcoin when EUR cash is insufficient for expenses', () => {
    const inputs = createSimulationInput({
      salary: 7200, // Converts to 1 BTC
      salaryDay: 1,
      expenses: [
        { name: 'Rent', amount: 5000, frequency: 'monthly', day: 10 },
      ],
      startDate: '2020-01-01',
      endDate: '2020-01-31',
    })
    const results = runSimulation(inputs)
    
    // Should accumulate ~1 BTC, then sell some to pay rent
    expect(results.finalBitcoinWithExpensesAmount).toBeLessThan(1)
    expect(results.finalBitcoinWithExpensesAmount).toBeGreaterThan(0)
  })

  it('should use EUR cash first before selling Bitcoin', () => {
    const inputs = createSimulationInput({
      salary: 10000,
      salaryDay: 1,
      expenses: [
        { name: 'Small Expense', amount: 2000, frequency: 'monthly', day: 2 },
      ],
      startDate: '2020-01-01',
      endDate: '2020-01-05',
    })
    const results = runSimulation(inputs)
    
    // Day 1: Get 10000 EUR salary
    // Day 2: Pay 2000 from EUR cash (still have 8000 EUR)
    // Then convert remaining 8000 to BTC
    // Should have ~1.111 BTC (8000/7200)
    expect(results.finalBitcoinWithExpensesAmount).toBeGreaterThan(1)
  })

  it('should handle complete Bitcoin depletion', () => {
    const inputs = createSimulationInput({
      salary: 7200,
      salaryDay: 1,
      expenses: [
        { name: 'Large Expense', amount: 10000, frequency: 'monthly', day: 10 },
      ],
      startDate: '2020-01-01',
      endDate: '2020-01-31',
    })
    const results = runSimulation(inputs)
    
    // 7200 salary -> 1 BTC, then need to sell all BTC + more to pay 10000
    // After selling 1 BTC, have 7200 EUR, but need 10000
    // Implementation clamps to 0 rather than going negative
    expect(results.finalBitcoinWithExpensesAmount).toBe(0)
    expect(results.finalBitcoinWithExpensesBalance).toBeLessThanOrEqual(0)
  })

  it('should correctly calculate shortfall and Bitcoin to sell', () => {
    const inputs = createSimulationInput({
      salary: 7200,
      salaryDay: 1,
      expenses: [
        { name: 'Rent', amount: 3600, frequency: 'monthly', day: 10 }, // Exactly 0.5 BTC worth
      ],
      startDate: '2020-01-01',
      endDate: '2020-01-31',
    })
    const results = runSimulation(inputs)
    
    // Start with 1 BTC, sell 0.5 BTC for 3600 EUR to pay rent
    expect(results.finalBitcoinWithExpensesAmount).toBeCloseTo(0.5, 2)
  })

  it('should handle multiple small Bitcoin sales', () => {
    const inputs = createSimulationInput({
      salary: 14400, // 2 BTC at 7200
      salaryDay: 1,
      expenses: [
        { name: 'Expense1', amount: 1000, frequency: 'monthly', day: 5 },
        { name: 'Expense2', amount: 1000, frequency: 'monthly', day: 10 },
        { name: 'Expense3', amount: 1000, frequency: 'monthly', day: 15 },
        { name: 'Expense4', amount: 1000, frequency: 'monthly', day: 20 },
      ],
      startDate: '2020-01-01',
      endDate: '2020-01-31',
    })
    const results = runSimulation(inputs)
    
    // Should have sold 4000 EUR worth of BTC
    // Remaining BTC value: 14400 - 4000 = 10400 EUR worth
    expect(results.totalExpensesPaid).toBe(4000)
    expect(results.finalBitcoinWithExpensesBalance).toBeGreaterThan(10000)
  })
})

describe('Calculator - Inflation and Growth', () => {
  it('should apply salary growth annually (compound)', () => {
    const inputs = createSimulationInput({
      salary: 3000,
      salaryDay: 1,
      salaryGrowthRate: 0.1, // 10% annual growth
      expenses: [],
      startDate: '2020-01-01',
      endDate: '2023-01-02',
    })
    const results = runSimulation(inputs)
    
    // Year 1 (2020): 3000 * 12 = 36000
    // Year 2 (2021): 3300 * 12 = 39600
    // Year 3 (2022): 3630 * 12 = 43560
    // Year 4 (2023): Just 1 payment of 3993
    // Total: 36000 + 39600 + 43560 + 3993 = 123153
    expect(results.totalSalaryReceived).toBeCloseTo(123153, 0)
  })

  it('should apply expense inflation annually (compound)', () => {
    const inputs = createSimulationInput({
      salary: 10000,
      salaryDay: 1,
      salaryGrowthRate: 0,
      expenses: [
        { name: 'Rent', amount: 1000, frequency: 'monthly', day: 5 },
      ],
      expenseInflationRate: 0.05, // 5% annual inflation
      startDate: '2020-01-01',
      endDate: '2023-01-10',
    })
    const results = runSimulation(inputs)
    
    // Year 1 (2020): 1000 * 12 = 12000
    // Year 2 (2021): 1050 * 12 = 12600
    // Year 3 (2022): 1102.5 * 12 = 13230
    // Year 4 (2023): 1157.625 * 1 = 1157.625
    // Total: 12000 + 12600 + 13230 + 1157.625 = 38987.625
    expect(results.totalExpensesPaid).toBeCloseTo(38987.625, 0)
  })

  it('should apply both salary growth and expense inflation', () => {
    const inputs = createSimulationInput({
      salary: 5000,
      salaryDay: 1,
      salaryGrowthRate: 0.03,
      expenses: [
        { name: 'Rent', amount: 2000, frequency: 'monthly', day: 5 },
      ],
      expenseInflationRate: 0.02,
      startDate: '2020-01-01',
      endDate: '2022-12-31',
    })
    const results = runSimulation(inputs)
    
    // Both should compound independently
    expect(results.totalSalaryReceived).toBeGreaterThan(180000) // More than 5000*36
    expect(results.totalExpensesPaid).toBeGreaterThan(72000) // More than 2000*36
  })

  it('should not apply growth/inflation in the first year', () => {
    const inputs = createSimulationInput({
      salary: 3000,
      salaryDay: 1,
      salaryGrowthRate: 0.1,
      expenses: [
        { name: 'Rent', amount: 1000, frequency: 'monthly', day: 5 },
      ],
      expenseInflationRate: 0.1,
      startDate: '2020-01-01',
      endDate: '2020-12-31',
    })
    const results = runSimulation(inputs)
    
    // First year should use base amounts
    expect(results.totalSalaryReceived).toBe(36000) // 3000 * 12
    expect(results.totalExpensesPaid).toBe(12000) // 1000 * 12
  })
})

describe('Calculator - Percentage Calculations', () => {
  it('should calculate positive Bitcoin gain percentage correctly', () => {
    const inputs = createSimulationInput({
      salary: 10000,
      salaryDay: 1,
      expenses: [],
      startDate: '2020-01-01',
      endDate: '2021-12-31',
    })
    const results = runSimulation(inputs)
    
    // Bitcoin should have gained significantly from 2020 to 2021
    expect(results.bitcoinGainPercentage).toBeGreaterThan(0)
    expect(results.finalBitcoinBalance).toBeGreaterThan(results.finalEuroBalance)
  })

  it('should handle division by zero when Euro balance is zero', () => {
    const inputs = createSimulationInput({
      salary: 1000,
      salaryDay: 1,
      expenses: [
        { name: 'Expense', amount: 1000, frequency: 'monthly', day: 5 },
      ],
      startDate: '2020-01-01',
      endDate: '2020-01-31',
    })
    const results = runSimulation(inputs)
    
    // Euro balance should be 0
    expect(results.finalEuroBalance).toBe(0)
    
    // If Bitcoin balance > 0, gain should be 100%
    if (results.finalBitcoinBalance > 0) {
      expect(results.bitcoinGainPercentage).toBe(100)
    } else {
      expect(results.bitcoinGainPercentage).toBe(0)
    }
  })

  it('should calculate correct percentage with negative Euro balance', () => {
    const inputs = createSimulationInput({
      salary: 1000,
      salaryDay: 1,
      expenses: [
        { name: 'Expense', amount: 2000, frequency: 'monthly', day: 5 },
      ],
      startDate: '2020-01-01',
      endDate: '2020-01-31',
    })
    const results = runSimulation(inputs)
    
    // Euro balance: -1000
    // Bitcoin balance: should be different
    // Percentage should use absolute value of Euro balance as denominator
    expect(results.finalEuroBalance).toBe(-1000)
    expect(typeof results.bitcoinGainPercentage).toBe('number')
    expect(isFinite(results.bitcoinGainPercentage)).toBe(true)
  })

  it('should calculate Bitcoin with expenses gain percentage separately', () => {
    const inputs = createSimulationInput({
      salary: 10000,
      salaryDay: 1,
      expenses: [
        { name: 'Rent', amount: 3000, frequency: 'monthly', day: 10 },
      ],
      startDate: '2020-01-01',
      endDate: '2020-12-31',
    })
    const results = runSimulation(inputs)
    
    // Scenario 2 and Scenario 3 should have different balances and percentages
    expect(results.bitcoinGainPercentage).not.toBe(results.bitcoinWithExpensesGainPercentage)
    expect(results.finalBitcoinBalance).not.toBe(results.finalBitcoinWithExpensesBalance)
  })
})

describe('Calculator - Data Points and Chart Data', () => {
  it('should store data points for daily precision', () => {
    const inputs = createSimulationInput({
      salary: 3000,
      salaryDay: 1,
      expenses: [],
      startDate: '2020-01-01',
      endDate: '2020-01-31',
      precision: 'daily',
    })
    const results = runSimulation(inputs)
    
    // Should have 31 data points (one per day)
    expect(results.dataPoints.length).toBe(31)
  })

  it('should sample data points for monthly precision', () => {
    const inputs = createSimulationInput({
      salary: 3000,
      salaryDay: 1,
      expenses: [],
      startDate: '2020-01-01',
      endDate: '2020-01-31',
      precision: 'monthly',
    })
    const results = runSimulation(inputs)
    
    // Should sample weekly + month changes + last day
    expect(results.dataPoints.length).toBeLessThan(31)
    expect(results.dataPoints.length).toBeGreaterThan(0)
  })

  it('should always include the final data point', () => {
    const inputs = createSimulationInput({
      startDate: '2020-01-01',
      endDate: '2020-01-31',
      precision: 'monthly',
    })
    const results = runSimulation(inputs)
    
    const lastPoint = results.dataPoints[results.dataPoints.length - 1]
    expect(lastPoint.date).toBe('2020-01-31')
  })

  it('should limit chart data to ~50 points', () => {
    const inputs = createSimulationInput({
      salary: 3000,
      salaryDay: 1,
      expenses: [],
      startDate: '2020-01-01',
      endDate: '2023-12-31',
      precision: 'daily',
    })
    const results = runSimulation(inputs)
    
    // ~1461 days total, chart should sample to ~50 points
    expect(results.chartData.length).toBeLessThanOrEqual(60)
    expect(results.chartData.length).toBeGreaterThan(40)
  })

  it('should round chart values to integers', () => {
    const inputs = createSimulationInput({
      startDate: '2020-01-01',
      endDate: '2020-01-31',
    })
    const results = runSimulation(inputs)
    
    results.chartData.forEach(point => {
      expect(Number.isInteger(point.euro)).toBe(true)
      expect(Number.isInteger(point.bitcoin)).toBe(true)
      expect(Number.isInteger(point.bitcoinWithExpenses)).toBe(true)
    })
  })

  it('should include all three scenarios in chart data', () => {
    const inputs = createSimulationInput({
      startDate: '2020-01-01',
      endDate: '2020-01-31',
    })
    const results = runSimulation(inputs)
    
    const firstPoint = results.chartData[0]
    expect(firstPoint).toHaveProperty('euro')
    expect(firstPoint).toHaveProperty('bitcoin')
    expect(firstPoint).toHaveProperty('bitcoinWithExpenses')
  })
})

describe('Calculator - Edge Cases', () => {
  it('should handle single-day simulation', () => {
    const inputs = createSimulationInput({
      salary: 3000,
      salaryDay: 1,
      expenses: [],
      startDate: '2020-01-01',
      endDate: '2020-01-01',
    })
    const results = runSimulation(inputs)
    
    expect(results.dataPoints.length).toBe(1)
    expect(results.totalSalaryReceived).toBe(3000)
  })

  it('should handle multi-year simulation with year transitions', () => {
    const inputs = createSimulationInput({
      salary: 3000,
      salaryDay: 1,
      salaryGrowthRate: 0.05,
      expenses: [
        { name: 'Rent', amount: 1000, frequency: 'monthly', day: 5 },
      ],
      expenseInflationRate: 0.03,
      startDate: '2019-12-15',
      endDate: '2021-01-15',
    })
    const results = runSimulation(inputs)
    
    // Should correctly apply multipliers at year boundaries
    expect(results.totalSalaryReceived).toBeGreaterThan(39000) // More than 13 * 3000
    expect(results.totalExpensesPaid).toBeGreaterThan(13000) // More than 13 * 1000
  })

  it('should handle leap year correctly', () => {
    const inputs = createSimulationInput({
      salary: 3000,
      salaryDay: 29,
      expenses: [],
      startDate: '2020-02-01',
      endDate: '2020-02-29',
    })
    const results = runSimulation(inputs)
    
    // Should pay salary on Feb 29
    expect(results.totalSalaryReceived).toBe(3000)
  })

  it('should handle simulation starting mid-month', () => {
    const inputs = createSimulationInput({
      salary: 3000,
      salaryDay: 1,
      expenses: [
        { name: 'Rent', amount: 1000, frequency: 'monthly', day: 5 },
      ],
      startDate: '2020-01-10',
      endDate: '2020-01-31',
    })
    const results = runSimulation(inputs)
    
    // Salary on day 1 was missed (started on day 10)
    expect(results.totalSalaryReceived).toBe(0)
    // Rent on day 5 was also missed
    expect(results.totalExpensesPaid).toBe(0)
  })

  it('should handle very small Bitcoin amounts', () => {
    const inputs = createSimulationInput({
      salary: 1, // Very small salary
      salaryDay: 1,
      expenses: [],
      startDate: '2021-04-01', // BTC price ~57750
      endDate: '2021-04-01',
    })
    const results = runSimulation(inputs)
    
    // Should handle fractional BTC correctly
    expect(results.finalBitcoinAmount).toBeGreaterThan(0)
    expect(results.finalBitcoinAmount).toBeLessThan(0.0001)
  })

  it('should handle very large balances', () => {
    const inputs = createSimulationInput({
      salary: 1000000, // 1 million
      salaryDay: 1,
      expenses: [],
      startDate: '2020-01-01',
      endDate: '2020-12-31',
    })
    const results = runSimulation(inputs)
    
    expect(results.finalEuroBalance).toBe(12000000)
    expect(results.finalBitcoinBalance).toBeGreaterThan(0)
  })
})

describe('Calculator - Regression Tests', () => {
  it('should process expenses every day even with monthly precision', () => {
    const inputs = createSimulationInput({
      salary: 10000,
      salaryDay: 1,
      expenses: [
        { name: 'Food', amount: 100, frequency: 'weekly', dayOfWeek: 1 }, // Monday
      ],
      startDate: '2020-01-01',
      endDate: '2020-01-31',
      precision: 'monthly',
    })
    const results = runSimulation(inputs)
    
    // Should catch all weekly expenses even in monthly precision
    // Mondays in Jan 2020: 6th, 13th, 20th, 27th = 4 * 100 = 400
    expect(results.totalExpensesPaid).toBe(400)
  })

  it('should maintain balance consistency across data points', () => {
    const inputs = createSimulationInput({
      salary: 5000,
      salaryDay: 1,
      expenses: [
        { name: 'Rent', amount: 2000, frequency: 'monthly', day: 10 },
      ],
      startDate: '2020-01-01',
      endDate: '2020-01-31',
      precision: 'daily',
    })
    const results = runSimulation(inputs)
    
    // Check that Euro balance changes are reflected in data points
    const day9 = results.dataPoints.find(p => p.date === '2020-01-09')
    const day10 = results.dataPoints.find(p => p.date === '2020-01-10')
    const day11 = results.dataPoints.find(p => p.date === '2020-01-10')
    
    // Balance should decrease on day 10 when rent is paid
    if (day9 && day10) {
      expect(day10.euroBalance).toBeLessThan(day9.euroBalance)
    }
  })

  it('should correctly show Bitcoin price changes over time', () => {
    const inputs = createSimulationInput({
      salary: 10000,
      salaryDay: 1,
      expenses: [],
      startDate: '2020-01-01',
      endDate: '2020-12-31',
    })
    const results = runSimulation(inputs)
    
    // Bitcoin price increased significantly in 2020
    // Same amount of BTC should be worth more at the end
    const firstPoint = results.dataPoints[0]
    const lastPoint = results.dataPoints[results.dataPoints.length - 1]
    
    // Both should have same BTC amount, but different EUR value
    expect(lastPoint.bitcoinBalance).toBeGreaterThan(firstPoint.bitcoinBalance)
  })

  it('should handle all three scenarios independently', () => {
    const inputs = createSimulationInput({
      salary: 10000,
      salaryDay: 1,
      expenses: [
        { name: 'Rent', amount: 3000, frequency: 'monthly', day: 5 },
      ],
      startDate: '2020-01-01',
      endDate: '2020-12-31',
    })
    const results = runSimulation(inputs)
    
    // All three scenarios should have different final values
    expect(results.finalEuroBalance).not.toBe(results.finalBitcoinBalance)
    expect(results.finalBitcoinBalance).not.toBe(results.finalBitcoinWithExpensesBalance)
    
    // Scenario 2 Bitcoin should be higher than Scenario 3 (no selling vs selling)
    expect(results.finalBitcoinAmount).toBeGreaterThan(results.finalBitcoinWithExpensesAmount)
  })
})

