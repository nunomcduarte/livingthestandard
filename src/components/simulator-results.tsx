"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, TrendingDown, AlertCircle, Share2 } from "lucide-react"
import { ComparisonChart } from "@/components/comparison-chart"
import { runSimulation, formatCurrency, formatPercentage, formatBitcoin, type SimulationInputs } from "@/lib/calculator"
import { Badge } from "@/components/ui/badge"

interface SimulatorResultsProps {
  inputs: SimulationInputs
  onReset: () => void
}

export function SimulatorResults({ inputs, onReset }: SimulatorResultsProps) {
  const results = runSimulation(inputs)

  const startYear = new Date(inputs.startDate).getFullYear()
  const endYear = new Date(inputs.endDate).getFullYear()
  const yearsDiff = endYear - startYear

  const handleShare = async () => {
    const text = `I just simulated ${yearsDiff} years of living on Bitcoin vs Euro. The difference is eye-opening! Try it yourself:`
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title: "Live the Standard Simulator", text, url })
      } catch (err) {
        console.log("Share cancelled")
      }
    } else {
      navigator.clipboard.writeText(`${text} ${url}`)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <Button variant="ghost" onClick={onReset} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            New Simulation
          </Button>
          <Button variant="outline" onClick={handleShare} className="gap-2 bg-transparent">
            <Share2 className="h-4 w-4" />
            Share Results
          </Button>
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2 text-balance">Your Simulation Results</h2>
          <p className="text-muted-foreground">
            {inputs.startDate} to {inputs.endDate} ({yearsDiff} years)
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Euro Savings</CardTitle>
                <Badge variant="secondary" className="text-sm">
                  Fiat Standard
                </Badge>
              </div>
              <CardDescription>Accumulated savings in euros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Final Balance</p>
                  <p className="text-3xl font-bold">{formatCurrency(results.finalEuroBalance)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                  <p className="text-lg font-medium text-muted-foreground">
                    {formatCurrency(results.totalSalaryReceived)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                  <p className="text-lg font-medium text-muted-foreground">
                    {formatCurrency(results.totalExpensesPaid)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Bitcoin Savings</CardTitle>
                <Badge className="bg-accent text-accent-foreground">Bitcoin Standard</Badge>
              </div>
              <CardDescription>Accumulated savings in Bitcoin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Final Balance</p>
                  <p className="text-3xl font-bold">
                    {formatBitcoin(results.finalBitcoinWithExpensesAmount)}{" "}
                    <span className="text-xl text-muted-foreground">
                      ({formatCurrency(results.finalBitcoinWithExpensesBalance)})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                  <p className="text-lg font-medium text-muted-foreground">
                    {formatBitcoin(results.totalSalaryReceivedBTC)}{" "}
                    <span className="text-sm">({formatCurrency(results.totalSalaryReceived)})</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                  <p className="text-lg font-medium text-muted-foreground">
                    {formatBitcoin(results.totalExpensesPaidBTC)}{" "}
                    <span className="text-sm">({formatCurrency(results.totalExpensesPaid)})</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Highlight */}
        <Card className="mb-8 bg-accent/10 border-accent">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">Net Difference</p>
              <p className="text-4xl font-bold mb-2">
                {formatCurrency(results.finalBitcoinWithExpensesBalance - results.finalEuroBalance)}
              </p>
              <p className="text-lg text-muted-foreground text-balance">
                {results.finalBitcoinWithExpensesBalance > results.finalEuroBalance
                  ? `You would have ${formatPercentage(results.bitcoinWithExpensesGainPercentage)} more wealth with Bitcoin`
                  : `Euro savings would have been ${formatPercentage(Math.abs(results.bitcoinWithExpensesGainPercentage))} better`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Savings Evolution Over Time</CardTitle>
            <CardDescription>Compare how your savings would have grown in both scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonChart data={results.chartData} />
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Salary Received</p>
                <p className="text-xl font-semibold">{formatCurrency(results.totalSalaryReceived)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Expenses Paid</p>
                <p className="text-xl font-semibold">{formatCurrency(results.totalExpensesPaid)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Net Savings</p>
                <p className="text-xl font-semibold text-accent">
                  {formatCurrency(results.totalSalaryReceived - results.totalExpensesPaid)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-accent font-bold">•</span>
                <p className="text-sm leading-relaxed">
                  <strong>Inflation Impact:</strong> Your expenses increased by{" "}
                  {(inputs.expenseInflationRate * 100).toFixed(1)}% annually due to inflation over{" "}
                  {yearsDiff} years, affecting your purchasing power.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">•</span>
                <p className="text-sm leading-relaxed">
                  <strong>Expense Growth:</strong> Your expenses increased by{" "}
                  {(inputs.expenseInflationRate * 100).toFixed(1)}% annually, reflecting real-world cost increases for
                  rent, groceries, and other living expenses.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">•</span>
                <p className="text-sm leading-relaxed">
                  <strong>Same Expenses, Different Currency:</strong> Both scenarios pay the same expenses - the Bitcoin
                  scenario converts savings to BTC and sells it when needed to cover costs, showing how the same lifestyle
                  would compare in different currencies.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">•</span>
                <p className="text-sm leading-relaxed">
                  <strong>Volatility Context:</strong> While Bitcoin experienced significant price swings during this
                  period, the long-term trend shows{" "}
                  {results.bitcoinWithExpensesGainPercentage > 0 ? "substantial growth" : "market cycles"} that
                  {results.bitcoinWithExpensesGainPercentage > 0 ? " outpaced" : " differed from"} traditional savings.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">•</span>
                <p className="text-sm leading-relaxed">
                  <strong>Historical Performance:</strong> This simulation uses real historical Bitcoin price data from{" "}
                  {startYear} to {endYear}. Past performance does not guarantee future results.
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
