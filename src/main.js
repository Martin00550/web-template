import { client as c } from "./client-config.js";
import { calculateEstimate, getProjectArea } from "./calculator.js";
import "./style.css";
import { isConfiguredText, launchIssues } from "./client-readiness.js";

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
const services = c.services.filter((s) => c.demo || !s.sample);
const faqs = c.faqs.filter((f) => c.demo || !f.sample);
const verifiedClaims = [...c.credentials, ...c.insurance, ...c.warranties];
const phoneHref =
  isConfiguredText(c.business.phone) &&
  c.business.phone.replace(/\D/g, "").length >= 7
    ? `tel:${c.business.phone.replace(/[^+\d]/g, "")}`
    : null;
const gallery = c.projects.length ? c.projects : c.demo ? c.illustrations : [];
const illustrativeGallery = !c.projects.length;
const pricing = {
  currency: "NZD",
  locale: "en-NZ",
  minArea: 5,
  maxArea: 1000,
  minDimension: 0.5,
  maxDimension: 100,
  defaultArea: 40,
  defaultLength: 5,
  defaultWidth: 2.4,
  defaultType: services[0]?.id,
  rates: {},
  preparation: [],
  extras: [],
  ...c.pricing,
};
if (!services.some((s) => s.id === pricing.defaultType))
  pricing.defaultType = services[0]?.id;
if (
  pricing.preparation.length &&
  !pricing.preparation.some((f) => f.id === pricing.defaultPreparation)
)
  pricing.defaultPreparation = pricing.preparation[0].id;

if (!c.demo && launchIssues(c).length) {
  document.querySelector("#app").innerHTML =
    '<main class="launch-block"><h1>Client setup is incomplete</h1><p>Replace demo placeholders with approved client details, photography and quote delivery before launching. See README.md.</p></main>';
  throw new Error("Launch blocked: " + launchIssues(c).join(", "));
}
if (!c.demo) {
  document.querySelector('meta[name="robots"]')?.remove();
  document.title = `${c.business.name} — Painting contractor in ${c.business.primaryCity}`;
  document.querySelector('meta[name="description"]').content =
    c.business.description ||
    `Explore interior and exterior painting services and request a project quote from ${c.business.name} in ${c.business.primaryCity}.`;
  if (c.business.website && !document.querySelector("#business-schema")) {
    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.id = "business-schema";
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HousePainter",
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
const brand = `<a class="brand" href="#" aria-label="${esc(c.business.name)} home">${isConfiguredText(c.business.logo) ? `<img src="${safeUrl(c.business.logo)}" width="43" height="43" alt=""/>` : `<span class="logo-placeholder">${esc(c.business.logo || "[Logo]")}</span>`}<span>${esc(c.business.name)}<small>${esc(c.business.descriptor)}</small></span></a>`;
const contactCall = phoneHref
  ? `<a href="${phoneHref}" class="phone-link" data-event="phone_click" aria-label="Call ${esc(c.business.phone)}">${phoneIcon}<span>${esc(c.business.phone)}</span></a>`
  : `<button class="phone-link demo-phone" type="button" disabled aria-label="Call unavailable: replace [Phone] with the client’s phone number">${phoneIcon}<span>${esc(c.business.phone || "[Phone]")}</span></button>`;
const contactEmail = isConfiguredText(c.business.email)
  ? `<a class="contact-email" href="mailto:${esc(c.business.email)}">${esc(c.business.email)}</a>`
  : `<span class="contact-email placeholder-contact">${esc(c.business.email || "[Email]")}</span>`;
const navLinks = `<a href="#services">Services</a>${gallery.length ? '<a href="#our-work">Our Work</a>' : ""}<a href="#estimate">Estimate</a><a href="#contact">Contact</a>`;
document.querySelector("#app").innerHTML = `
${c.demo ? '<div class="demo-banner"><span class="demo-dot"></span> TEMPLATE PREVIEW <span class="demo-divider">/</span> Editable placeholders · illustrative images & sample prices</div>' : ""}
<header class="site-header"><div class="container header-inner">${brand}<nav aria-label="Main navigation">${navLinks}</nav><div class="header-actions">${contactCall}<a class="button button-small" href="#contact" data-event="quote_cta">Get a free quote ${arrow}</a><button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span></button></div></div><nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden>${navLinks}</nav></header>
<main id="main">
<section class="hero"><div class="container hero-grid"><div class="hero-copy"><div class="eyebrow"><span class="short-rule"></span> INDEPENDENT PAINTING · NEW ZEALAND</div><h1>Interior & exterior<br>painting in <span>${esc(c.business.primaryCity)}</span></h1><p class="hero-lead">From a single room to a full exterior repaint, tell us what you have in mind. We’ll discuss the preparation, finish and next steps.</p>${verifiedClaims.length ? `<p class="verified-line">${verifiedClaims.map(esc).join(" · ")}</p>` : ""}<div class="hero-actions"><a class="button" href="#contact" data-event="quote_cta">Get a free quote ${arrow}</a><a class="text-link" href="${gallery.length ? "#our-work" : "#services"}">See our work ${arrow}</a></div><div class="hero-note"><span>Start with your space, your colours and your plans.</span></div></div><figure class="hero-visual"><img src="${safeUrl(c.hero.image)}" alt="${esc(c.hero.alt)}" width="${c.hero.width}" height="${c.hero.height}" fetchpriority="high"><div class="photo-label"><span class="photo-dot"></span> A FRESH PERSPECTIVE ON HOME</div>${c.hero.kind !== "client" ? `<figcaption>${esc(c.hero.caption)}</figcaption>` : ""}</figure></div><div class="container hero-bottom"><span>YOUR HOME. YOUR COLOURS.</span><a href="#contact">Tell us about your project ${arrow}</a><span class="hero-bottom-index">${esc(c.business.primaryCity)}, NEW ZEALAND</span></div></section>
${gallery.length ? `<section id="our-work" class="work-section section-space"><div class="container"><div class="section-heading"><div><div class="eyebrow">${illustrativeGallery ? "THE POSSIBILITIES, PICTURED" : "A CLOSER LOOK AT OUR WORK"}</div><h2>A fresh look.<br>A place that feels like you.</h2></div><p>${illustrativeGallery ? "Illustrative painting inspiration.<br>Not completed work by this business." : "Explore our completed painting projects."}</p></div><div class="project-grid">${gallery.map((p, i) => `<figure class="project-card"><button type="button" class="project-open" data-project="${i}" aria-label="View ${esc(p.caption)} full size"><img src="${safeUrl(p.image)}" alt="${esc(p.alt)}" width="${p.width}" height="${p.height}" loading="lazy">${illustrativeGallery ? '<span class="illustration-label">ILLUSTRATIVE DEMO</span>' : ""}<span class="expand-icon" aria-hidden="true">${arrow}</span></button><figcaption><div><span class="project-type">${esc(p.type || "")}</span><h3>${esc(p.caption)}</h3>${p.location ? `<p>${esc(p.location)}</p>` : ""}</div><span class="project-index">0${i + 1}</span></figcaption></figure>`).join("")}</div>${illustrativeGallery ? '<p class="gallery-note">Generated images illustrate possible colours and finishes. They are not before-and-after results. Replace them with your painter’s actual work before launch.</p>' : ""}</div></section>` : ""}
<section class="services-section section-space" id="services"><div class="container"><div class="section-heading"><div><div class="eyebrow">A FRESH START, INSIDE & OUT</div><h2>Painting around your plans.</h2></div><p>A room, a repaint or the finishing details.<br>Start with the spaces you want to change.</p></div>${c.demo ? '<p class="section-demo-note">Sample service menu. Confirm your painter’s actual offerings before launch.</p>' : ""}<div class="services-grid">${services.map((s, i) => `<article class="service-card"><div class="service-top"><span>0${i + 1}</span></div><div class="eyebrow">${esc(s.eyebrow)}</div><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p><a href="#estimate" class="service-link" data-type="${esc(s.id)}">${esc(s.cta || "Plan your painting project")} ${arrow}</a></article>`).join("")}</div></div></section>
<section class="estimate-section section-space" id="estimate"><div class="container"><div class="section-heading"><div><div class="eyebrow">A LITTLE CLARITY, BEFORE YOU COMMIT</div><h2>What could your<br class="desktop-break"> painting project cost?</h2></div><p>Choose your project and painted surface area.<br>See a ballpark range. No contact details needed.</p></div><div class="calculator"><form class="calculator-controls" id="calculator" novalidate><div class="control-heading"><span class="step-label">01</span><h3>Plan your project</h3>${c.demo ? '<span class="sample-tag">Sample pricing</span>' : ""}</div><fieldset class="type-fieldset"><legend>What are you planning?</legend><div class="type-options">${services.map((s) => `<label class="type-option"><input type="radio" name="type" value="${esc(s.id)}" ${s.id === pricing.defaultType ? "checked" : ""}><span>${esc(s.shortName || s.name)}</span><span class="type-check">✓</span></label>`).join("")}</div></fieldset><div id="priced-controls"><fieldset class="measurement-fieldset"><legend>Approximate painted surface area</legend><div class="measurement-options"><label><input name="measurement" type="radio" value="area" checked><span>Enter square metres</span></label><label><input name="measurement" type="radio" value="dimensions"><span>Wall width × height</span></label></div></fieldset><div id="area-controls"><div class="area-input-row"><label for="area">Painted surface</label><div class="area-value"><input id="area" name="area" type="number" inputmode="decimal" min="${pricing.minArea}" max="${pricing.maxArea}" step="any" value="${pricing.defaultArea}" aria-describedby="area-help calculator-error"><span>m²</span></div></div><input id="area-slider" aria-label="Approximate painted surface area in square metres" type="range" min="${pricing.minArea}" max="${pricing.maxArea}" step="1" value="${pricing.defaultArea}"><div class="range-labels" id="area-help"><span>${pricing.minArea} m²</span><span>A rough measurement is fine</span><span>${pricing.maxArea.toLocaleString()} m²</span></div></div><div id="dimension-controls" hidden><div class="control-row dimensions-row"><div><label for="length">Surface width <span>(metres)</span></label><input id="length" name="length" type="number" inputmode="decimal" min="${pricing.minDimension}" max="${pricing.maxDimension}" step="any" value="${pricing.defaultLength}" aria-describedby="calculator-error"></div><span class="dimension-times" aria-hidden="true">×</span><div><label for="width">Surface height <span>(metres)</span></label><input id="width" name="width" type="number" inputmode="decimal" min="${pricing.minDimension}" max="${pricing.maxDimension}" step="any" value="${pricing.defaultWidth}" aria-describedby="calculator-error"></div></div><p id="dimension-area" class="dimension-area" aria-live="polite"></p></div>${pricing.preparation.length ? `<div class="finish-control"><label for="preparation">Preparation allowance</label><select id="preparation" name="preparation">${pricing.preparation.map((f) => `<option value="${esc(f.id)}" ${f.id === pricing.defaultPreparation ? "selected" : ""}>${esc(f.name)}${f.included ? " · included" : " · upgrade"}</option>`).join("")}</select><p>Options shown are included in this ${c.demo ? "sample " : " "}pricing configuration.</p></div>` : ""}${pricing.extras.map((extra) => `<label class="checkbox-label"><input type="checkbox" name="extras" value="${esc(extra.id)}"><span>${esc(extra.name)}</span><span class="optional-label">Optional</span></label>`).join("")}<p class="surface-help">Use the surface area being painted, not the room’s floor area. For multiple walls, enter their combined area.</p></div><p id="unpriced-help" class="surface-help" hidden>This service needs an individual quote. Tell us about the surfaces and scope in your enquiry.</p><p id="calculator-error" class="error" role="alert"></p></form><div class="estimate-result"><div class="result-eyebrow"><span class="tiny-spark">✳</span> YOUR PROJECT, AT A GLANCE</div><div class="result-description" id="result-description"></div><div id="price-result" role="status" aria-live="polite" aria-atomic="true"></div><div class="estimate-breakdown" id="estimate-breakdown"></div><p class="estimate-disclaimer">Ballpark estimate only. Final pricing depends on surface condition, preparation, access, paint system and the agreed scope.</p><a class="button button-light" id="request-final" href="#contact">Get a free quote ${arrow}</a><p class="tax-note" id="tax-note"></p><p class="no-commitment">${c.demo ? "Sample NZD rates · not a contractor quote" : "A starting point. Your painter confirms the details."}</p><details class="pricing-details" id="pricing-assumptions"><summary>What’s included in this estimate?</summary><p>${esc(pricing.assumptions || "Online rates are unavailable. Share your project details for a final quote.")}</p></details></div></div></div></section>
${c.reasons.length ? `<section class="section-space"><div class="container"><div class="eyebrow">WHY ${esc(c.business.name.toUpperCase())}</div><h2>A company you can get to know.</h2><div class="services-grid">${c.reasons.map((r) => `<article><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></article>`).join("")}</div></div></section>` : ""}
${c.process.approved || c.demo ? `<section class="process-section section-space"><div class="container"><div class="section-heading"><div><div class="eyebrow">A PLAN YOU CAN FOLLOW</div><h2>From “what if” to what’s next.</h2></div>${c.demo ? "<p>Example project process.<br>Your painter confirms the actual steps.</p>" : ""}</div><div class="process-grid">${c.process.steps.map((s, i) => `<article><div class="process-number">0${i + 1}<span></span></div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></article>`).join("")}</div></div></section>` : ""}
${c.reviews.length ? `<section class="section-space"><div class="container"><div class="eyebrow">FROM OUR CUSTOMERS</div><h2>In their own words.</h2><div class="services-grid">${c.reviews.map((r) => `<blockquote><p>“${esc(r.text)}”</p><footer>${esc(r.author)} · <a href="${safeUrl(r.source)}" target="_blank" rel="noopener noreferrer">Read original review</a></footer></blockquote>`).join("")}</div></div></section>` : ""}
<section class="faq-section section-space"><div class="container faq-grid"><div><div class="eyebrow">A LITTLE MORE CLARITY</div><h2>Good questions.<br>Straight answers.</h2><p>Start with the basics.<br>Your painter can help with the details.</p>${c.business.serviceAreas.length ? `<div class="service-areas"><h3>Where we work</h3><p>${c.business.serviceAreas.map(esc).join(" · ")}</p></div>` : ""}</div><div class="faq-list">${faqs.map((f) => `<details><summary>${esc(f.question)}<span aria-hidden="true">+</span></summary><p>${esc(f.answer)}</p></details>`).join("")}</div></div></section>
<section class="contact-section section-space" id="contact"><div class="container contact-grid"><div class="contact-copy"><div class="eyebrow">GOOD THINGS START WITH A CONVERSATION</div><h2>Tell us about<br>your painting project.</h2><p>A room to refresh? An exterior to repaint?<br>Share a few details about the work you’re considering.</p>${c.contact.mode === "demo" ? '<div class="demo-contact-note"><span class="info-icon">i</span><p><strong>This is a demo form.</strong><br>It does not send or save your enquiry. Connect a quote destination before launch.</p></div>' : c.contact.afterSubmission ? `<p>${esc(c.contact.afterSubmission)}</p>` : ""}${contactCall}${contactEmail}${c.business.hours ? `<p>${esc(c.business.hours)}</p>` : ""}</div><form id="inquiry" class="inquiry-form"><div class="form-field"><label for="name">Your name <span>(required)</span></label><input id="name" name="name" autocomplete="name" required maxlength="120" placeholder="First and last name"></div><fieldset class="contact-preference"><legend>How would you like to be contacted?</legend><label><input type="radio" name="method" value="email" checked>Email</label><label><input type="radio" name="method" value="phone">Phone</label></fieldset><div class="form-row"><div class="form-field"><label for="contact-value" id="contact-value-label">Email address <span>(required)</span></label><input id="contact-value" name="contact" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></div><div class="form-field"><label for="location">Postcode or location <span>(required)</span></label><input id="location" name="location" autocomplete="postal-code" required maxlength="120" placeholder="Your suburb or postcode"></div></div><div class="form-field"><label for="notes">Anything else we should know? <span>(optional)</span></label><textarea id="notes" name="notes" rows="3" maxlength="3000" placeholder="The rooms or surfaces, their condition and any colours you have in mind…"></textarea></div><div class="honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" tabindex="-1" autocomplete="off"></label></div><div class="inquiry-summary"><div><strong>Your project details</strong><p id="inquiry-details"></p></div><a href="#estimate" aria-label="Edit calculator details">Edit ${arrow}</a></div><div class="form-status" id="form-status" role="status" aria-live="polite" tabindex="-1"></div><button type="submit" class="button submit-button">Request my quote ${arrow}</button><p class="privacy-note">${c.contact.mode === "demo" ? "Demo only. Nothing is sent or stored." : "Your details are used to respond to this project enquiry."}${c.contact.privacyUrl ? ` <a href="${safeUrl(c.contact.privacyUrl)}">Privacy policy</a>` : ""}</p></form></div></section>
</main><footer class="site-footer"><div class="container footer-top">${brand}<p>A fresh perspective.<br>Inside and out.</p><a href="#estimate" class="text-link">Let’s plan your project ${arrow}</a></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} ${esc(c.business.name)}${c.demo ? " · Fictional demo business" : ""}</span><span>${c.demo ? "Template preview · " : ""}${esc(c.business.primaryCity)}, ${esc(c.business.region)}${c.demo ? " (demo)" : ""}</span><a href="#">Back to top ↑</a></div></footer><dialog id="project-dialog" class="project-dialog" aria-label="Project image"><form method="dialog"><button aria-label="Close project image" class="dialog-close">×</button></form><img id="dialog-image" alt="" width="1536" height="1024"><p id="dialog-caption"></p></dialog>`;

function event(name, properties = {}) {
  try {
    if (typeof c.analytics === "function") c.analytics({ name, properties });
  } catch {
    /* Optional analytics must not interrupt the enquiry. */
  }
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
    preparation: f.get("preparation") || null,
    extras: f.getAll("extras"),
    unit: "m2",
    demo: c.demo,
  };
  if (measurement === "dimensions") {
    selection.length = Number(f.get("length"));
    selection.width = Number(f.get("width"));
  }
  if (!pricing.rates[selection.type] || (!c.demo && !pricing.approved)) {
    selection.area = null;
    selection.measurement = "not-specified";
    selection.preparation = null;
    selection.extras = [];
  } else selection.area = getProjectArea(pricing, selection);
  return selection;
}
function selectionText(s) {
  const service =
    services.find((t) => t.id === s.type)?.name ?? "Painting project";
  if (s.area === null) return `${service} · Individual quote requested`;
  const prep = pricing.preparation.find((item) => item.id === s.preparation);
  const extras = (s.extras ?? [])
    .map((id) => pricing.extras.find((item) => item.id === id)?.name)
    .filter(Boolean);
  return `${service} · ${number.format(s.area)} m²${s.measurement === "dimensions" ? ` (${s.length} × ${s.width} m)` : ""}${prep ? ` · ${prep.name}` : ""}${extras.length ? " · " + extras.join(", ") : ""}`;
}
function syncMeasurementControls() {
  const dimensions = calculator.elements.measurement.value === "dimensions";
  const type = calculator.querySelector('input[name="type"]:checked')?.value;
  const unpriced = !pricing.rates[type] || (!c.demo && !pricing.approved);
  document.querySelector("#priced-controls").hidden = unpriced;
  document.querySelector("#unpriced-help").hidden = !unpriced;
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
      ? `<span class="price-label">${c.demo ? "ILLUSTRATIVE PRICE RANGE" : "ESTIMATED PROJECT RANGE"}</span><div class="price">${money.format(currentEstimate.low)}<span>—</span>${money.format(currentEstimate.high)}</div><p class="range-caption">A starting point for your painting plans.</p>`
      : "<h3>Let’s price your project.</h3><p>Online rates are not available. Request a project estimate below.</p>";
    document.querySelector("#tax-note").textContent = currentEstimate.available
      ? pricing.taxNote || ""
      : "";
    document.querySelector("#pricing-assumptions").hidden =
      !currentEstimate.available;
    const prep = pricing.preparation.find(
      (item) => item.id === currentSelection.preparation,
    );
    breakdown.innerHTML =
      currentSelection.area === null
        ? ""
        : `<div><span>Painted surface</span><strong>${number.format(currentSelection.area)} m²</strong></div>${prep ? `<div><span>Preparation</span><strong>${esc(prep.name)}</strong></div>` : ""}`;
    document.querySelector("#calculator-error").textContent = "";
    document.querySelector("#result-description").textContent =
      services.find((s) => s.id === currentSelection.type)?.name ??
      "Your painting project";
    document.querySelector("#inquiry-details").textContent =
      selectionText(currentSelection) +
      (currentEstimate.available
        ? ` · ${money.format(currentEstimate.low)}–${money.format(currentEstimate.high)}`
        : "");
    document.querySelector("#dimension-area").textContent =
      `${currentSelection.length ?? pricing.defaultLength} m × ${currentSelection.width ?? pricing.defaultWidth} m = ${number.format(currentSelection.area)} m²`;
    if (currentSelection.measurement === "dimensions")
      document.querySelector("#area").value = currentSelection.area;
    if (currentSelection.area !== null)
      document.querySelector("#area-slider").value = currentSelection.area;
    if (userAction && !started) {
      event("calculator_start");
      started = true;
    }
  } catch (error) {
    currentSelection = null;
    currentEstimate = null;
    document.querySelector("#tax-note").textContent = "";
    document.querySelector("#pricing-assumptions").hidden = true;
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
      preparation: currentSelection.preparation,
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
      "Demo checked — your form is complete. Nothing was sent. Connect a quote destination to receive real enquiries.";
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
        area_sq_m: currentSelection.area,
        preparation: currentSelection.preparation,
        extras: (currentSelection.extras || []).join(", "),
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
