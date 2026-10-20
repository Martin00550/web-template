import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";

const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "--host",
    "127.0.0.1",
    "--port",
    "4175",
    "--strictPort",
  ],
  { stdio: "pipe" },
);
const base = "http://127.0.0.1:4175";
let browser;
try {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {}
    if (attempt === 99) throw new Error("Development server did not start");
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const executablePath =
    process.env.CHROMIUM_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
  browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const failedRequests = [];
  page.on("response", (r) => {
    if (r.status() >= 400) failedRequests.push(r.url());
  });
  await page.goto(base);
  assert.equal(await page.locator("h1").count(), 1);
  assert.match(
    await page.locator("#price-result").textContent(),
    /\$4,200.*\$5,700/,
  );
  for (const width of [320, 390, 600, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      `horizontal overflow at ${width}px`,
    );
    const price = await page
      .locator(".price")
      .evaluate((el) => ({ scroll: el.scrollWidth, width: el.clientWidth }));
    assert.ok(price.scroll <= price.width, `price overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  assert.equal(await page.locator("#mobile-nav").isVisible(), true);
  await page.locator('#mobile-nav a[href="#services"]').click();
  assert.equal(await page.locator("#mobile-nav").isVisible(), false);
  await page.locator("#length").fill("200");
  await page.locator("#height").selectOption("8");
  await page.locator("#gates").selectOption("2");
  await page.locator("#removal").check();
  assert.match(
    await page.locator("#price-result").textContent(),
    /\$8,100.*\$11,400/,
  );
  assert.match(
    await page.locator("#inquiry-details").textContent(),
    /200 linear ft.*2 gates.*Removal included/,
  );
  await page.locator("#length").fill("0");
  assert.match(
    await page.locator("#calculator-error").textContent(),
    /10 to 1000/,
  );
  assert.equal(await page.locator(".price").count(), 0);
  await page.locator("#length").fill("150");
  await page.locator('a[data-type="vinyl"]').click();
  assert.equal(
    await page.locator('input[name="type"]:checked').inputValue(),
    "vinyl",
  );
  await page.locator("#name").fill("Demo Tester");
  await page.locator("#contact-value").fill("tester@example.com");
  await page.locator("#location").fill("78704");
  let deliveries = 0;
  page.on("request", (r) => {
    if (r.method() === "POST") deliveries++;
  });
  await page.locator('#inquiry button[type="submit"]').click();
  assert.match(
    await page.locator("#form-status").textContent(),
    /Nothing was sent/,
  );
  assert.equal(deliveries, 0);
  await page.locator('#inquiry input[value="phone"]').check();
  await page.locator("#contact-value").fill("abc");
  await page.locator('#inquiry button[type="submit"]').click();
  assert.match(
    await page.locator("#form-status").textContent(),
    /valid phone number/,
  );
  for (const href of await page
    .locator('a[href^="#"]')
    .evaluateAll((els) =>
      els.map((el) => el.getAttribute("href")).filter((h) => h.length > 1),
    )) {
    assert.equal(
      await page.locator(href).count(),
      1,
      `missing navigation target ${href}`,
    );
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
    "auto",
  );
  const footer = page.locator(".footer-bottom");
  await footer.scrollIntoViewIfNeeded();
  assert.ok(
    (await footer.boundingBox()).y + (await footer.boundingBox()).height <=
      (await page.locator(".mobile-action-bar").boundingBox()).y,
    "bottom bar obscures footer",
  );
  mkdirSync("test-results", { recursive: true });
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  assert.deepEqual(errors, []);
  assert.deepEqual(failedRequests, []);
  console.log(
    "PASS: six viewport widths, calculator arithmetic and validation, inquiry carryover, demo form, phone validation, navigation, images, reduced motion and unobstructed footer.",
  );

  async function configuredPage(extra) {
    const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await p.route("**/src/client-config.js*", async (route) => {
      const original = await route.fetch();
      await route.fulfill({
        response: original,
        body: (await original.text()) + "\n" + extra,
      });
    });
    return p;
  }
  const noPricing = await configuredPage("client.pricing = null;");
  await noPricing.goto(base);
  assert.equal(await noPricing.locator(".price").count(), 0);
  assert.match(
    await noPricing.locator("#price-result").textContent(),
    /not available/,
  );
  await noPricing.close();
  const configured = await configuredPage(
    `client.demo=false;client.business.approved=true;client.business.phone='+1 (512) 555-0147';client.services.forEach(s=>s.sample=false);client.contact.mode='endpoint';client.contact.endpoint='/test-quote';`,
  );
  let payload;
  let submitted = 0;
  await configured.route("**/test-quote", async (route) => {
    submitted++;
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: submitted === 1 ? 500 : 200,
      contentType: "application/json",
      body: "{}",
    });
  });
  await configured.goto(base);
  assert.equal(await configured.locator(".demo-banner").count(), 0);
  assert.equal(await configured.locator('meta[name="robots"]').count(), 0);
  assert.equal(
    await configured.locator(".price").count(),
    0,
    "unapproved rates must be hidden in production",
  );
  assert.equal(
    await configured
      .locator('.header-actions a[href^="tel:"]')
      .getAttribute("href"),
    "tel:+15125550147",
  );
  assert.equal(
    await configured.locator("#our-work").textContent(),
    "",
    "no fabricated completed projects in production",
  );
  await configured.locator("#name").fill("Demo Tester");
  await configured.locator("#contact-value").fill("tester@example.com");
  await configured.locator("#location").fill("78704");
  await configured.locator('#inquiry button[type="submit"]').click();
  await configured.waitForFunction(() =>
    document
      .querySelector("#form-status")
      .textContent.includes("could not confirm"),
  );
  assert.equal(
    await configured.locator('#inquiry button[type="submit"]').isEnabled(),
    true,
  );
  await configured.locator('#inquiry button[type="submit"]').click();
  await configured.waitForFunction(() =>
    document.querySelector("#form-status").textContent.includes("accepted"),
  );
  assert.equal(payload.project.length, 150);
  assert.equal(payload.estimate.available, false);
  assert.equal(submitted, 2);
  assert.equal(
    await configured.locator('#inquiry button[type="submit"]').isDisabled(),
    true,
  );
  await configured.close();
  const blocked = await configuredPage("client.demo=false;");
  await blocked.goto(base);
  assert.match(
    await blocked.locator("h1").textContent(),
    /setup is incomplete/,
  );
  await blocked.close();
  console.log(
    "PASS: no-pricing fallback, production launch guard, optional content, configured phone links, endpoint delivery failure/retry/success, submission payload and duplicate prevention.",
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
