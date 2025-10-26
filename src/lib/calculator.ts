import { getBitcoinPriceByDate } from './bitcoin-data'

export interface Expense {
  name: string
  amount: number
  frequency: "monthly" | "weekly"
  day?: number // for monthly expenses (1-31)
  dayOfWeek?: number // for weekly expenses (0-6, Sunday-Saturday)
}

export interface SimulationInputs {
  salary: number
  salaryDay: number
  salaryGrowthRate: number
  expenses: Expense[]
  expenseInflationRate: number
  startDate: string
  endDate: string
  precision: "daily" | "monthly"
}

export interface SimulationDataPoint {
  date: string
  euroBalance: number
  bitcoinBalance: number
  bitcoinAmount: number
  bitcoinWithExpensesBalance: number
  bitcoinWithExpensesAmount: number
  totalSalaryReceived: number
  totalExpensesPaid: number
}

export interface SimulationResults {
  dataPoints: SimulationDataPoint[]
  finalEuroBalance: number
  finalBitcoinBalance: number
  finalBitcoinAmount: number
  finalBitcoinWithExpensesBalance: number
  finalBitcoinWithExpensesAmount: number
  bitcoinGainPercentage: number
  bitcoinWithExpensesGainPercentage: number
  totalSalaryReceived: number
  totalExpensesPaid: number
  totalSalaryReceivedBTC: number
  totalExpensesPaidBTC: number
  chartData: Array<{
    period: string
    euro: number
    bitcoin: number
    bitcoinWithExpenses: number
  }>
}

function getBitcoinPrice(date: Date): number {
  return getBitcoinPriceByDate(date)
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function shouldPayExpense(expense: Expense, date: Date): boolean {
  if (expense.frequency === "monthly") {
    const dayOfMonth = date.getDate()
    const daysInMonth = getDaysInMonth(date.getFullYear(), date.getMonth())
    const targetDay = Math.min(expense.day || 1, daysInMonth)
    return dayOfMonth === targetDay
  } else {
    // weekly
    return date.getDay() === (expense.dayOfWeek || 0)
  }
}

function shouldPaySalary(salaryDay: number, date: Date): boolean {
  const dayOfMonth = date.getDate()
  const daysInMonth = getDaysInMonth(date.getFullYear(), date.getMonth())
  const targetDay = Math.min(salaryDay, daysInMonth)
  return dayOfMonth === targetDay
}

export function runSimulation(inputs: SimulationInputs): SimulationResults {
  const startDate = new Date(inputs.startDate)
  const endDate = new Date(inputs.endDate)

  const dataPoints: SimulationDataPoint[] = []
  
  // THREE SEPARATE SCENARIOS
  let euroOnlyBalance = 0  // Scenario 1: Keep everything in euros
  
  let bitcoinScenarioEuroBalance = 0  // Scenario 2: Convert excess to Bitcoin (no selling)
  let bitcoinAmount = 0  // Scenario 2: Bitcoin accumulated
  
  let bitcoinWithExpensesEuroBalance = 0  // Scenario 3: Buy Bitcoin, sell for expenses
  let bitcoinWithExpensesAmount = 0  // Scenario 3: Bitcoin amount (goes up and down)
  
  let totalSalaryReceived = 0
  let totalExpensesPaid = 0
  let totalSalaryReceivedBTC = 0
  let totalExpensesPaidBTC = 0

  // Track inflation multipliers
  let salaryMultiplier = 1
  let expenseMultiplier = 1

  const currentDate = new Date(startDate)
  let lastYear = startDate.getFullYear()
  let lastMonth = startDate.getMonth()

  // Simulation loop
  while (currentDate <= endDate) {
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    // Apply annual salary growth at year change
    if (currentYear > lastYear) {
      salaryMultiplier *= 1 + inputs.salaryGrowthRate
      expenseMultiplier *= 1 + inputs.expenseInflationRate
      lastYear = currentYear
    }

    const adjustedSalary = inputs.salary * salaryMultiplier
    const btcPrice = getBitcoinPrice(currentDate)

    // Check if salary should be paid
    if (shouldPaySalary(inputs.salaryDay, currentDate)) {
      // Add salary to all three scenarios
      euroOnlyBalance += adjustedSalary
      bitcoinScenarioEuroBalance += adjustedSalary
      bitcoinWithExpensesEuroBalance += adjustedSalary
      totalSalaryReceived += adjustedSalary
      totalSalaryReceivedBTC += adjustedSalary / btcPrice
    }

    // Check and pay expenses
    for (const expense of inputs.expenses) {
      if (shouldPayExpense(expense, currentDate)) {
        const adjustedExpense = expense.amount * expenseMultiplier
        
        // Scenario 1 & 2: Deduct from euro balance
        euroOnlyBalance -= adjustedExpense
        bitcoinScenarioEuroBalance -= adjustedExpense
        
        // Scenario 3: Pay from Bitcoin if needed
        if (bitcoinWithExpensesEuroBalance >= adjustedExpense) {
          // We have enough EUR cash
          bitcoinWithExpensesEuroBalance -= adjustedExpense
        } else {
          // Need to sell Bitcoin to cover expense
          const shortfall = adjustedExpense - bitcoinWithExpensesEuroBalance
          const btcToSell = shortfall / btcPrice
          
          if (bitcoinWithExpensesAmount >= btcToSell) {
            bitcoinWithExpensesAmount -= btcToSell
            bitcoinWithExpensesEuroBalance = 0 // Used all cash
          } else {
            // Sell all Bitcoin we have
            bitcoinWithExpensesEuroBalance += bitcoinWithExpensesAmount * btcPrice
            bitcoinWithExpensesAmount = 0
            // Deduct what we can afford
            if (bitcoinWithExpensesEuroBalance >= adjustedExpense) {
              bitcoinWithExpensesEuroBalance -= adjustedExpense
            } else {
              bitcoinWithExpensesEuroBalance = 0 // Go to zero (or negative in real life)
            }
          }
        }
        
        totalExpensesPaid += adjustedExpense
        totalExpensesPaidBTC += adjustedExpense / btcPrice
      }
    }

    // Scenario 2: Convert positive balance to Bitcoin (no selling back)
    if (bitcoinScenarioEuroBalance > 0) {
      const btcPrice = getBitcoinPrice(currentDate)
      const btcToBuy = bitcoinScenarioEuroBalance / btcPrice
      bitcoinAmount += btcToBuy
      bitcoinScenarioEuroBalance = 0 // All converted to Bitcoin
    }

    // Scenario 3: Convert positive balance to Bitcoin (will sell when needed)
    if (bitcoinWithExpensesEuroBalance > 0) {
      const btcPrice = getBitcoinPrice(currentDate)
      const btcToBuy = bitcoinWithExpensesEuroBalance / btcPrice
      bitcoinWithExpensesAmount += btcToBuy
      bitcoinWithExpensesEuroBalance = 0 // All converted to Bitcoin
    }

    // Calculate current Bitcoin values in EUR
    const bitcoinBalance = bitcoinAmount * btcPrice
    const bitcoinWithExpensesBalance = (bitcoinWithExpensesAmount * btcPrice) + bitcoinWithExpensesEuroBalance

    // Store data point - for good visualization we need to see balance changes
    let shouldStoreDataPoint = false
    
    if (inputs.precision === "daily") {
      // Store every day for daily precision
      shouldStoreDataPoint = true
    } else if (inputs.precision === "monthly") {
      // For monthly precision, sample every 7 days OR when month changes to show fluctuations
      const dayOfMonth = currentDate.getDate()
      const isWeeklySample = dayOfMonth % 7 === 1 // Sample every week (1st, 8th, 15th, 22nd, 29th)
      const isMonthChange = currentMonth !== lastMonth
      const isLastDay = currentDate.getTime() >= endDate.getTime()
      
      shouldStoreDataPoint = isWeeklySample || isMonthChange || isLastDay
      
      if (isMonthChange) {
        lastMonth = currentMonth
      }
    }

    if (shouldStoreDataPoint) {
      dataPoints.push({
        date: currentDate.toISOString().split("T")[0],
        euroBalance: euroOnlyBalance,
        bitcoinBalance,
        bitcoinAmount,
        bitcoinWithExpensesBalance,
        bitcoinWithExpensesAmount,
        totalSalaryReceived,
        totalExpensesPaid,
      })
    }

    // Advance date - ALWAYS advance day by day to catch all expenses
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Calculate final results
  const lastPoint = dataPoints[dataPoints.length - 1]
  const finalEuroBalance = lastPoint.euroBalance
  const finalBitcoinBalance = lastPoint.bitcoinBalance
  const finalBitcoinAmount = lastPoint.bitcoinAmount
  const finalBitcoinWithExpensesBalance = lastPoint.bitcoinWithExpensesBalance
  const finalBitcoinWithExpensesAmount = lastPoint.bitcoinWithExpensesAmount

  // Calculate gain percentages: how much better/worse Bitcoin strategies were compared to Euro
  const bitcoinGainPercentage =
    finalEuroBalance !== 0 
      ? ((finalBitcoinBalance - finalEuroBalance) / Math.abs(finalEuroBalance)) * 100 
      : finalBitcoinBalance > 0 ? 100 : 0

  const bitcoinWithExpensesGainPercentage =
    finalEuroBalance !== 0 
      ? ((finalBitcoinWithExpensesBalance - finalEuroBalance) / Math.abs(finalEuroBalance)) * 100 
      : finalBitcoinWithExpensesBalance > 0 ? 100 : 0

  // Prepare chart data (sample every N points for performance)
  const sampleRate = Math.max(1, Math.floor(dataPoints.length / 50))
  const chartData = dataPoints
    .filter((_, index) => index % sampleRate === 0 || index === dataPoints.length - 1)
    .map((point) => ({
      period: point.date,
      euro: Math.round(point.euroBalance),
      bitcoin: Math.round(point.bitcoinBalance),
      bitcoinWithExpenses: Math.round(point.bitcoinWithExpensesBalance),
    }))

  return {
    dataPoints,
    finalEuroBalance,
    finalBitcoinBalance,
    finalBitcoinAmount,
    finalBitcoinWithExpensesBalance,
    finalBitcoinWithExpensesAmount,
    bitcoinGainPercentage,
    bitcoinWithExpensesGainPercentage,
    totalSalaryReceived,
    totalExpensesPaid,
    totalSalaryReceivedBTC,
    totalExpensesPaidBTC,
    chartData,
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatBitcoin(amount: number): string {
  return amount.toFixed(2) + " ₿"
}

export function formatPercentage(value: number): string {
  return (value >= 0 ? "+" : "") + value.toFixed(1) + "%"
}
