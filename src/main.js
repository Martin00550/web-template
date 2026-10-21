import { client as c } from "./client-config.js";
import { calculateEstimate, getProjectArea } from "./calculator.js";
import "./style.css";

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
const safeUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const u = new URL(value, location.origin);
    return u.protocol === "https:" || u.origin === location.origin
      ? esc(u.href)
      : "";
  } catch {
    return "";
  }
};
const arrow =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg>';
const phoneIcon =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m7 3 3 5-3 3c2 3 3 4 6 6l3-3 5 3c0 3-2 5-5 4C8 19 5 16 3 8 2 5 4 3 7 3Z"/></svg>';
const projectIcon = (type = "driveway") =>
  `<svg class="project-icon" viewBox="0 0 64 48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${type === "patio" ? '<path d="m7 19 25-12 25 12v15L32 46 7 34Zm0 0 25 12 25-12M32 31v15M19 13l25 12v15M44 13 19 25v15"/>' : type === "walkway" ? '<path d="M14 44c0-18 29-15 29-29V4M34 44c0-9 25-8 25-29V4M18 32l17 8M32 25l16 10M43 17l15 4M43 9h16"/>' : '<path d="M9 44 22 7h20l13 37ZM17 22h30M12 35h40M32 7v37M20 7h24"/>'}</svg>`;
const logoIcon =
  '<svg class="logo-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 15 18-9 18 9v18l-18 9-18-9Zm0 0 18 9 18-9M24 24v18M15 10.5l18 9v18M33 10.5l-18 9v18"/></svg>';
const services = c.services.filter((s) => c.demo || !s.sample);
const faqs = c.faqs.filter((f) => c.demo || !f.sample);
const verifiedClaims = [...c.credentials, ...c.insurance, ...c.warranties];
const phoneHref = c.business.phone
  ? `tel:${c.business.phone.replace(/[^+\d]/g, "")}`
  : null;
const gallery = c.projects.length ? c.projects : c.demo ? c.illustrations : [];
const illustrativeGallery = !c.projects.length;
const pricing = {
  currency: "USD",
  locale: "en-US",
  minArea: 50,
  maxArea: 5000,
  minDimension: 1,
  maxDimension: 500,
  defaultArea: 400,
  defaultLength: 20,
  defaultWidth: 20,
  defaultType: services[0]?.id,
  rates: {},
  finishes: [],
  ...c.pricing,
};
if (!services.some((s) => s.id === pricing.defaultType))
  pricing.defaultType = services[0]?.id;
if (
  pricing.finishes.length &&
  !pricing.finishes.some((f) => f.id === pricing.defaultFinish)
)
  pricing.defaultFinish = pricing.finishes[0].id;

if (
  !c.demo &&
  (!c.business.approved ||
    !c.business.name ||
    !c.business.primaryCity ||
    !services.length ||
    c.contact.mode !== "endpoint" ||
    !safeUrl(c.contact.endpoint))
) {
  document.querySelector("#app").innerHTML =
    '<main class="launch-block"><h1>Client setup is incomplete</h1><p>Complete approved business details, actual services and secure quote delivery before launching. See README.md.</p></main>';
  throw new Error(
    "Launch blocked: required client configuration is incomplete.",
  );
}
if (!c.demo) {
  document.querySelector('meta[name="robots"]')?.remove();
  document.title = `${c.business.name} — Concrete contractor in ${c.business.primaryCity}`;
  document.querySelector('meta[name="description"]').content =
    c.business.description ||
    `Explore residential concrete services and request a project quote from ${c.business.name} in ${c.business.primaryCity}.`;
  if (c.business.website && !document.querySelector("#business-schema")) {
    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.id = "business-schema";
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HomeAndConstructionBusiness",
      name: c.business.name,
      url: c.business.website,
      ...(c.business.phone ? { telephone: c.business.phone } : {}),
      ...(c.business.serviceAreas.length
        ? { areaServed: c.business.serviceAreas }
        : {}),
      ...(c.business.description
        ? { description: c.business.description }
        : {}),
    });
    document.head.append(schema);
  }
}
document.documentElement.style.setProperty("--accent", c.brand.accent);
document.documentElement.style.setProperty(
  "--accent-light",
  c.brand.accentLight,
);
document.documentElement.style.setProperty("--warm", c.brand.warm);
document.querySelector('meta[name="theme-color"]').content = c.brand.accent;
const brand = `<a class="brand" href="#" aria-label="${esc(c.business.name)} home">${c.business.logo ? `<img src="${safeUrl(c.business.logo)}" width="43" height="43" alt=""/>` : logoIcon}<span>${esc(c.business.name)}<small>${esc(c.business.descriptor)}</small></span></a>`;
const contactCall = phoneHref
  ? `<a href="${phoneHref}" class="phone-link" data-event="phone_click">${phoneIcon}<span>${esc(c.business.phone)}</span></a>`
  : "";
const navLinks = `<a href="#services">Services</a>${gallery.length ? '<a href="#our-work">Our work</a>' : ""}<a href="#estimate">Estimate</a><a href="#contact">Contact</a>`;
const serviceNames = services.map((s) => s.name.toLowerCase());
const serviceLine =
  serviceNames.length > 1
    ? `${serviceNames.slice(0, -1).join(", ")} & ${serviceNames.at(-1)}`
    : serviceNames[0];

document.querySelector("#app").innerHTML = `
${c.demo ? '<div class="demo-banner"><span class="demo-dot"></span> TEMPLATE PREVIEW <span class="demo-divider">/</span> Sample business & pricing. Illustrative imagery.</div>' : ""}
<header class="site-header"><div class="container header-inner">${brand}<nav aria-label="Main navigation">${navLinks}</nav><div class="header-actions">${contactCall}<a class="button button-small" href="#estimate" data-event="estimate_cta">Get an estimate ${arrow}</a><button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span></button></div></div><nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden>${navLinks}</nav></header>
<main id="main">
<section class="hero"><div class="container hero-grid"><div class="hero-copy"><div class="eyebrow"><span class="short-rule"></span> RESIDENTIAL CONCRETE · ${esc(c.business.primaryCity.toUpperCase())}, ${esc(c.business.region.toUpperCase())}</div><h1>A solid start.<br><span>A better space.</span></h1><p class="hero-service-line">Concrete ${esc(serviceLine)}<br>in ${esc(c.business.primaryCity)}, ${esc(c.business.region)}.</p><p class="hero-lead">Explore your options, get a ballpark project price and request a quote for your property.</p>${verifiedClaims.length ? `<p class="verified-line">${verifiedClaims.map(esc).join(" · ")}</p>` : ""}<div class="hero-actions"><a class="button" href="#estimate" data-event="estimate_cta">Calculate my estimate ${arrow}</a>${phoneHref ? `<a class="text-link" href="${phoneHref}" data-event="phone_click">Call ${esc(c.business.phone)}</a>` : `<a class="text-link" href="${gallery.length ? "#our-work" : "#services"}">Explore the possibilities ${arrow}</a>`}</div><div class="hero-note"><span class="note-icon">↳</span><span>From the first hello to the last evening outside.</span></div></div><figure class="hero-visual"><img src="${safeUrl(c.hero.image)}" alt="${esc(c.hero.alt)}" width="${c.hero.width}" height="${c.hero.height}" fetchpriority="high"><div class="photo-label"><span class="photo-dot"></span> MADE FOR THE PLACE YOU CALL HOME</div>${c.hero.kind !== "client" ? `<figcaption>${esc(c.hero.caption)}</figcaption>` : ""}</figure></div><div class="container hero-bottom"><span>GOOD SPACES START WITH A PLAN.</span><a href="#estimate">Let’s start with yours ${arrow}</a><span class="hero-bottom-index">01 — YOUR NEXT PROJECT</span></div></section>
<section class="estimate-section section-space" id="estimate"><div class="container"><div class="section-heading"><div><div class="eyebrow">A LITTLE CLARITY, BEFORE YOU COMMIT</div><h2>What could your<br class="desktop-break"> concrete project cost?</h2></div><p>Choose your project and approximate size.<br>See a ballpark range. No contact details needed.</p></div><div class="calculator"><form class="calculator-controls" id="calculator" novalidate><div class="control-heading"><span class="step-label">01</span><h3>Plan your project</h3>${c.demo ? '<span class="sample-tag">Sample pricing</span>' : ""}</div><fieldset class="type-fieldset"><legend>What are you planning?</legend><div class="type-options">${services.map((s) => `<label class="type-option"><input type="radio" name="type" value="${esc(s.id)}" ${s.id === pricing.defaultType ? "checked" : ""}>${projectIcon(s.icon)}<span>${esc(s.name)}</span><span class="type-check">✓</span></label>`).join("")}</div></fieldset><fieldset class="measurement-fieldset"><legend>Approximate project size</legend><div class="measurement-options"><label><input name="measurement" type="radio" value="area" checked><span>Enter square feet</span></label><label><input name="measurement" type="radio" value="dimensions"><span>Length × width</span></label></div></fieldset><div id="area-controls"><div class="area-input-row"><label for="area">Total area</label><div class="area-value"><input id="area" name="area" type="number" inputmode="decimal" min="${pricing.minArea}" max="${pricing.maxArea}" step="any" value="${pricing.defaultArea}" aria-describedby="area-help calculator-error"><span>sq ft</span></div></div><input id="area-slider" aria-label="Approximate project area in square feet" type="range" min="${pricing.minArea}" max="${pricing.maxArea}" step="1" value="${pricing.defaultArea}"><div class="range-labels" id="area-help"><span>${pricing.minArea} sq ft</span><span>A rough measurement is fine</span><span>${pricing.maxArea.toLocaleString()} sq ft</span></div></div><div id="dimension-controls" hidden><div class="control-row dimensions-row"><div><label for="length">Length <span>(feet)</span></label><input id="length" name="length" type="number" inputmode="decimal" min="${pricing.minDimension}" max="${pricing.maxDimension}" step="any" value="${pricing.defaultLength}" aria-describedby="calculator-error"></div><span class="dimension-times" aria-hidden="true">×</span><div><label for="width">Width <span>(feet)</span></label><input id="width" name="width" type="number" inputmode="decimal" min="${pricing.minDimension}" max="${pricing.maxDimension}" step="any" value="${pricing.defaultWidth}" aria-describedby="calculator-error"></div></div><p id="dimension-area" class="dimension-area" aria-live="polite"></p></div>${pricing.finishes.length ? `<div class="finish-control"><label for="finish">Surface finish</label><select id="finish" name="finish">${pricing.finishes.map((f) => `<option value="${esc(f.id)}" ${f.id === pricing.defaultFinish ? "selected" : ""}>${esc(f.name)}${f.included ? " · included" : " · upgrade"}</option>`).join("")}</select><p>Options shown are included in this ${c.demo ? "sample " : " "}pricing configuration.</p></div>` : ""}${pricing.extras?.removal ? '<label class="checkbox-label"><input type="checkbox" id="removal" name="removal"><span>Remove existing concrete</span><span class="optional-label">Optional</span></label><p class="removal-help">Applies to the full project area entered above.</p>' : ""}<p id="calculator-error" class="error" role="alert"></p></form><div class="estimate-result"><div class="result-eyebrow"><span class="tiny-spark">✳</span> YOUR PROJECT, AT A GLANCE</div><div class="result-description" id="result-description"></div><div id="price-result" role="status" aria-live="polite" aria-atomic="true"></div><div class="estimate-breakdown" id="estimate-breakdown"></div><p class="estimate-disclaimer">Ballpark estimate only. Final pricing depends on site access, ground conditions, preparation and project specifications.</p><a class="button button-light" id="request-final" href="#contact">Request my final quote ${arrow}</a><p class="no-commitment">${c.demo ? "Sample rates & result · not a contractor quote" : "A starting point. Your contractor confirms the details."}</p><details class="pricing-details"><summary>What’s included in this estimate?</summary><p>${esc(pricing.assumptions || "Online rates are unavailable. Share your project details for a final quote.")}</p></details></div></div></div></section>
${gallery.length ? `<section id="our-work" class="work-section section-space"><div class="container"><div class="section-heading"><div><div class="eyebrow">${illustrativeGallery ? "THE POSSIBILITIES, PICTURED" : "A CLOSER LOOK AT OUR WORK"}</div><h2>Everyday spaces.<br>Worth coming home to.</h2></div><p>${illustrativeGallery ? "Illustrative design inspiration.<br>These are not completed client projects." : "Explore our completed residential projects."}</p></div><div class="project-grid">${gallery.map((p, i) => `<figure class="project-card"><button type="button" class="project-open" data-project="${i}" aria-label="View ${esc(p.caption)} full size"><img src="${safeUrl(p.image)}" alt="${esc(p.alt)}" width="${p.width}" height="${p.height}" loading="lazy">${illustrativeGallery ? '<span class="illustration-label">ILLUSTRATIVE DEMO</span>' : ""}<span class="expand-icon" aria-hidden="true">${arrow}</span></button><figcaption><div><span class="project-type">${esc(p.type || "")}</span><h3>${esc(p.caption)}</h3>${p.location ? `<p>${esc(p.location)}</p>` : ""}</div><span class="project-index">0${i + 1}</span></figcaption></figure>`).join("")}</div>${illustrativeGallery ? '<p class="gallery-note">Generated images show possible project styles. Replace them with your contractor’s actual work before launch.</p>' : ""}</div></section>` : ""}
<section class="services-section section-space" id="services"><div class="container"><div class="section-heading"><div><div class="eyebrow">YOUR HOME, FROM THE GROUND UP</div><h2>Make more of your space.</h2></div><p>A place to arrive. A place to gather.<br>A path that connects it all.</p></div>${c.demo ? '<p class="section-demo-note">Sample service menu. Confirm your contractor’s actual offerings before launch.</p>' : ""}<div class="services-grid">${services.map((s, i) => `<article class="service-card"><div class="service-top">${projectIcon(s.icon)}<span>0${i + 1}</span></div><div class="eyebrow">${esc(s.eyebrow)}</div><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p><a href="#estimate" class="service-link" data-type="${esc(s.id)}">Plan ${s.id === "patio" ? "a patio" : s.id === "walkway" ? "a walkway" : s.id === "driveway" ? "a driveway" : "your project"} ${arrow}</a></article>`).join("")}</div></div></section>
${c.reasons.length ? `<section class="section-space"><div class="container"><div class="eyebrow">WHY ${esc(c.business.name.toUpperCase())}</div><h2>A company you can get to know.</h2><div class="services-grid">${c.reasons.map((r) => `<article><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></article>`).join("")}</div></div></section>` : ""}
${c.process.approved || c.demo ? `<section class="process-section section-space"><div class="container"><div class="section-heading"><div><div class="eyebrow">A PLAN YOU CAN FOLLOW</div><h2>From “what if” to what’s next.</h2></div>${c.demo ? "<p>Example project process.<br>Your contractor confirms the actual steps.</p>" : ""}</div><div class="process-grid">${c.process.steps.map((s, i) => `<article><div class="process-number">0${i + 1}<span></span></div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></article>`).join("")}</div></div></section>` : ""}
${c.reviews.length ? `<section class="section-space"><div class="container"><div class="eyebrow">FROM OUR CUSTOMERS</div><h2>In their own words.</h2><div class="services-grid">${c.reviews.map((r) => `<blockquote><p>“${esc(r.text)}”</p><footer>${esc(r.author)} · <a href="${safeUrl(r.source)}" target="_blank" rel="noopener noreferrer">Read original review</a></footer></blockquote>`).join("")}</div></div></section>` : ""}
<section class="faq-section section-space"><div class="container faq-grid"><div><div class="eyebrow">A LITTLE MORE CLARITY</div><h2>Good questions.<br>Straight answers.</h2><p>Start with the basics.<br>Your contractor can help with the details.</p>${c.business.serviceAreas.length ? `<div class="service-areas"><h3>Where we work</h3><p>${c.business.serviceAreas.map(esc).join(" · ")}</p></div>` : ""}</div><div class="faq-list">${faqs.map((f) => `<details><summary>${esc(f.question)}<span aria-hidden="true">+</span></summary><p>${esc(f.answer)}</p></details>`).join("")}</div></div></section>
<section class="contact-section section-space" id="contact"><div class="container contact-grid"><div class="contact-copy"><div class="eyebrow">GOOD THINGS START WITH A CONVERSATION</div><h2>Tell us about<br>your concrete project.</h2><p>A new driveway? Room to gather outside?<br>Share a few details about what you have in mind.</p>${c.contact.mode === "demo" ? '<div class="demo-contact-note"><span class="info-icon">i</span><p><strong>This is a demo form.</strong><br>It does not send or save your inquiry. Connect a quote destination before launch.</p></div>' : c.contact.afterSubmission ? `<p>${esc(c.contact.afterSubmission)}</p>` : ""}${contactCall}${c.business.email ? `<a class="contact-email" href="mailto:${esc(c.business.email)}">${esc(c.business.email)}</a>` : ""}${c.business.hours ? `<p>${esc(c.business.hours)}</p>` : ""}</div><form id="inquiry" class="inquiry-form"><div class="form-field"><label for="name">Your name <span>(required)</span></label><input id="name" name="name" autocomplete="name" required maxlength="120" placeholder="First and last name"></div><fieldset class="contact-preference"><legend>How would you like to be contacted?</legend><label><input type="radio" name="method" value="email" checked>Email</label><label><input type="radio" name="method" value="phone">Phone</label></fieldset><div class="form-row"><div class="form-field"><label for="contact-value" id="contact-value-label">Email address <span>(required)</span></label><input id="contact-value" name="contact" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></div><div class="form-field"><label for="location">ZIP or location <span>(required)</span></label><input id="location" name="location" autocomplete="postal-code" required maxlength="120" placeholder="e.g. 75070"></div></div><div class="form-field"><label for="notes">Anything else we should know? <span>(optional)</span></label><textarea id="notes" name="notes" rows="3" maxlength="3000" placeholder="Your plans, existing concrete or a few details about your property…"></textarea></div><div class="honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" tabindex="-1" autocomplete="off"></label></div><div class="inquiry-summary"><span class="summary-icon">${projectIcon()}</span><div><strong>Your project details</strong><p id="inquiry-details"></p></div><a href="#estimate" aria-label="Edit calculator details">Edit ${arrow}</a></div><div class="form-status" id="form-status" role="status" aria-live="polite" tabindex="-1"></div><button type="submit" class="button submit-button">Request my quote ${arrow}</button><p class="privacy-note">${c.contact.mode === "demo" ? "Demo only. Nothing is sent or stored." : "Your details are used to respond to this project inquiry."}${c.contact.privacyUrl ? ` <a href="${safeUrl(c.contact.privacyUrl)}">Privacy policy</a>` : ""}</p></form></div></section>
</main><footer class="site-footer"><div class="container footer-top">${brand}<p>Made for your home.<br>Built around your plans.</p><a href="#estimate" class="text-link">Let’s plan your project ${arrow}</a></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} ${esc(c.business.name)}${c.demo ? " · Fictional demo business" : ""}</span><span>${c.demo ? "Template preview · " : ""}${esc(c.business.primaryCity)}, ${esc(c.business.region)}${c.demo ? " (demo)" : ""}</span><a href="#">Back to top ↑</a></div></footer><dialog id="project-dialog" class="project-dialog" aria-label="Project image"><form method="dialog"><button aria-label="Close project image" class="dialog-close">×</button></form><img id="dialog-image" alt="" width="1536" height="1024"><p id="dialog-caption"></p></dialog>`;

function event(name, properties = {}) {
  if (typeof c.analytics === "function") c.analytics({ name, properties });
}
document
  .querySelectorAll("[data-event]")
  .forEach((el) => el.addEventListener("click", () => event(el.dataset.event)));
const menu = document.querySelector(".menu-toggle");
function closeMenu() {
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-label", "Open navigation");
  document.querySelector("#mobile-nav").hidden = true;
}
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  document.querySelector("#mobile-nav").hidden = !open;
});
document
  .querySelectorAll("#mobile-nav a")
  .forEach((a) => a.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});
const dialog = document.querySelector("#project-dialog");
document.querySelectorAll("[data-project]").forEach((button) =>
  button.addEventListener("click", () => {
    const photo = gallery[Number(button.dataset.project)];
    const image = document.querySelector("#dialog-image");
    image.src = photo.image;
    image.alt = photo.alt;
    document.querySelector("#dialog-caption").textContent =
      photo.caption +
      (illustrativeGallery
        ? " · Illustrative demo image; not completed client work."
        : "");
    dialog.showModal();
  }),
);
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});

const calculator = document.querySelector("#calculator");
const money = new Intl.NumberFormat(pricing.locale, {
  style: "currency",
  currency: pricing.currency,
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat(pricing.locale, {
  maximumFractionDigits: 2,
});
let currentSelection;
let currentEstimate;
let started = false;
function selections() {
  const f = new FormData(calculator);
  const measurement = f.get("measurement");
  const selection = {
    type: f.get("type"),
    measurement,
    area: Number(f.get("area")),
    finish: f.get("finish") || null,
    removal: f.has("removal"),
    demo: c.demo,
  };
  if (measurement === "dimensions") {
    selection.length = Number(f.get("length"));
    selection.width = Number(f.get("width"));
  }
  selection.area = getProjectArea(pricing, selection);
  return selection;
}
function selectionText(s) {
  const service =
    services.find((t) => t.id === s.type)?.name ?? "Concrete project";
  const finish = pricing.finishes.find((f) => f.id === s.finish);
  return `${service} · ${number.format(s.area)} sq ft${s.measurement === "dimensions" ? ` (${s.length} × ${s.width} ft)` : ""}${finish ? ` · ${finish.name}` : ""}${s.removal ? " · Concrete removal" : ""}`;
}
function syncMeasurementControls() {
  const dimensions = calculator.elements.measurement.value === "dimensions";
  document.querySelector("#area-controls").hidden = dimensions;
  document.querySelector("#dimension-controls").hidden = !dimensions;
  document.querySelector("#area").disabled = dimensions;
  document.querySelector("#length").disabled = !dimensions;
  document.querySelector("#width").disabled = !dimensions;
}
function updateEstimate(userAction = false) {
  syncMeasurementControls();
  const output = document.querySelector("#price-result");
  const breakdown = document.querySelector("#estimate-breakdown");
  for (const id of ["area", "length", "width"])
    document.getElementById(id).removeAttribute("aria-invalid");
  try {
    currentSelection = selections();
    currentEstimate = calculateEstimate(pricing, currentSelection);
    output.innerHTML = currentEstimate.available
      ? `<span class="price-label">${c.demo ? "ILLUSTRATIVE PRICE RANGE" : "ESTIMATED PROJECT RANGE"}</span><div class="price">${money.format(currentEstimate.low)}<span>—</span>${money.format(currentEstimate.high)}</div><p class="range-caption">A starting point for something good.</p>`
      : "<h3>Let’s price your project.</h3><p>Online rates are not available. Request a project estimate below.</p>";
    const finish = pricing.finishes.find(
      (f) => f.id === currentSelection.finish,
    );
    breakdown.innerHTML = `<div><span>Project size</span><strong>${number.format(currentSelection.area)} sq ft</strong></div>${finish ? `<div><span>Finish</span><strong>${esc(finish.name)}</strong></div>` : ""}<div><span>Existing concrete removal</span><strong>${currentSelection.removal ? "Included" : "Not selected"}</strong></div>`;
    document.querySelector("#calculator-error").textContent = "";
    document.querySelector("#result-description").textContent =
      services.find((s) => s.id === currentSelection.type)?.name ??
      "Your concrete project";
    document.querySelector("#inquiry-details").textContent =
      selectionText(currentSelection) +
      (currentEstimate.available
        ? ` · ${money.format(currentEstimate.low)}–${money.format(currentEstimate.high)}`
        : "");
    document.querySelector("#dimension-area").textContent =
      `${currentSelection.length ?? pricing.defaultLength} ft × ${currentSelection.width ?? pricing.defaultWidth} ft = ${number.format(currentSelection.area)} sq ft`;
    if (currentSelection.measurement === "dimensions")
      document.querySelector("#area").value = currentSelection.area;
    document.querySelector("#area-slider").value = currentSelection.area;
    if (userAction && !started) {
      event("calculator_start");
      started = true;
    }
  } catch (error) {
    currentSelection = null;
    currentEstimate = null;
    document.querySelector("#calculator-error").textContent = error.message;
    for (const id of calculator.elements.measurement.value === "dimensions"
      ? ["length", "width"]
      : ["area"])
      document.getElementById(id).setAttribute("aria-invalid", "true");
    output.innerHTML =
      "<h3>Check your project size.</h3><p>Adjust the highlighted values to see a ballpark range.</p>";
    document.querySelector("#result-description").textContent = "";
    breakdown.innerHTML = "";
    document.querySelector("#dimension-area").textContent =
      "Enter both dimensions to calculate your project area.";
    document.querySelector("#inquiry-details").textContent =
      "Please update the calculator details.";
  }
}
calculator.addEventListener("submit", (e) => e.preventDefault());
calculator.addEventListener("input", (e) => {
  if (e.target.id === "area-slider")
    document.querySelector("#area").value = e.target.value;
  updateEstimate(true);
});
calculator.addEventListener("change", () => {
  if (currentEstimate?.available)
    event("calculator_complete", {
      type: currentSelection.type,
      finish: currentSelection.finish,
    });
});
document.querySelectorAll("[data-type]").forEach((a) =>
  a.addEventListener("click", () => {
    const radio = [...calculator.querySelectorAll('input[name="type"]')].find(
      (r) => r.value === a.dataset.type,
    );
    if (radio) {
      radio.checked = true;
      updateEstimate(true);
    }
  }),
);
updateEstimate();

function setContactMethod(isPhone, clear = true) {
  const input = document.querySelector("#contact-value");
  if (clear) input.value = "";
  input.type = isPhone ? "tel" : "email";
  input.autocomplete = isPhone ? "tel" : "email";
  input.placeholder = isPhone ? "Your phone number" : "you@example.com";
  document.querySelector("#contact-value-label").innerHTML =
    `${isPhone ? "Phone number" : "Email address"} <span>(required)</span>`;
}
document
  .querySelectorAll('input[name="method"]')
  .forEach((radio) =>
    radio.addEventListener("change", () =>
      setContactMethod(radio.value === "phone"),
    ),
  );
const inquiry = document.querySelector("#inquiry");
let submitting = false;
inquiry.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (submitting) return;
  const status = document.querySelector("#form-status");
  status.className = "form-status error";
  const fields = new FormData(inquiry);
  if (fields.get("website")) return;
  const name = String(fields.get("name")).trim();
  const contact = String(fields.get("contact")).trim();
  const locationText = String(fields.get("location")).trim();
  if (!name || !locationText) {
    status.textContent = "Please enter your name and project location.";
    status.focus();
    return;
  }
  if (
    fields.get("method") === "phone" &&
    (!/^[+\d\s().-]{7,30}$/.test(contact) ||
      !/^\d{7,15}$/.test(contact.replace(/\D/g, "")))
  ) {
    status.textContent =
      "Please enter a valid phone number, including the area code.";
    document.querySelector("#contact-value").focus();
    return;
  }
  if (!currentSelection || !currentEstimate) {
    status.textContent = "Please correct the calculator details first.";
    status.focus();
    return;
  }
  if (c.contact.mode === "demo") {
    status.className = "form-status demo-feedback";
    status.textContent =
      "Demo checked — your form is complete. Nothing was sent. Connect a quote destination to receive real inquiries.";
    status.focus();
    return;
  }
  if (!safeUrl(c.contact.endpoint)) {
    status.textContent =
      "Quote delivery is not configured. Please contact the company directly.";
    status.focus();
    return;
  }
  submitting = true;
  const button = inquiry.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = "Sending your request…";
  status.textContent = "";
  const payload = {
    name,
    method: fields.get("method"),
    contact,
    location: locationText,
    notes: fields.get("notes"),
    project: currentSelection,
    estimate: currentEstimate,
  };
  const isFormspree =
    new URL(c.contact.endpoint, location.origin).hostname === "formspree.io";
  // Formspree expects contact fields and a human-readable message rather than
  // nested objects. Generic JSON endpoints retain the original API contract.
  const body = isFormspree
    ? {
        name,
        [payload.method === "email" ? "email" : "phone"]: contact,
        preferred_contact: payload.method,
        project_location: locationText,
        project_type: currentSelection.type,
        area_sq_ft: currentSelection.area,
        finish: currentSelection.finish,
        concrete_removal: currentSelection.removal ? "Yes" : "No",
        message: `${payload.notes || "No additional notes."}\n\nProject: ${selectionText(currentSelection)}\nBallpark range: ${currentEstimate.available ? `${money.format(currentEstimate.low)}–${money.format(currentEstimate.high)}` : "Not available; final quote requested."}`,
      }
    : payload;
  try {
    const response = await fetch(c.contact.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error("Delivery failed");
    if (isFormspree) {
      const result = await response.json();
      if (result.ok !== true) throw new Error("Submission was not accepted");
    }
    status.className = "form-status demo-feedback";
    status.textContent =
      c.contact.afterSubmission || "Your quote request was accepted.";
    event("inquiry_success");
    inquiry.reset();
    setContactMethod(false, false);
    button.textContent = "Request accepted";
    status.focus();
  } catch {
    status.className = "form-status error";
    status.textContent =
      "We could not confirm delivery. Your details are still here. Please try again or contact the company directly.";
    button.disabled = false;
    button.innerHTML = `Request my quote ${arrow}`;
    submitting = false;
    status.focus();
  }
});
