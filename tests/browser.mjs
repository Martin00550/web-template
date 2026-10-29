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
  const failedRequests = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) failedRequests.push(r.url());
  });
  await page.goto(base);
  assert.equal(await page.locator("h1").count(), 1);
  assert.equal(await page.locator('a[href^="tel:"]').count(), 0);
  assert.equal(await page.locator('a[href^="mailto:"]').count(), 0);
  assert.match(
    await page.locator(".contact-copy").textContent(),
    /\[Phone\].*\[Email\]/s,
  );
  assert.equal(
    await page.locator("main > section:nth-child(2)").getAttribute("id"),
    "our-work",
  );
  assert.equal(
    await page.locator(".hero-actions .button").getAttribute("href"),
    "#contact",
  );
  assert.match(
    await page.locator("body").textContent(),
    /Example Painting Co\./,
  );
  assert.match(
    await page.locator(".hero").textContent(),
    /Interior & exteriorpainting in \[City\]/,
  );
  assert.doesNotMatch(
    await page.locator("body").textContent(),
    /concrete|driveway|walkway|McKinney|Texas|square feet|sq ft|USD/i,
  );
  assert.match(
    await page.locator("#price-result").textContent(),
    /\$720.*\$1,120/,
  );
  assert.equal(await page.locator(".project-card").count(), 4);
  for (const width of [320, 390, 600, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      `horizontal overflow at ${width}px`,
    );
    assert.ok(
      await page
        .locator(".price")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
      `price overflow at ${width}px`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  assert.equal(await page.locator("#mobile-nav").isVisible(), true);
  await page.locator('#mobile-nav a[href="#services"]').click();
  assert.equal(await page.locator("#mobile-nav").isVisible(), false);
  await page.locator('input[name="measurement"][value="dimensions"]').check();
  await page.locator("#length").fill("5");
  await page.locator("#width").fill("8");
  await page.locator("#preparation").selectOption("extra");
  assert.match(await page.locator("#dimension-area").textContent(), /40 m²/);
  assert.match(
    await page.locator("#price-result").textContent(),
    /\$960.*\$1,520/,
  );
  assert.match(
    await page.locator("#inquiry-details").textContent(),
    /40 m².*5 × 8 m.*Extra preparation/,
  );
  await page.locator("#width").fill("0");
  assert.match(
    await page.locator("#calculator-error").textContent(),
    /surface width and height/,
  );
  assert.equal(await page.locator(".price").count(), 0);
  await page.locator("#width").fill("8");
  await page.locator('input[name="measurement"][value="area"]').check();
  assert.equal(await page.locator("#area").inputValue(), "40");
  await page.locator("#area").fill("0");
  assert.match(
    await page.locator("#calculator-error").textContent(),
    /5 to 1000 square metres/,
  );
  await page.locator("#area").fill("1000");
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(
      await page
        .locator(".price")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
      `large range overflow at ${width}px`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#area").fill("40");
  await page.locator('a[data-type="exterior"]').click();
  assert.equal(
    await page.locator('input[name="type"]:checked').inputValue(),
    "exterior",
  );
  await page.locator(".project-open").first().click();
  assert.equal(await page.locator("#project-dialog").isVisible(), true);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#project-dialog").isVisible(), false);
  await page.locator('a[data-type="joinery"]').click();
  assert.equal(await page.locator(".price").count(), 0);
  assert.equal(await page.locator("#priced-controls").isVisible(), false);
  assert.match(
    await page.locator("#inquiry-details").textContent(),
    /Doors & trim.*Individual quote/,
  );
  await page.locator('a[data-type="interior"]').click();
  await page.locator("#name").fill("Demo Tester");
  await page.locator("#contact-value").fill("tester@example.com");
  await page.locator("#location").fill("6011");
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
  await page.locator("#contact-value").fill(".......");
  await page.locator('#inquiry button[type="submit"]').click();
  assert.match(
    await page.locator("#form-status").textContent(),
    /valid phone number/,
  );
  for (const href of await page
    .locator('a[href^="#"]')
    .evaluateAll((els) =>
      els.map((el) => el.getAttribute("href")).filter((h) => h.length > 1),
    ))
    assert.equal(await page.locator(href).count(), 1, `missing target ${href}`);
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
    "auto",
  );
  const footer = page.locator(".footer-bottom");
  await footer.scrollIntoViewIfNeeded();
  assert.equal(await page.locator(".mobile-action-bar").count(), 0);
  assert.ok(
    (await footer.boundingBox()).y + (await footer.boundingBox()).height <=
      page.viewportSize().height + 1,
    "footer extends beyond the mobile viewport",
  );
  await page.reload();
  for (const image of await page.locator(".project-grid img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((el) => el.decode());
  }
  mkdirSync("test-results", { recursive: true });
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  assert.deepEqual(errors, []);
  assert.deepEqual(failedRequests, []);
  console.log(
    "PASS: six widths, painted square metres and dimensions, arithmetic/extras/limits, large prices, gallery dialog, demo form, phone validation, navigation and footer.",
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
  const noPricing = await configuredPage("client.pricing=null;");
  await noPricing.goto(base);
  assert.equal(await noPricing.locator(".price").count(), 0);
  assert.match(
    await noPricing.locator("#price-result").textContent(),
    /not available/,
  );
  await noPricing.close();
  const minimal = await configuredPage(
    "client.services=client.services.slice(0,1);client.pricing.preparation=[];client.pricing.extras=[];",
  );
  await minimal.goto(base);
  assert.equal(await minimal.locator("#preparation").count(), 0);
  assert.equal(await minimal.locator('input[name="extras"]').count(), 0);
  await minimal.locator('a[data-type="interior"]').click();
  assert.match(await minimal.locator(".price").textContent(), /720/);
  await minimal.close();
  const live = `client.demo=false;client.business.approved=true;client.business.phone='+64 21 555 0100';client.business.email='painter@example.com';client.business.logo='/favicon.svg';client.business.primaryCity='Wellington';client.business.serviceAreas=['Wellington'];client.hero.kind='client';client.contact.privacyUrl='/privacy';client.business.website='https://painting.example';client.services.forEach(s=>s.sample=false);client.contact.mode='endpoint';`;
  const configured = await configuredPage(
    live + `client.contact.endpoint='/test-quote';`,
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
    "unapproved production rates must be hidden",
  );
  assert.equal(
    await configured.locator("#our-work").count(),
    0,
    "no demo projects in production",
  );
  assert.equal(
    await configured
      .locator('.header-actions a[href^="tel:"]')
      .getAttribute("href"),
    "tel:+64215550100",
  );
  const schema = JSON.parse(
    await configured
      .locator('script[type="application/ld+json"]')
      .textContent(),
  );
  assert.equal(schema.name, "Example Painting Co.");
  assert.equal(schema.url, "https://painting.example");
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(schema["@type"], "HousePainter");
  await configured.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await configured.locator('.header-actions a[href^="tel:"]').isVisible(),
    true,
  );
  await configured.locator("#name").fill("Demo Tester");
  await configured.locator("#contact-value").fill("tester@example.com");
  await configured.locator("#location").fill("6011");
  await configured.locator('#inquiry button[type="submit"]').click();
  await configured.waitForFunction(() =>
    document
      .querySelector("#form-status")
      .textContent.includes("could not confirm"),
  );
  assert.equal(await configured.locator("#name").inputValue(), "Demo Tester");
  assert.equal(
    await configured.locator("#contact-value").inputValue(),
    "tester@example.com",
  );
  assert.equal(
    await configured.locator('#inquiry button[type="submit"]').isEnabled(),
    true,
  );
  await configured.locator('#inquiry button[type="submit"]').click();
  await configured.waitForFunction(() =>
    document.querySelector("#form-status").textContent.includes("accepted"),
  );
  assert.equal(payload.project.area, null);
  assert.equal(payload.project.type, "interior");
  assert.equal(payload.estimate.available, false);
  assert.equal(submitted, 2);
  assert.equal(
    await configured.locator('#inquiry button[type="submit"]').isDisabled(),
    true,
  );
  await configured.close();

  const formspree = await configuredPage(
    live +
      `client.contact.endpoint='https://formspree.io/f/test-only';client.pricing.approved=true;`,
  );
  let formspreePayload;
  let formspreeAttempts = 0;
  await formspree.route("https://formspree.io/f/test-only", async (route) => {
    formspreeAttempts++;
    assert.equal(route.request().headers().accept, "application/json");
    formspreePayload = route.request().postDataJSON();
    await route.fulfill({
      status: formspreeAttempts === 1 ? 422 : 200,
      contentType: "application/json",
      body: formspreeAttempts === 1 ? "{}" : '{"ok":true}',
    });
  });
  await formspree.goto(base);
  await formspree.locator("#name").fill("Demo Tester");
  await formspree.locator("#contact-value").fill("tester@example.com");
  await formspree.locator("#location").fill("6011");
  await formspree.locator("#notes").fill("Bedroom walls need preparation");
  await formspree.locator('#inquiry button[type="submit"]').click();
  await formspree.waitForFunction(() =>
    document
      .querySelector("#form-status")
      .textContent.includes("could not confirm"),
  );
  assert.equal(
    await formspree.locator("#notes").inputValue(),
    "Bedroom walls need preparation",
  );
  await formspree.locator('#inquiry button[type="submit"]').click();
  await formspree.waitForFunction(() =>
    document.querySelector("#form-status").textContent.includes("accepted"),
  );
  assert.equal(formspreePayload.email, "tester@example.com");
  assert.equal(formspreePayload.area_sq_m, 40);
  assert.match(formspreePayload.message, /720–\$1,120/);
  assert.equal(formspreeAttempts, 2);
  await formspree.close();
  const blocked = await configuredPage("client.demo=false;");
  await blocked.goto(base);
  assert.match(
    await blocked.locator("h1").textContent(),
    /setup is incomplete/,
  );
  await blocked.close();
  console.log(
    "PASS: no-pricing fallback, optional controls/single service, production metadata/phone links, JSON endpoint, Formspree accepted/error responses, payloads, preserved inputs and duplicate prevention.",
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
