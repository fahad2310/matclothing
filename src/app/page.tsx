import { HeroSection } from "@/components/sections/HeroSection";
import { MarqueeBanner } from "@/components/sections/MarqueeBanner";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { CategoryShowcase } from "@/components/sections/CategoryShowcase";
import { BrandStory } from "@/components/sections/BrandStory";
import { Newsletter } from "@/components/sections/Newsletter";
import { getAllProducts } from "@/services/productService";

export default async function Home() {
  const products = await getAllProducts();

  return (
    <div className="flex flex-col">
      <HeroSection products={products} />
      <MarqueeBanner />
      <FeaturedProducts />
      <CategoryShowcase />
      <BrandStory />
      <Newsletter />
    </div>
  );
}
