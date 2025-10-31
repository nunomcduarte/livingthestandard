import { SimulatorHero } from "@/components/simulator-hero"
import { SimulatorForm } from "@/components/simulator-form"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <SimulatorHero />
      <SimulatorForm />
      <Footer />
    </main>
  )
}
