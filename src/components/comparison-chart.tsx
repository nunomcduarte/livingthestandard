"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ChartDataPoint {
  period: string
  euro: number
  bitcoin: number
  bitcoinWithExpenses: number
  bitcoinPrice: number
}

interface ComparisonChartProps {
  data: ChartDataPoint[]
}

export function ComparisonChart({ data }: ComparisonChartProps) {
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 80, left: 20, bottom: 5 }}>
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
            yAxisId="left"
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            className="text-xs"
            tick={{ fill: "#10b981" }}
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
            label={{ 
              value: 'BTC Price', 
              angle: -90, 
              position: 'insideRight',
              style: { fill: '#10b981', fontSize: '12px' }
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            formatter={(value: number, name: string) => {
              if (name === "Bitcoin Price") {
                return [
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "EUR",
                    minimumFractionDigits: 0,
                  }).format(value),
                  name
                ]
              }
              return [
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "EUR",
                  minimumFractionDigits: 0,
                }).format(value),
                name
              ]
            }}
            labelFormatter={(label) => {
              const date = new Date(label)
              return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="euro"
            stroke="#003399"
            strokeWidth={2}
            dot={false}
            name="Euro Savings"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="bitcoinWithExpenses"
            stroke="#f7931a"
            strokeWidth={3}
            dot={false}
            name="Bitcoin Savings"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="bitcoinPrice"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            name="Bitcoin Price"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
