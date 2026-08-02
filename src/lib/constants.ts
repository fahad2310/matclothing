export const SITE_NAME = "Brand Industrys";

/**
 * The wordmark splits into two typographic halves, per the brand logo:
 * "brand" set in an italic high-contrast serif, "industrys" in a heavy
 * geometric sans. See components/ui/Wordmark.tsx.
 */
export const WORDMARK = { serif: "brand", sans: "industrys" } as const;

export const FOUNDED_YEAR = 2023;

export const SITE_DESCRIPTION =
  "Considered clothing, watches, and shoes. Made in Mumbai, ordered over WhatsApp.";

/** Sits under the wordmark. Short enough to read before the scroll starts. */
export const SITE_TAGLINE = "A study in restraint.";

export const WHATSAPP_NUMBER = "918291681655";
export const SITE_URL = "https://brandindustrys.com"; // Replace with actual domain
export const CURRENCY = "INR";

/** Stamped on the care label across the site. */
export const ORIGIN = "Made in Mumbai";
export const SEASON = "SS26";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/contact" },
] as const;

export const CATEGORIES = [
  { slug: "clothing", label: "Clothing", description: "Premium streetwear & essentials" },
  { slug: "watches", label: "Watches", description: "Timepieces that make a statement" },
  { slug: "shoes", label: "Shoes", description: "Step into style" },
] as const;

/**
 * All three accounts belong to Brand Industrys — one house, three feeds.
 */
export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/brand_industrys",
} as const;

export const INSTAGRAM_ACCOUNTS = [
  { handle: "brand_industrys", label: "Main", url: "https://www.instagram.com/brand_industrys" },
  {
    handle: "stylish_factories",
    label: "Stylish Factories",
    url: "https://www.instagram.com/stylish_factories",
  },
  {
    handle: "imp_warehouse",
    label: "IMP Warehouse",
    url: "https://www.instagram.com/imp_warehouse",
  },
] as const;
