import { client as c } from "./client-config.js";
import { calculateEstimate } from "./calculator.js";
import "./style.css";

// Keep the inquiry workflow usable even when a client has no approved rates.
c.pricing = {
  currency: "USD",
  locale: "en-US",
  minLength: 10,
  maxLength: 1000,
  defaultLength: 150,
  defaultType: c.services[0]?.id,
  defaultHeight: 6,
  heights: [{ feet: 6, multiplier: 1 }],
  rates: {},
  ...c.pricing,
};

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
const safeUrl = (value, type = "https:") => {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const u = new URL(value, location.origin);
    return u.protocol === type ||
      (type === "https:" && u.origin === location.origin)
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
const fenceIcon = (type = "wood") =>
  `<svg class="fence-icon" viewBox="0 0 64 48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${type === "metal" ? '<path d="M8 42V8m12 34V8m12 34V8m12 34V8m12 34V8M6 15h52M6 35h52"/>' : type === "vinyl" ? '<path d="M6 42V8h8v34m36 0V8h8v34M14 13h36v24H14m6-24v24m6-24v24m6-24v24m6-24v24m6-24v24"/>' : '<path d="M6 42V11l5-5 5 5v31m5 0V11l5-5 5 5v31m5 0V11l5-5 5 5v31m5 0V11l5-5 5 5v31M4 21h56M4 34h56"/>'}</svg>`;
const phoneHref = c.business.phone
  ? `tel:${c.business.phone.replace(/[^+\d]/g, "")}`
  : null;
const live = !c.demo;
const verifiedClaims = [...c.credentials, ...c.insurance, ...c.warranties];
const services = c.services.filter((s) => c.demo || !s.sample);
const faqs = c.faqs.filter((f) => c.demo || !f.sample);
if (
  live &&
  (!c.business.approved ||
    !c.business.name ||
    !c.business.primaryCity ||
    !services.length ||
    c.contact.mode !== "endpoint" ||
    !safeUrl(c.contact.endpoint))
) {
  document.querySelector("#app").innerHTML =
    '<main class="launch-block"><h1>Client setup is incomplete</h1><p>Complete the approved business details, actual services and secure contact integration before launching. See README.md.</p></main>';
  throw new Error(
    "Launch blocked: required client configuration is incomplete.",
  );
}
if (!c.demo) {
  document.querySelector('meta[name="robots"]')?.remove();
  document.title = `${c.business.name} — Fence installation in ${c.business.primaryCity}`;
  document.querySelector('meta[name="description"]').content =
    c.business.description ||
    `Explore fence options and request a project quote from ${c.business.name} in ${c.business.primaryCity}.`;
  if (c.business.website) {
    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HomeAndConstructionBusiness",
      name: c.business.name,
      url: c.business.website,
      ...(c.business.phone ? { telephone: c.business.phone } : {}),
      ...(c.business.serviceAreas.length
        ? { areaServed: c.business.serviceAreas }
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
const brand = `<a class="brand" href="#" aria-label="${esc(c.business.name)} home">${c.business.logo ? `<img src="${safeUrl(c.business.logo)}" width="43" height="43" alt=""/>` : fenceIcon()}<span>${esc(c.business.name)}<small>${esc(c.business.descriptor)}</small></span></a>`;
const contactCall = phoneHref
  ? `<a href="${phoneHref}" class="phone-link" data-event="phone_click">${phoneIcon}<span>${esc(c.business.phone)}</span></a>`
  : "";
document.querySelector("#app").innerHTML = `
${c.demo ? '<div class="demo-banner"><span class="demo-dot"></span> TEMPLATE PREVIEW <span class="demo-divider">/</span> Sample business & pricing. No inquiries are sent.</div>' : ""}
<header class="site-header"><div class="container header-inner">${brand}<nav aria-label="Main navigation"><a href="#services">Services</a>${c.projects.length || c.demo ? '<a href="#our-work">Our work</a>' : ""}<a href="#estimate">Estimate</a><a href="#contact">Contact</a></nav><div class="header-actions">${contactCall}<a class="button button-small" href="#estimate" data-event="estimate_cta">Get an estimate ${arrow}</a><button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span></button></div></div><nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden><a href="#services">Services</a>${c.projects.length || c.demo ? '<a href="#our-work">Our work</a>' : ""}<a href="#estimate">Estimate</a><a href="#contact">Contact</a></nav></header>
<main id="main">
<section class="hero"><div class="container hero-grid"><div class="hero-copy"><div class="eyebrow"><span class="short-rule"></span> FENCE INSTALLATION · ${esc(c.business.primaryCity.toUpperCase())}, ${esc(c.business.region)}${c.demo ? " (DEMO)" : ""}</div><h1>Built around<br>your property.<br><span>Made for living.</span></h1><p class="hero-lead">Fence installation in ${esc(c.business.primaryCity)}, built around you. Explore your options, find your style and get a ballpark price for your project.</p>${verifiedClaims.length ? `<p class="verified-line">${verifiedClaims.map(esc).join(" · ")}</p>` : ""}<div class="hero-actions"><a class="button" href="#estimate" data-event="estimate_cta">Calculate my estimate ${arrow}</a>${phoneHref ? `<a class="text-link" href="${phoneHref}" data-event="phone_click">Call ${esc(c.business.phone)}</a>` : '<a class="text-link" href="#services">Explore fence styles <span>↗</span></a>'}</div><div class="hero-note"><span class="note-icon">⌁</span><span>A little more privacy. A little more room to enjoy.</span></div></div><figure class="hero-visual"><img src="${safeUrl(c.hero.image)}" alt="${esc(c.hero.alt)}" width="${c.hero.width}" height="${c.hero.height}" fetchpriority="high"><div class="photo-label"><span class="photo-dot"></span> SPACE TO MAKE YOUR OWN</div>${c.hero.kind !== "client" ? `<figcaption>${esc(c.hero.caption)}</figcaption>` : ""}</figure></div></section>
<section class="estimate-section section-space" id="estimate"><div class="container"><div class="section-heading"><div><div class="eyebrow">A GOOD PLACE TO START</div><h2>What could your fence cost?</h2></div><p>Choose a style and a rough length.<br>Get a ballpark range, without the guesswork.</p></div><div class="calculator"><form class="calculator-controls" id="calculator" novalidate><div class="control-heading"><span class="step-label">01</span><h3>Make it yours</h3>${c.demo ? '<span class="sample-tag">Sample rates</span>' : ""}</div><fieldset class="type-fieldset"><legend>Fence type</legend><div class="type-options">${services.map((s) => `<label class="type-option"><input type="radio" name="type" value="${esc(s.id)}" ${s.id === c.pricing.defaultType ? "checked" : ""}>${fenceIcon(s.icon)}<span>${esc(s.name)}</span><span class="type-check">✓</span></label>`).join("")}</div></fieldset><div class="length-heading"><label for="length">Approximate length</label><div class="length-value"><input id="length" name="length" type="number" inputmode="decimal" min="${c.pricing.minLength}" max="${c.pricing.maxLength}" step="any" value="${c.pricing.defaultLength}" aria-describedby="length-help calculator-error"><span>linear ft</span></div></div><input id="length-slider" aria-label="Approximate fence length in feet" type="range" min="${c.pricing.minLength}" max="${c.pricing.maxLength}" value="${c.pricing.defaultLength}"><div class="range-labels" id="length-help"><span>${c.pricing.minLength} ft</span><span>A rough measurement is fine</span><span>${c.pricing.maxLength.toLocaleString()} ft</span></div><div class="control-row"><div><label for="height">Fence height</label><select id="height" name="height">${c.pricing.heights.map((h) => `<option value="${h.feet}" ${h.feet === c.pricing.defaultHeight ? "selected" : ""}>${h.feet} feet</option>`).join("")}</select></div>${c.pricing.extras?.gate ? `<div><label for="gates">Walk gates</label><select id="gates" name="gates">${Array.from({ length: c.pricing.extras.gate.max + 1 }, (_, i) => `<option value="${i}">${i === 0 ? "No gates" : `${i} gate${i > 1 ? "s" : ""}`}</option>`).join("")}</select></div>` : ""}</div>${c.pricing.extras?.removal ? '<label class="checkbox-label"><input type="checkbox" id="removal" name="removal"><span>Remove an existing fence</span><span class="optional-label">Optional</span></label>' : ""}<p id="calculator-error" class="error" role="alert"></p></form><div class="estimate-result"><div class="result-eyebrow"><span class="tiny-spark">✳</span> YOUR PROJECT, AT A GLANCE</div><div class="result-description" id="result-description"></div><div id="price-result" role="status" aria-live="polite" aria-atomic="true"></div><p class="estimate-disclaimer">Ballpark estimate only. Final pricing depends on site conditions, materials and an on-site assessment.</p><a class="button button-light" id="request-final" href="#contact">Request my final quote ${arrow}</a><p class="no-commitment">${c.demo ? "Demo calculation · not a contractor quote" : "No contact details needed to explore your options"}</p><details class="pricing-details"><summary>What goes into this estimate?</summary><p>${esc(c.pricing.assumptions)}</p></details></div></div></div></section>
<section id="our-work" class="work-section section-space" ${!c.projects.length && !c.demo ? "hidden" : ""}><div class="container">${c.projects.length ? `<div class="section-heading"><div><div class="eyebrow">AROUND THE NEIGHBORHOOD</div><h2>A closer look at our work.</h2></div><p>Thoughtful boundaries.<br>Spaces made to be enjoyed.</p></div><div class="project-grid">${c.projects.map((p) => `<figure><img src="${safeUrl(p.image)}" alt="${esc(p.alt)}" width="${p.width}" height="${p.height}" loading="lazy"><figcaption>${esc(p.caption)}${p.location ? ` · ${esc(p.location)}` : ""}</figcaption></figure>`).join("")}</div>` : c.demo ? `<div class="work-preview"><div class="work-image"><img src="${safeUrl(c.hero.image)}" width="${c.hero.width}" height="${c.hero.height}" alt="Illustrative cedar fence design, not completed client work" loading="lazy"><span>DESIGN INSPIRATION · ILLUSTRATIVE IMAGE</span></div><div class="work-copy"><div class="eyebrow">ROOM FOR THE EVERYDAY</div><h2>A better boundary.<br>A better backyard.</h2><p>Morning coffee. Long summer evenings. A space that feels a little more like yours.</p><p class="sample-explanation">Your completed projects belong here. Add real client photos and captions in the configuration to replace this demo inspiration.</p><a class="text-link" href="#services">Find your fence style ${arrow}</a></div></div>` : ""}</div></section>
<section class="services-section section-space" id="services"><div class="container"><div class="section-heading"><div><div class="eyebrow">FIND YOUR FIT</div><h2>A fence for the way you live.</h2></div><p>Natural warmth or clean, open lines.<br>Start with what matters to your home.</p></div>${c.demo ? '<p class="section-demo-note">Sample service menu — replace with the contractor’s actual offerings.</p>' : ""}<div class="services-grid">${services.map((s, i) => `<article class="service-card"><div class="service-top">${fenceIcon(s.icon)}<span>0${i + 1}</span></div><div class="eyebrow">${esc(s.eyebrow)}</div><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p><a href="#estimate" class="service-link" data-type="${esc(s.id)}">Explore ${esc(s.name.toLowerCase())} ${arrow}</a></article>`).join("")}</div></div></section>
${c.reasons.length ? `<section class="section-space"><div class="container"><div class="eyebrow">WHY ${esc(c.business.name.toUpperCase())}</div><h2>A company you can get to know.</h2><div class="services-grid">${c.reasons.map((r) => `<article><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></article>`).join("")}</div></div></section>` : ""}
${c.process.approved || c.demo ? `<section class="process-section section-space"><div class="container"><div class="section-heading"><div><div class="eyebrow">FROM FIRST IDEA TO FINAL DETAIL</div><h2>A clear path forward.</h2></div>${c.demo ? "<p>Example project process.<br>Confirm these steps with your contractor.</p>" : ""}</div><div class="process-grid">${c.process.steps.map((s, i) => `<article><div class="process-number">0${i + 1}<span></span></div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></article>`).join("")}</div></div></section>` : ""}
${c.reviews.length ? `<section class="section-space"><div class="container"><div class="eyebrow">FROM OUR CUSTOMERS</div><h2>In their own words.</h2><div class="services-grid">${c.reviews.map((r) => `<blockquote><p>“${esc(r.text)}”</p><footer>${esc(r.author)} · <a href="${safeUrl(r.source)}" target="_blank" rel="noopener noreferrer">Read original review</a></footer></blockquote>`).join("")}</div></div></section>` : ""}
<section class="faq-section section-space"><div class="container faq-grid"><div><div class="eyebrow">LET’S CLEAR A FEW THINGS UP</div><h2>Good questions.<br>Straight answers.</h2>${c.business.serviceAreas.length ? `<div class="service-areas"><h3>Our service area</h3><p>${c.business.serviceAreas.map(esc).join(" · ")}</p></div>` : "<p>Planning your project starts with<br>understanding your options.</p>"}</div><div class="faq-list">${faqs.map((f, i) => `<details><summary>${esc(f.question)}<span aria-hidden="true">+</span></summary><p>${esc(f.answer)}</p></details>`).join("")}</div></div></section>
<section class="contact-section section-space" id="contact"><div class="container contact-grid"><div class="contact-copy"><div class="eyebrow">LET’S MAKE ROOM FOR YOUR PLANS</div><h2>Tell us about<br>your fence project.</h2><p>Have a style in mind? Still figuring it out?<br>Start with a few details about your space.</p>${c.contact.mode === "demo" ? '<div class="demo-contact-note"><span class="info-icon">i</span><p><strong>This is a demo form.</strong><br>Nothing is sent or saved. Connect your contact integration before launch.</p></div>' : c.contact.afterSubmission ? `<p>${esc(c.contact.afterSubmission)}</p>` : ""}${contactCall}${c.business.email ? `<a class="contact-email" href="mailto:${esc(c.business.email)}">${esc(c.business.email)}</a>` : ""}${c.business.hours ? `<p>${esc(c.business.hours)}</p>` : ""}</div><form id="inquiry" class="inquiry-form"><div class="form-field"><label for="name">Your name <span>(required)</span></label><input id="name" name="name" autocomplete="name" required maxlength="120" placeholder="First and last name"></div><fieldset class="contact-preference"><legend>How would you like to be contacted?</legend><label><input type="radio" name="method" value="email" checked>Email</label><label><input type="radio" name="method" value="phone">Phone</label></fieldset><div class="form-row"><div class="form-field"><label for="contact-value" id="contact-value-label">Email address <span>(required)</span></label><input id="contact-value" name="contact" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></div><div class="form-field"><label for="location">ZIP or location <span>(required)</span></label><input id="location" name="location" autocomplete="postal-code" required maxlength="120" placeholder="e.g. 78704"></div></div><div class="form-field"><label for="notes">Anything else we should know? <span>(optional)</span></label><textarea id="notes" name="notes" rows="3" maxlength="3000" placeholder="Your plans, questions or a few details about your property…"></textarea></div><div class="honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" tabindex="-1" autocomplete="off"></label></div><div class="inquiry-summary"><span class="summary-icon">${fenceIcon()}</span><div><strong>Your calculator details</strong><p id="inquiry-details"></p></div><a href="#estimate" aria-label="Edit calculator details">Edit ↗</a></div><div class="form-status" id="form-status" role="status" aria-live="polite" tabindex="-1"></div><button type="submit" class="button submit-button">Request my quote ${arrow}</button><p class="privacy-note">${c.contact.mode === "demo" ? "Demo only. Your details stay in this browser and are not stored." : "Your details are used to respond to this project inquiry."}${c.contact.privacyUrl ? ` <a href="${safeUrl(c.contact.privacyUrl)}">Privacy policy</a>` : ""}</p></form></div></section>
</main><footer class="site-footer"><div class="container footer-top">${brand}<p>Thoughtful boundaries.<br>More room for life.</p><a href="#estimate" class="text-link">Let’s plan your fence ${arrow}</a></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} ${esc(c.business.name)}${c.demo ? " · Fictional demo business" : ""}</span><span>${c.demo ? "Template preview · Not a live contractor website" : esc(c.business.primaryCity) + ", " + esc(c.business.region)}</span><a href="#">Back to top ↑</a></div></footer><div class="mobile-action-bar">${phoneHref ? `<a class="mobile-call" href="${phoneHref}" data-event="phone_click">${phoneIcon} Call</a>` : '<a class="mobile-call" href="#contact">Ask a question</a>'}<a class="button" href="#estimate" data-event="estimate_cta">Get an estimate ${arrow}</a></div>`;

function event(name, properties = {}) {
  if (typeof c.analytics === "function") c.analytics({ name, properties });
}
document
  .querySelectorAll("[data-event]")
  .forEach((el) => el.addEventListener("click", () => event(el.dataset.event)));
const menu = document.querySelector(".menu-toggle");
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  document.querySelector("#mobile-nav").hidden = !open;
});
document.querySelectorAll("#mobile-nav a").forEach((a) =>
  a.addEventListener("click", () => {
    menu.setAttribute("aria-expanded", "false");
    document.querySelector("#mobile-nav").hidden = true;
  }),
);
const calculator = document.querySelector("#calculator");
const money = new Intl.NumberFormat(c.pricing.locale, {
  style: "currency",
  currency: c.pricing.currency,
  maximumFractionDigits: 0,
});
let currentSelection;
let currentEstimate;
let started = false;
function selections() {
  const f = new FormData(calculator);
  return {
    type: f.get("type"),
    length: Number(f.get("length")),
    height: Number(f.get("height")),
    gates: Number(f.get("gates") || 0),
    removal: f.has("removal"),
    demo: c.demo,
  };
}
function selectionText(s) {
  return `${services.find((t) => t.id === s.type)?.name ?? "Fence"} · ${s.length} linear ft · ${s.height} ft high${s.gates ? ` · ${s.gates} gate${s.gates > 1 ? "s" : ""}` : ""}${s.removal ? " · Removal included" : ""}`;
}
function updateEstimate(userAction = false) {
  currentSelection = selections();
  const output = document.querySelector("#price-result");
  try {
    currentEstimate = calculateEstimate(c.pricing, currentSelection);
    output.innerHTML = currentEstimate.available
      ? `<span class="price-label">${c.demo ? "ILLUSTRATIVE PRICE RANGE" : "ESTIMATED PROJECT RANGE"}</span><div class="price">${money.format(currentEstimate.low)}<span>—</span>${money.format(currentEstimate.high)}</div><p class="range-caption">A starting point for your plans.</p>`
      : "<h3>Let’s price your project.</h3><p>Online rates are not available. Request a project estimate below.</p>";
    document.querySelector("#calculator-error").textContent = "";
    document.querySelector("#length").removeAttribute("aria-invalid");
    document.querySelector("#result-description").textContent =
      selectionText(currentSelection);
    document.querySelector("#inquiry-details").textContent =
      selectionText(currentSelection) +
      (currentEstimate.available
        ? ` · ${money.format(currentEstimate.low)}–${money.format(currentEstimate.high)}`
        : "");
    document.querySelector("#length-slider").value = currentSelection.length;
    if (userAction) {
      if (!started) {
        event("calculator_start");
        started = true;
      }
      event("calculator_complete", {
        type: currentSelection.type,
        height: currentSelection.height,
      });
    }
  } catch (error) {
    currentEstimate = null;
    document.querySelector("#calculator-error").textContent = error.message;
    document.querySelector("#length").setAttribute("aria-invalid", "true");
    output.innerHTML =
      "<h3>Check your project details.</h3><p>Adjust the highlighted value to see your price range.</p>";
    document.querySelector("#result-description").textContent = "";
    document.querySelector("#inquiry-details").textContent =
      "Calculator details need updating.";
  }
}
calculator.addEventListener("submit", (e) => e.preventDefault());
calculator.addEventListener("input", () => updateEstimate(true));
document.querySelector("#length-slider").addEventListener("input", (e) => {
  document.querySelector("#length").value = e.target.value;
  updateEstimate(true);
});
document.querySelectorAll("[data-type]").forEach((a) =>
  a.addEventListener("click", () => {
    const radio = calculator.querySelector(`input[value="${a.dataset.type}"]`);
    if (radio) {
      radio.checked = true;
      updateEstimate(true);
    }
  }),
);
updateEstimate();
document.querySelectorAll('input[name="method"]').forEach((radio) =>
  radio.addEventListener("change", () => {
    const isPhone = radio.value === "phone";
    const input = document.querySelector("#contact-value");
    input.value = "";
    input.type = isPhone ? "tel" : "email";
    input.autocomplete = isPhone ? "tel" : "email";
    input.placeholder = isPhone ? "Your phone number" : "you@example.com";
    document.querySelector("#contact-value-label").innerHTML =
      `${isPhone ? "Phone number" : "Email address"} <span>(required)</span>`;
  }),
);
const inquiry = document.querySelector("#inquiry");
let submitting = false;
inquiry.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (submitting) return;
  const status = document.querySelector("#form-status");
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
  if (!currentEstimate) {
    status.textContent = "Please correct the calculator details first.";
    status.focus();
    return;
  }
  if (c.contact.mode === "demo") {
    status.className = "form-status demo-feedback";
    status.textContent =
      "Demo checked — your form is complete. Nothing was sent. Connect a contact destination to receive real inquiries.";
    status.focus();
    return;
  }
  if (!safeUrl(c.contact.endpoint)) {
    status.textContent =
      "Quote delivery is not configured. Please contact the company directly.";
    return;
  }
  submitting = true;
  const button = inquiry.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = "Sending your request…";
  try {
    const response = await fetch(c.contact.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        method: fields.get("method"),
        contact,
        location: locationText,
        notes: fields.get("notes"),
        project: currentSelection,
        estimate: currentEstimate,
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error("Delivery failed");
    status.className = "form-status demo-feedback";
    status.textContent =
      c.contact.afterSubmission || "Your quote request was accepted.";
    event("inquiry_success");
    inquiry.reset();
    button.textContent = "Request accepted";
    status.focus();
    // Keep disabled after acceptance to prevent accidental duplicate delivery.
  } catch {
    status.className = "form-status error";
    status.textContent =
      "We could not confirm delivery. Please try again or contact the company directly.";
    button.disabled = false;
    button.innerHTML = `Request my quote ${arrow}`;
    submitting = false;
    status.focus();
  }
});
