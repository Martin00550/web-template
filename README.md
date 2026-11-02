# Oak & Fern — Irish landscaping template

A reusable residential landscaping website with a fictional Galway business, a text-only wordmark, sample local service areas and clearly labelled garden illustrations. Built on the existing vanilla JavaScript, CSS and Vite project; the calculator, gallery, accessibility features and quote delivery flows are retained.

## Run and check

Use Node.js 24 (minimum 22.12). In `/workspace/web-template`:

```sh
npm ci
npm run dev -- --port 5173
npm test
npm run test:browser
npm run build
```

Browser checks start/stop their own server on port 4175. Use system Chromium at `/usr/bin/chromium`, set `CHROMIUM_PATH`, or install one with `npx playwright install chromium`. Screenshots go to ignored `test-results/`. The suite checks six widths from 320 to 1440px, metric measurements, prices, allowances, minimums, unpriced services, gallery enlargement, navigation, form validation, endpoint acceptance/error paths, preserved inputs and production safeguards. Unit tests also cover metadata and invalid pricing.

## Personalise for another client

All client information is in **`src/client-config.js`**:

- Replace the fictional name, Galway/Oranmore/Barna/Moycullen service areas, phone, email, optional logo and business description. The sample phone is deliberately non-operational, and the email uses the reserved `.example` domain. Set `business.mockContacts: false` only after replacing them with real contacts. Until then, no dial or email links are created.
- Change `brand` colours, retaining good text contrast. The forest-green/limestone palette, serif headings and text wordmark suit the sample garden business. Replace `public/favicon.svg` with the client's favicon too.
- Keep only actual services, adjust their names/descriptions/photos, and clear their `sample` flags after approval. Current IDs are `patio`, `lawn` and `planting`; planting is intentionally not given an invented area-based price.
- Replace `hero` and its alt text with genuine, licensed client photography and set `kind: 'client'`. Add real projects to `projects` as `{image,width,height,alt,caption,type?,location?}`. Only state locations when confirmed. The separate demo `illustrations` array is never presented as completed work or before/after results.
- Add only genuine reviews `{text,author,source}`, substantiated strengths `{title,text}`, and verified credentials/insurance/warranties. Empty optional sections remain hidden. Confirm the real process and FAQs before approving them.
- Configure contractor-approved rates, minimums, site preparation allowances, exclusions and VAT treatment. Set `pricing.approved: true` only after approval. Disable numeric pricing with `pricing: null` or omit rates for individual services to use the quote-only flow.
- Connect the real quote destination, privacy policy and approved follow-up explanation. Set `business.approved: true` and `demo: false` only after replacing fictional contacts and generated hero photography. Shared checks in `src/client-readiness.js` prevent an incomplete live build/render.

## Calculator: project m² and euros

Visitors enter patio/lawn area directly or use length × width in metres. For irregular shapes, combine smaller rectangular areas. A landscaper must confirm final measurements, site access, levels, ground conditions and preparation. No drainage design, retaining structures or engineering specifications are prescribed.

For each configured low/high bound:

```text
area = entered m² OR length × width in metres
base = area × selected service rate per m²
preparation = included ? 0 : area × extra preparation allowance
extras = sum(configured flat charges and per-m² allowances)
result = round(max(minimum charge, base + preparation + extras))
```

Included preparation is never charged twice. Low/high rates are explicit, with no invented uncertainty percentage. Optional extras use `{id,name,unit:'m2'|'flat',low,high}`; none are enabled in this demonstration. Unknown or duplicate extras and invalid rates are rejected.

**Fictional sample rates, not market guidance:**

| Selection                                   | Illustrative EUR range |
| ------------------------------------------- | ---------------------- |
| 30 m² patio, standard preparation allowance | €2,550–€3,750          |
| 30 m² patio, extra preparation              | €2,910–€4,350          |
| 40 m² patio, extra preparation              | €3,880–€5,800          |
| 30 m² lawn, standard preparation            | €650–€950 minimum      |

Sample limits: 5–1,000 m² and dimensions of 0.5–100 metres. Minimum low/high charges are €650/€950. The sample amounts include a fictional material/installation allowance and VAT; no VAT is added again. They do not establish a real business's VAT registration or tax rate. Confirm actual material choices, scope, inclusions, exclusions and VAT treatment before launch. Major excavation, drainage works, planting schemes, retaining structures and restricted-access equipment are not priced here. Update `taxNote` and `assumptions` along with rates.

## Quote delivery

Default `contact.mode: 'demo'` validates locally and explicitly says **nothing was sent**. No contact information is logged, stored or passed to analytics.

Use `mode: 'endpoint'` with a real HTTPS Formspree URL or existing JSON API. The Formspree adapter sends JSON with `Accept: application/json`; success requires both a successful HTTP response and `{ "ok": true }`. Failure or timeout preserves all input and allows retry. No real destination has been supplied; tests intercept and simulate delivery.

Formspree receives name, email OR phone, preferred contact method, project location/type, `area_sq_m`, preparation, extras and a readable message including the selected range. Generic APIs retain the top-level contract:

```json
{
  "name": "Customer name",
  "method": "email",
  "contact": "customer@example.com",
  "location": "Town or Eircode",
  "notes": "Project details",
  "project": {
    "type": "patio",
    "measurement": "dimensions",
    "unit": "m2",
    "length": 6,
    "width": 5,
    "area": 30,
    "preparation": "sound",
    "extras": [],
    "demo": false
  },
  "estimate": { "available": true, "low": 2550, "high": 3750 }
}
```

Unpriced services send `project.area: null` and `estimate: {available:false}`. A generic endpoint must only return 2xx after accepting an enquiry. Configure server-side validation, rate limiting, spam protection, duplicate handling and CORS. Keep all integration credentials server-side. The template retains a honeypot and duplicate-submit prevention; submitted totals remain untrusted client input.

Optional analytics receive only non-personal service/preparation identifiers for `quote_cta`, `calculator_start`, `calculator_complete`, `phone_click`, `inquiry_success`. Never send names, contacts, locations or notes. Demo submissions never emit a success event. Apply any required privacy/consent controls before enabling tracking.

## Launch and Vercel

Supply approved business details, real contacts, genuine client photos, actual service areas, approved pricing/VAT assumptions or disabled numeric pricing, a live tested form endpoint, real privacy policy and domain. Reviews and credentials are optional; do not invent them. Metadata is rendered into the built HTML from configuration, with factual `LandscapingBusiness` structured data outside demo mode. The fictional demo remains `noindex`.

The existing Vercel settings remain: Vite, `npm ci`, `npm run build`, output `dist`, Node 24.x. Root Directory must contain `package.json`. Git-connected Vercel sees only pushed commits. Do not push to a deployment-connected branch, publish or deploy without an explicit request. The previously removed sticky mobile CTA stays removed.

## Image provenance

The four `public/images/landscape-*.webp` assets are generated illustrations of possible Irish garden designs, compressed to WebP. They are labelled in the hero/gallery and are not completed projects, real customer gardens or before/after transformations. Replace them with licensed client work before a live business launch.
