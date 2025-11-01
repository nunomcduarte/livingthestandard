"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Plus, Trash2 } from "lucide-react"
import { SimulatorResults } from "@/components/simulator-results"
import type { SimulationInputs, Expense } from "@/lib/calculator"
import { loadBitcoinPrices, isPriceDataLoaded } from "@/lib/bitcoin-data"

export function SimulatorForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [inputs, setInputs] = useState<SimulationInputs>({
    salary: 3000,
    salaryDay: 1,
    salaryGrowthRate: 0.03,
    expenses: [
      { name: "Rent", amount: 800, frequency: "monthly", day: 5 },
      { name: "Groceries", amount: 400, frequency: "monthly", day: 15 },
    ],
    expenseInflationRate: 0.02,
    startDate: "2020-01-01",
    endDate: "2024-01-01",
    precision: "monthly",
  })
  const [showResults, setShowResults] = useState(false)

  // Load Bitcoin price data on mount
  useEffect(() => {
    async function loadPriceData() {
      try {
        const response = await fetch('/btc_euro_price.csv')
        const csvText = await response.text()
        loadBitcoinPrices(csvText)
        setDataLoaded(true)
      } catch (error) {
        console.error('Failed to load Bitcoin price data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!isPriceDataLoaded()) {
      loadPriceData()
    } else {
      setIsLoading(false)
      setDataLoaded(true)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowResults(true)
  }

  const handleReset = () => {
    setShowResults(false)
  }

  const addExpense = () => {
    setInputs({
      ...inputs,
      expenses: [...inputs.expenses, { name: "", amount: 0, frequency: "monthly", day: 1 }],
    })
  }

  const removeExpense = (index: number) => {
    setInputs({
      ...inputs,
      expenses: inputs.expenses.filter((_, i) => i !== index),
    })
  }

  const updateExpense = (index: number, field: keyof Expense, value: string | number) => {
    const newExpenses = [...inputs.expenses]
    newExpenses[index] = { ...newExpenses[index], [field]: value }
    setInputs({ ...inputs, expenses: newExpenses })
  }

  // Show loading state while data loads
  if (isLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-lg font-medium">Loading Bitcoin price data...</p>
            <p className="text-sm text-muted-foreground">Loading 10+ years of historical data</p>
          </div>
        </div>
      </section>
    )
  }

  if (showResults) {
    return <SimulatorResults inputs={inputs} onReset={handleReset} />
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Run Your Simulation</CardTitle>
            <CardDescription className="text-base mt-2">
              Enter your detailed financial information to compare Bitcoin vs Euro scenarios
              {dataLoaded && <span className="block text-green-600 mt-1">✓ Real Bitcoin price data loaded (2015-2025)</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Salary Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2">Salary Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="salary" className="text-base font-medium">
                      Monthly Salary (€)
                    </Label>
                    <Input
                      id="salary"
                      type="number"
                      min="0"
                      step="100"
                      value={inputs.salary}
                      onChange={(e) => setInputs({ ...inputs, salary: Number(e.target.value) })}
                      className="text-lg h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salaryDay" className="text-base font-medium">
                      Salary Payment Day
                    </Label>
                    <Select
                      value={inputs.salaryDay.toString()}
                      onValueChange={(value) => setInputs({ ...inputs, salaryDay: Number(value) })}
                    >
                      <SelectTrigger id="salaryDay" className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            Day {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salaryGrowth" className="text-base font-medium">
                    Yearly Salary Growth Rate (%)
                  </Label>
                  <Input
                    id="salaryGrowth"
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={inputs.salaryGrowthRate * 100}
                    onChange={(e) => setInputs({ ...inputs, salaryGrowthRate: Number(e.target.value) / 100 })}
                    className="text-lg h-12"
                    required
                  />
                  <p className="text-sm text-muted-foreground">Expected annual salary increase</p>
                </div>
              </div>

              {/* Expense Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-xl font-semibold">Recurring Expenses</h3>
                  <Button type="button" onClick={addExpense} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Expense
                  </Button>
                </div>

                <div className="space-y-4">
                  {inputs.expenses.map((expense, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Name</Label>
                          <Input
                            value={expense.name}
                            onChange={(e) => updateExpense(index, "name", e.target.value)}
                            placeholder="e.g., Rent"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Amount (€)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="10"
                            value={expense.amount}
                            onChange={(e) => updateExpense(index, "amount", Number(e.target.value))}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Frequency</Label>
                          <Select
                            value={expense.frequency}
                            onValueChange={(value) => updateExpense(index, "frequency", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">
                            {expense.frequency === "monthly" ? "Day of Month" : "Day of Week"}
                          </Label>
                          <div className="flex gap-2">
                            {expense.frequency === "monthly" ? (
                              <Select
                                value={expense.day?.toString() || "1"}
                                onValueChange={(value) => updateExpense(index, "day", Number(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                    <SelectItem key={day} value={day.toString()}>
                                      {day}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Select
                                value={expense.dayOfWeek?.toString() || "1"}
                                onValueChange={(value) => updateExpense(index, "dayOfWeek", Number(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Sunday</SelectItem>
                                  <SelectItem value="1">Monday</SelectItem>
                                  <SelectItem value="2">Tuesday</SelectItem>
                                  <SelectItem value="3">Wednesday</SelectItem>
                                  <SelectItem value="4">Thursday</SelectItem>
                                  <SelectItem value="5">Friday</SelectItem>
                                  <SelectItem value="6">Saturday</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeExpense(index)}
                              disabled={inputs.expenses.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Inflation Settings */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2">Inflation Settings</h3>
                <div className="space-y-2">
                  <Label htmlFor="expenseInflation" className="text-base font-medium">
                    Expense Inflation Rate (%)
                  </Label>
                  <Input
                    id="expenseInflation"
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={inputs.expenseInflationRate * 100}
                    onChange={(e) => setInputs({ ...inputs, expenseInflationRate: Number(e.target.value) / 100 })}
                    className="text-lg h-12"
                    required
                  />
                  <p className="text-sm text-muted-foreground">Annual rate at which your expenses increase</p>
                </div>
              </div>

              {/* Timeframe */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2">Simulation Timeframe</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-base font-medium">
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={inputs.startDate}
                      onChange={(e) => setInputs({ ...inputs, startDate: e.target.value })}
                      className="text-lg h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-base font-medium">
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={inputs.endDate}
                      onChange={(e) => setInputs({ ...inputs, endDate: e.target.value })}
                      className="text-lg h-12"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold">
                <Calculator className="mr-2 h-5 w-5" />
                Calculate My Scenario
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
