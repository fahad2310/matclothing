import { test, expect } from "@playwright/test";

/**
 * Locators are scoped to header/footer. The nav and the footer intentionally
 * link to the same pages, so page-wide role queries hit strict-mode
 * violations — that is a test-authoring issue, not a duplicate-link bug.
 */

test.describe("Layout - Navbar", () => {
  test("renders logo and nav links", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");

    await expect(header).toBeVisible();
    await expect(
      header.getByRole("link", { name: /brand industrys/i }),
    ).toBeVisible();
    await expect(header.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(header.getByRole("link", { name: "Shop" })).toBeVisible();
    await expect(header.getByRole("link", { name: "Contact" })).toBeVisible();
  });

  test("cart link shows item count and navigates to the cart", async ({
    page,
  }) => {
    await page.goto("/");
    const cartLink = page.locator("header").getByRole("link", { name: /cart/i });

    await expect(cartLink).toBeVisible();
    await expect(cartLink).toHaveAttribute("aria-label", /0 items/);

    await cartLink.click();
    await expect(page).toHaveURL("/cart");
  });

  test("nav links navigate to correct pages", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");

    await header.getByRole("link", { name: "Shop" }).click();
    await expect(page).toHaveURL("/shop");

    await header.getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL("/contact");

    await header.getByRole("link", { name: /brand industrys/i }).click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("Layout - Footer", () => {
  test("renders footer with brand and links", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");

    await expect(footer).toBeVisible();
    await expect(footer.getByText(/All rights reserved/)).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "Shop", exact: true }),
    ).toBeVisible();
  });
});

test.describe("Layout - Mobile Menu", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("mobile menu toggles open and close", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: /toggle menu/i });
    await expect(menuButton).toBeVisible();

    await menuButton.click();
    await expect(page.locator("nav").filter({ hasText: "Home" }).last()).toBeVisible();

    await page.getByRole("link", { name: "Shop" }).last().click();
    await expect(page).toHaveURL("/shop");
  });
});

test.describe("Theme", () => {
  test("renders on the warm paper palette, not the old dark theme", async ({
    page,
  }) => {
    await page.goto("/");
    const bg = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    // #faf8f4
    expect(bg).toBe("rgb(250, 248, 244)");
  });
});
