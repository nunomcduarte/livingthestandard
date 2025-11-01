export function SimulatorHero() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
            What if you saved your entire salary into Bitcoin?
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-primary-foreground/90 text-pretty">
            Discover how your finances would have evolved if you had embraced Bitcoin instead of euros. Compare real
            scenarios, understand volatility, and see how inflation impacts your savings over time.
          </p>
        </div>
      </div>
    </section>
  )
}
