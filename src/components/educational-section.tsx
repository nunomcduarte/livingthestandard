import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, TrendingUp, Globe, Zap } from "lucide-react"

export function EducationalSection() {
  const insights = [
    {
      icon: Shield,
      title: "Understanding Volatility",
      description:
        "Bitcoin's price fluctuates significantly in the short term, but historical data shows a long-term upward trend. Volatility decreases as adoption grows.",
    },
    {
      icon: TrendingUp,
      title: "Inflation Protection",
      description:
        "With a fixed supply of 21 million coins, Bitcoin is designed to be deflationary. Unlike fiat currencies, no central authority can print more Bitcoin.",
    },
    {
      icon: Globe,
      title: "Global Accessibility",
      description:
        "Bitcoin works the same everywhere. As a freelancer or remote worker, you can receive payments and hold savings without currency conversion fees.",
    },
    {
      icon: Zap,
      title: "Financial Sovereignty",
      description:
        "You control your Bitcoin directly. No bank can freeze your account, and you can send money anywhere, anytime, without intermediaries.",
    },
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Consider Bitcoin?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Understanding the fundamentals helps you make informed decisions about your financial future
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon
            return (
              <Card key={index} className="border-2">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 mb-4">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="mt-12 bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Important Disclaimer</h3>
              <p className="leading-relaxed text-primary-foreground/90">
                This simulator uses historical data for educational purposes only. Past performance does not guarantee
                future results. Bitcoin is a volatile asset and may not be suitable for everyone. Always do your own
                research and consider consulting with a financial advisor before making investment decisions. Never
                invest more than you can afford to lose.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
