import { test, expect } from "@playwright/test";

test.describe("Layout - Navbar", () => {
  test("renders logo and nav links", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.getByRole("link", { name: /MAT/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Shop" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Contact" })).toBeVisible();
  });

  test("cart icon is visible and links to cart", async ({ page }) => {
    await page.goto("/");
    const cartLink = page.getByRole("link", { name: /cart/i });
    await expect(cartLink).toBeVisible();
    await cartLink.click();
    await expect(page).toHaveURL("/cart");
  });

  test("nav links navigate to correct pages", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Shop" }).click();
    await expect(page).toHaveURL("/shop");

    await page.getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL("/contact");

    await page.getByRole("link", { name: /MAT/i }).first().click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("Layout - Footer", () => {
  test("renders footer with brand and links", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator("footer").getByText(/All rights reserved/)).toBeVisible();
  });
});

test.describe("Layout - Mobile Menu", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("mobile menu toggles open and close", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: /toggle menu/i });
    await expect(menuButton).toBeVisible();

    // Open menu
    await menuButton.click();
    await expect(page.locator("nav").filter({ hasText: "Home" }).last()).toBeVisible();

    // Close menu by clicking a link
    await page.getByRole("link", { name: "Shop" }).last().click();
    await expect(page).toHaveURL("/shop");
  });
});
