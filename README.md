# Residential concrete contractor template

A customer-facing, mobile-first website for **Example Concrete Co.**, a clearly labeled fictional demonstration in **McKinney, Texas**. Built with vanilla JavaScript/CSS and Vite. The template has no runtime framework, tracking SDK, backend or account requirement.

## Run and verify

Requires Node.js 22.12+; Node 24 is recommended. From `/workspace/web-template`:

```sh
npm ci
npm run dev -- --port 5173
```

```sh
npm test
npm run test:browser
npm run build
npm run preview -- --port 4173
```

Browser tests start/stop their own server on port 4175. They use system Chromium at `/usr/bin/chromium`, `CHROMIUM_PATH` if set, or a Playwright browser installed with `npx playwright install chromium`. Tests cover six widths from 320–1440px, square feet and dimension calculations, price limits, optional finish/removal controls, gallery enlargement, navigation, phone links, generic API and Formspree success/error behavior, preserved form values and production guards. Screenshots are saved to ignored `test-results/`. Tests use sample-data expectations; review those expectations when intentionally changing sample rates or services.

## Duplicate for a new client

Edit **`src/client-config.js`**. It is the central source of client-specific data; the layout does not need rebuilding.

1. **Business and location:** replace `business.name`, `descriptor`, `primaryCity`, `region`, `description` and actual `serviceAreas`. Add the real international-format phone, email and hours. No phone is fabricated for this demo; phone buttons appear when one is configured. Only list places the contractor actually serves.
2. **Branding:** put the licensed client logo in `public/` and set `business.logo`. Change `brand` colors, keeping sufficient contrast between the dark accent and light button text. Replace `public/favicon.svg` with the client's favicon if available.
3. **Services:** retain only real offerings in `services`. Each item has a unique `id`, `name`, `eyebrow`, `description`, `benefit` and `icon` (`driveway`, `patio` or `walkway`). Clear `sample` only after approving the content. IDs must match pricing keys. No structural or commercial services are assumed.
4. **Photography:** replace `hero` with licensed client photography, correct dimensions and meaningful alt text. Use `kind: 'client'` only for actual client work. Add genuine completed projects to `projects` as `{ image, width, height, alt, caption, type?, location? }`. Empty real-project galleries are hidden in production. The separate `illustrations` array appears only in demo, is prominently labeled and is never described as completed work.
5. **Rates:** replace sample installed rates, minimum charges, finish allowances and removal allowances with contractor-approved low/high figures. Set `pricing.approved: true` only after approval. Choose a valid default project/finish. Remove unsupported finishes or the removal extra to hide their controls. Use `pricing: null`, empty `rates`, an unpriced service or unapproved production pricing for an honest quote-only flow.
6. **Verified content:** supply genuine reviews as `{ text, author, source }`; specific substantiated strengths as `{ title, text }`; and verified credentials, warranties or insurance statements as arrays of approved strings. Empty optional sections stay hidden. Adjust and approve the real three-step process using `process.approved`. Review FAQs and clear their sample flags only when approved.
7. **Quote delivery:** configure the client's Formspree form URL or existing JSON API as described below. Add the actual follow-up explanation and privacy policy. Test delivery and verify the destination received the request. Photo uploads are omitted until the chosen integration securely supports them.
8. **Live launch:** complete the checklist below, set `business.approved: true` and `demo: false`, then rebuild. An incomplete live configuration blocks rendering/building. Sample services, FAQs, unapproved process copy and illustrations do not appear in production. Without approved rates, visitors can request a quote without a fabricated price.
9. **Domain:** set `business.website` to the client's real HTTPS URL. The built HTML gets the correct title, meta description, canonical URL and indexing policy. Known business facts generate basic structured data; no ratings, address or opening-hour claims are invented. Deploy `dist/` to the client's static host only with explicit authorization.

## Calculator: units, formula and assumptions

Visitors enter **square feet**, or **length × width in feet**. Dimensions automatically calculate square feet; there is no conversion to linear footage or structural specification. Direct area and calculated area share the configured limits. Decimal dimensions are supported and calculated area is rounded to two decimals.

For each configured `low` and `high` bound:

```text
area = square feet OR length in feet × width in feet
installed = area × project type's installed rate per square foot
finish = selected finish included ? 0 : area × configured finish allowance
removal = selected ? area × configured removal allowance : 0
result = round(max(minimum charge, installed + finish + removal))
```

The installed rate includes the base finish. Included finishes are never charged twice. An upgrade adds only its explicitly configured allowance. Removal applies to the entire entered project area, as stated beside the control. No invented percentage or confidence interval is used. Both ends of the range come from configured rates.

Sample figures, **not contractor pricing**:

| Selection                                     | Sample low–high       |
| --------------------------------------------- | --------------------- |
| 400 sq ft driveway, included broom finish     | $3,200–$4,800         |
| 400 sq ft driveway, smooth upgrade + removal  | $4,400–$7,200         |
| 20 × 30 ft driveway, smooth upgrade + removal | $6,600–$10,800        |
| 50 sq ft driveway, including removal          | $1,500–$2,000 minimum |

Sample limits are 50–5,000 sq ft and dimensions of 1–500 ft (the resulting area must also be within range). Low/high minimums are $1,500/$2,000. No thickness, reinforcement, foundation or other structural specifications are prescribed. Actual scope, access, ground conditions, preparation, drainage, permits and taxes require contractor assessment. Explain the actual client's inclusions/exclusions in `pricing.assumptions`.

## Formspree and existing API integration

The default `contact.mode: 'demo'` validates locally and explicitly confirms **nothing was sent**. No contact data is sent, logged or stored. There is no fake “message sent” state.

For Formspree, create/verify the client's form and configure:

```js
contact: {
  mode: 'endpoint',
  endpoint: 'https://formspree.io/f/YOUR_FORM_ID',
  afterSubmission: 'YOUR CONTRACTOR-APPROVED FOLLOW-UP EXPLANATION',
  privacyUrl: '/privacy.html', // supply the actual published policy
}
```

The browser detects Formspree automatically and POSTs JSON with `Accept: application/json`. Fields include `name`, `email` or `phone`, `preferred_contact`, `project_location`, `project_type`, `area_sq_ft`, `finish`, `concrete_removal` and a readable `message` containing notes, measurement details and the calculated range. Success appears only after Formspree returns a successful status and `{ "ok": true }`. A missing acceptance, failure or timeout preserves inputs and shows a retry message. No real Formspree endpoint is supplied or contacted in the tests; mocked responses verify the integration path. Confirm real inbox delivery before launch.

Existing non-Formspree HTTPS JSON endpoints remain supported with the original top-level contract:

```json
{
  "name": "Customer name",
  "method": "email",
  "contact": "customer@example.com",
  "location": "Project location",
  "notes": "Optional notes",
  "project": {
    "type": "driveway",
    "measurement": "dimensions",
    "length": 20,
    "width": 20,
    "area": 400,
    "finish": "broom",
    "removal": false,
    "demo": false
  },
  "estimate": { "available": true, "low": 3200, "high": 4800 }
}
```

A generic endpoint must return 2xx only after accepting the inquiry. Production quote-only mode sends `estimate: { available: false }`. No credentials belong in the public configuration. Keep mail/CRM/API secrets on the receiving server. The template includes a honeypot, validation and duplicate-submit prevention. Configure server-side validation, rate limiting, spam controls, appropriate CORS and duplicate handling at the receiving endpoint. Treat all calculator totals as untrusted client input.

Optional analytics: configure a function receiving `{ name, properties }`. Supported events: `estimate_cta`, `calculator_start`, `calculator_complete`, `phone_click`, `inquiry_success`. Only project type and finish are passed as properties. Names, contact details, notes and locations are never included. Demo submissions never emit success. Apply any required privacy/consent configuration before enabling tracking.

## Vercel

The existing `vercel.json` is retained: Vite, `npm ci`, `npm run build`, output `dist`. Use Node.js 24.x. Vercel's Root Directory must contain `package.json`; leave it unset if the project is at the Git repository root. Vercel's Git integration sees committed/pushed files, not changes present only in this workspace. **Do not push to a deployment-connected branch or deploy unless explicitly requested.** Keep demo mode on for a demonstration; launching a real contractor site still requires the checklist below.

## Missing before a real client launch

- Real approved business name, location/service areas, phone/email, hours and description.
- Approved actual services, finishes, rates, minimums and exclusions (or leave pricing disabled).
- Client-owned/licensed logo, favicon and actual completed-project photography.
- Genuine optional reviews with source links, credentials and warranties; none have been invented.
- Confirmed project process, FAQ policies and real follow-up explanation.
- Live Formspree/API destination, verified delivery, server-side spam protection and privacy policy.
- Real domain, final review and explicit deployment authorization.

## Image provenance

The three `public/images/concrete-*.webp` images are AI-generated architectural illustrations, created for this demonstration and compressed to WebP. They are labeled as illustrative, not represented as completed contractor work, and appear in the demo gallery only. Replace them with the client's genuine photographs before live launch.
