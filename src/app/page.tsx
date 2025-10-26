import { SimulatorHero } from "@/components/simulator-hero"
import { SimulatorForm } from "@/components/simulator-form"
import { EducationalSection } from "@/components/educational-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <SimulatorHero />
      <SimulatorForm />
      <EducationalSection />
      <Footer />
    </main>
  )
}
