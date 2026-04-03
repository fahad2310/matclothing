export const SITE_NAME = "MAT Clothing";
export const SITE_DESCRIPTION =
  "Premium clothing, watches, and shoes — crafted for the modern individual.";
export const WHATSAPP_NUMBER = "918291681655";
export const SITE_URL = "https://matclothing.com"; // Replace with actual domain
export const CURRENCY = "INR";

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

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/_shaheer_shaikh?igsh=MXdkYzVvYjI2em1nNA==",
} as const;
