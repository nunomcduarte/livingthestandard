"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ChartDataPoint {
  period: string
  euro: number
  bitcoin: number
  bitcoinWithExpenses: number
}

interface ComparisonChartProps {
  data: ChartDataPoint[]
}

export function ComparisonChart({ data }: ComparisonChartProps) {
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="period"
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value) => {
              // Format date string for display
              const date = new Date(value)
              return date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
            }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            formatter={(value: number) =>
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
              }).format(value)
            }
            labelFormatter={(label) => {
              const date = new Date(label)
              return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="euro"
            stroke="#003399"
            strokeWidth={2}
            dot={false}
            name="Euro Savings"
          />
          <Line
            type="monotone"
            dataKey="bitcoinWithExpenses"
            stroke="#f7931a"
            strokeWidth={3}
            dot={false}
            name="Bitcoin Savings"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
