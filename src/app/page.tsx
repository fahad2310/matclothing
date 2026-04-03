import { HeroSection } from "@/components/sections/HeroSection";
import { MarqueeBanner } from "@/components/sections/MarqueeBanner";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { CategoryShowcase } from "@/components/sections/CategoryShowcase";
import { BrandStory } from "@/components/sections/BrandStory";
import { Newsletter } from "@/components/sections/Newsletter";
import { SparklesCursor } from "@/components/animations/SparklesCursor";
import { GlowingCursor } from "@/components/animations/GlowingCursor";

export default function Home() {
  return (
    <div className="flex flex-col">
      <SparklesCursor />
      <GlowingCursor />
      <HeroSection />
      <MarqueeBanner />
      <FeaturedProducts />
      <CategoryShowcase />
      <BrandStory />
      <Newsletter />
    </div>
  );
}
