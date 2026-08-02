import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Admin journeys — the full lifecycle of a piece.
 *
 * These write to whatever database the dev server is pointed at, so each
 * spec cleans up the product it creates. Names are suffixed per worker to
 * keep parallel runs from colliding.
 */

const PASSWORD = process.env.ADMIN_PASSWORD || "shaheer";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  const field = page.locator('input[type="password"]');
  if (await field.count()) {
    await field.fill(PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/admin(?!\/login)/, { timeout: 15000 });
  }
}

/** A tiny valid PNG, so uploads are exercised without a fixture file. */
function pngFixture() {
  const base64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  return { name: "test-piece.png", mimeType: "image/png", buffer: Buffer.from(base64, "base64") };
}

test.describe("Admin access", () => {
  test("admin routes redirect to login when signed out", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("a wrong password does not grant access", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator('input[type="password"]').fill("definitely-not-it");
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("the correct password reaches the dashboard", async ({ page }) => {
    await signIn(page);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: /your catalogue/i })).toBeVisible();
  });
});

test.describe("Product lifecycle", () => {
  // These mutate shared catalogue rows and restore them afterwards, so they
  // must not interleave with each other.
  test.describe.configure({ mode: "serial" });

  test("create a piece with a photo and stock, then delete it", async ({
    page,
  }, testInfo) => {
    test.setTimeout(90000);
    await signIn(page);

    const name = `E2E Piece ${testInfo.workerIndex}-${testInfo.repeatEachIndex}`;

    await page.goto("/admin/products/new");
    await page.locator("#name").fill(name);
    await page.locator("#description").fill("Created by the end-to-end suite.");
    await page.locator("#price").fill("4321");
    await page.locator("#material").fill("100% cotton");
    await page.locator("#weightGsm").fill("340");
    await page.locator("#color-0").fill("Test Ecru");

    // Upload a photo through the real uploader.
    await page.locator('input[type="file"]').setInputFiles(pngFixture());
    await expect(page.getByText("Cover")).toBeVisible({ timeout: 30000 });

    // Give one size real stock so the piece is buyable.
    const sizeInput = page.getByLabel("Stock for size M");
    await sizeInput.fill("7");

    await page.getByRole("button", { name: /add to catalogue/i }).click();
    await page.waitForURL(/\/admin\/products$/, { timeout: 30000 });

    // It should now be listed, with its stock.
    const row = page.locator("li").filter({ hasText: name });
    await expect(row).toBeVisible();
    await expect(row).toContainText("7 in stock");
    await expect(row).toContainText("₹4,321");

    // …and reachable on the storefront.
    await page.goto("/shop");
    await expect(page.getByText(name)).toBeVisible();

    // Clean up: delete is behind a confirmation.
    await page.goto("/admin/products");
    const target = page.locator("li").filter({ hasText: name });
    await target.getByRole("button", { name: "Delete", exact: true }).click();
    await target.getByRole("button", { name: /delete for good/i }).click();
    await page.waitForTimeout(2500);
    await expect(page.locator("li").filter({ hasText: name })).toHaveCount(0);
  });

  test("hiding a piece removes it from the shop and showing restores it", async ({
    page,
  }) => {
    test.setTimeout(90000);
    await signIn(page);
    await page.goto("/admin/products");

    const rows = page.locator("li").filter({ hasText: /in stock|sold out/i });
    test.skip((await rows.count()) === 0, "catalogue is empty");

    const row = rows.first();
    const title = (await row.locator("p").first().textContent())?.trim() ?? "";
    test.skip(!title, "could not read a product name");

    await row.getByRole("button", { name: "Hide", exact: true }).click();
    await page.waitForTimeout(2500);
    await expect(
      page.locator("li").filter({ hasText: title }).getByText("Hidden"),
    ).toBeVisible();

    await page.goto("/shop");
    await expect(page.getByText(title, { exact: true })).toHaveCount(0);

    // Restore, so the test leaves the catalogue as it found it.
    await page.goto("/admin/products");
    await page
      .locator("li")
      .filter({ hasText: title })
      .getByRole("button", { name: "Show", exact: true })
      .click();
    await page.waitForTimeout(2500);
    await page.goto("/shop");
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
  });

  test("featuring a piece puts it on the homepage", async ({ page }) => {
    test.setTimeout(90000);
    await signIn(page);
    await page.goto("/admin/products");

    const unfeatured = page
      .locator("li")
      .filter({ has: page.getByRole("button", { name: "Feature", exact: true }) });
    test.skip((await unfeatured.count()) === 0, "everything is already featured");

    const row = unfeatured.first();
    const title = (await row.locator("p").first().textContent())?.trim() ?? "";

    await row.getByRole("button", { name: "Feature", exact: true }).click();
    await page.waitForTimeout(2500);

    await page.goto("/");
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible();

    // Put it back.
    await page.goto("/admin/products");
    await page
      .locator("li")
      .filter({ hasText: title })
      .getByRole("button", { name: "Unfeature", exact: true })
      .click();
    await page.waitForTimeout(2000);
  });

  test("search narrows the catalogue", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/products");

    const rows = page.locator("li").filter({ hasText: /in stock|sold out/i });
    const total = await rows.count();
    test.skip(total === 0, "catalogue is empty");

    await page.locator("#product-search").fill("zzzz-no-such-piece");
    await page.waitForTimeout(500);
    await expect(page.getByText(/nothing matches/i)).toBeVisible();

    await page.locator("#product-search").fill("");
    await page.waitForTimeout(500);
    expect(await rows.count()).toBe(total);
  });
});

test.describe("Upload security", () => {
  test("uploading without a session is rejected", async ({ request }) => {
    const res = await request.post("/api/upload", {
      multipart: { file: pngFixture() },
    });
    expect(res.status()).toBe(401);
  });
});
