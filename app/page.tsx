import { Hero } from "@/components/marketing/Hero";
import { StatCards } from "@/components/marketing/StatCards";
import { WhyPerimenopause } from "@/components/marketing/WhyPerimenopause";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { ModelTransparency } from "@/components/marketing/ModelTransparency";
import { GpInTheLoop } from "@/components/marketing/GpInTheLoop";
import { AboutFooter } from "@/components/marketing/AboutFooter";

export default function Home() {
  return (
    <main className="bg-white">
      <Hero />
      <StatCards />
      <WhyPerimenopause />
      <HowItWorks />
      <ModelTransparency />
      <GpInTheLoop />
      <AboutFooter />
    </main>
  );
}
