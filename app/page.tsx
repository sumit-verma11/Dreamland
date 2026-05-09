import { AiFeatures } from "@/components/home/ai-features";
import { FeaturedProperties } from "@/components/home/featured-properties";
import { Footer } from "@/components/home/footer";
import { Hero } from "@/components/home/hero";
import { NewProjects } from "@/components/home/new-projects";
import { Testimonials } from "@/components/home/testimonials";
import { TrendingCities } from "@/components/home/trending-cities";
import { Navbar } from "@/components/nav/navbar";

export default async function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedProperties />
        <TrendingCities />
        <AiFeatures />
        <NewProjects />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
