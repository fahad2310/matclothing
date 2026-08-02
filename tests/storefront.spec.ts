import { test, expect } from "@playwright/test";

/**
 * Storefront journeys — what a customer actually does.
 *
 * These assume a seeded catalogue. They skip rather than fail when the
 * shop is empty, so the suite stays honest against an unprovisioned
 * database instead of reporting green on a site with nothing in it.
 */

/**
 * Opens the first product and waits for the detail page to be interactive.
 * Counting size buttons straight after a click races route compilation and
 * reports "no sizes" on a page that simply had not rendered yet.
 */
async function openFirstProduct(page: import("@playwright/test").Page) {
  await page.goto("/shop");
  const first = page.locator('a[href^="/shop/"]').first();
  await expect(first).toBeVisible({ timeout: 30000 });
  await first.click();
  await expect(page).toHaveURL(/\/shop\/[a-z0-9-]+/);
  await expect(page.getByRole("button", { name: /add to cart/i })).toBeVisible({
    timeout: 30000,
  });
}

/** Clicks the first size that is actually in stock. Returns false if none is. */
async function selectFirstAvailableSize(page: import("@playwright/test").Page) {
  // Scoped to the group following the "Size" label rather than matched by
  // text, so it works for XS–XXL, 38–46 and 40mm alike.
  const sizeButtons = page
    .locator("div")
    .filter({ has: page.getByText("Size", { exact: true }) })
    .last()
    .locator("button");

  const count = await sizeButtons.count();
  for (let i = 0; i < count; i++) {
    const btn = sizeButtons.nth(i);
    if (await btn.isEnabled()) {
      await btn.click();
      return true;
    }
  }
  return false;
}

test.describe("Shop", () => {
  test("lists products and filters by category", async ({ page }) => {
    // The dev server compiles routes on first hit, which can outrun the
    // default budget on a cold run.
    test.setTimeout(60000);
    await page.goto("/shop");

    const cards = page.locator('a[href^="/shop/"]');
    const total = await cards.count();
    test.skip(total === 0, "catalogue is empty — seed the database first");

    await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();

    // The filter buttons are uppercased by CSS, not in the DOM, so match
    // case-insensitively against the real text ("Watches", "All").
    const filters = page.locator("button").filter({ hasText: /^(All|Clothing|Watches|Shoes)$/ });

    // Filtering to a category must never widen the result set.
    await filters.filter({ hasText: /^Watches$/ }).click();
    await page.waitForTimeout(800);
    const watchCount = await cards.count();
    expect(watchCount).toBeGreaterThan(0);
    expect(watchCount).toBeLessThanOrEqual(total);

    await filters.filter({ hasText: /^All$/ }).click();
    await page.waitForTimeout(800);
    expect(await cards.count()).toBe(total);
  });

  test("sorting by price low to high actually orders the grid", async ({
    page,
  }) => {
    await page.goto("/shop");
    const cards = page.locator('a[href^="/shop/"]');
    test.skip((await cards.count()) === 0, "catalogue is empty");

    await page.locator("select").selectOption("price-asc");
    await page.waitForTimeout(800);

    // Discounted cards render two prices — the current one and a
    // strikethrough. Take only the first per card, or the comparison is
    // against a list that was never meant to be sorted.
    const n = await cards.count();
    const numeric: number[] = [];
    for (let i = 0; i < n; i++) {
      const text = await cards.nth(i).locator("text=/^₹/").first().textContent();
      numeric.push(Number((text ?? "").replace(/[^0-9]/g, "")));
    }

    const sorted = [...numeric].sort((a, b) => a - b);
    expect(numeric).toEqual(sorted);
  });
});

test.describe("Product page", () => {
  test("shows the care label and requires a size before adding to cart", async ({
    page,
  }) => {
    // First hit on a product route compiles it in dev, which outruns the
    // 5s default assertion budget.
    test.setTimeout(60000);
    await page.goto("/shop");
    const first = page.locator('a[href^="/shop/"]').first();
    test.skip((await first.count()) === 0, "catalogue is empty");

    await first.click();
    await expect(page).toHaveURL(/\/shop\/[a-z0-9-]+/);

    // The care label is the design signature — it must reach the PDP.
    await expect(page.getByText(/^Ref$/i)).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/Made in Mumbai/i).first()).toBeVisible();

    const addToCart = page.getByRole("button", { name: /add to cart/i });
    await expect(addToCart).toBeVisible();
    // Disabled until a size is chosen — ordering the wrong size is the
    // failure mode this guards.
    await expect(addToCart).toBeDisabled();
  });

  test("selecting a size enables add to cart and the cart count rises", async ({
    page,
  }) => {
    test.setTimeout(60000);
    await openFirstProduct(page);

    const picked = await selectFirstAvailableSize(page);
    expect(picked, "no in-stock size found on the first product").toBe(true);

    const addToCart = page.getByRole("button", { name: /add to cart/i });
    await expect(addToCart).toBeEnabled();
    await addToCart.click();

    await expect(
      page.locator("header").getByRole("link", { name: /cart/i }),
    ).toHaveAttribute("aria-label", /1 item/);
  });
});

test.describe("Cart", () => {
  test("empty cart invites the customer back to the shop", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByRole("link", { name: /continue shopping/i })).toBeVisible();
  });

  test("an added item shows with a subtotal and a WhatsApp order link", async ({
    page,
  }) => {
    test.setTimeout(60000);
    await openFirstProduct(page);

    const picked = await selectFirstAvailableSize(page);
    expect(picked, "no in-stock size found on the first product").toBe(true);

    await page.getByRole("button", { name: /add to cart/i }).click();
    await page.goto("/cart");

    await expect(page.getByText(/subtotal/i)).toBeVisible();
    // Subtotal must be a real amount, not ₹0.
    const totalText = await page.getByText(/^₹[\d,]+$/).first().textContent();
    expect(Number((totalText ?? "").replace(/[^0-9]/g, ""))).toBeGreaterThan(0);

    await expect(
      page.getByRole("button", { name: /order via whatsapp/i }),
    ).toBeVisible();
  });
});

test.describe("Theme and accessibility floor", () => {
  test("renders on warm paper, not the retired dark theme", async ({ page }) => {
    await page.goto("/");
    const bg = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(250, 248, 244)");
  });

  test("no leftover gold accent in the theme tokens", async ({ page }) => {
    await page.goto("/");

    // Scoped to the CSS custom properties, not the whole document. A gold
    // watch legitimately carries #c9a84c as its own colour swatch, so a
    // page-wide string search reports that product data as a theme leak.
    const tokens = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      return [
        "--background",
        "--foreground",
        "--surface",
        "--surface-2",
        "--accent",
        "--accent-hover",
        "--muted",
        "--border",
      ].map((name) => s.getPropertyValue(name).trim().toLowerCase());
    });

    expect(tokens).not.toContain("#c9a84c");
    expect(tokens).not.toContain("#0a0a0a");
    expect(tokens[0]).toBe("#faf8f4");
  });

  test("every image carries an alt attribute", async ({ page }) => {
    await page.goto("/shop");
    const imgs = page.locator("img");
    const n = await imgs.count();
    for (let i = 0; i < n; i++) {
      await expect(imgs.nth(i)).toHaveAttribute("alt", /.*/);
    }
  });
});
