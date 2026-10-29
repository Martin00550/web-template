# New Zealand painting contractor template

The current navy, warm-white and burnt-orange site, adapted for an independent painter. **Example Painting Co.** and the bracketed values are deliberate demo placeholders. There are no invented reviews, qualifications, insurance statements, guarantees or completed projects.

## Develop and verify

Requires Node.js 22.12+; Node 24 is recommended. In `/workspace/web-template`:

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

The existing Vite stack, components, gallery dialog, form validation, Formspree support and generic JSON endpoint flow are retained. No runtime framework or backend was added. The previously removed sticky mobile bar stays removed; the compact header has a call control instead.

Browser tests run their own server on port 4175. They use `/usr/bin/chromium`, `CHROMIUM_PATH` or an installed Playwright Chromium (`npx playwright install chromium`). Screenshots are written to ignored `test-results/`. Tests cover six widths (320–1440px), gallery order/enlargement, metric calculation, allowances/minimums, missing-pricing fallback, phone/email placeholders, configured mobile call links, form validation, mocked endpoint/Formspree responses and production guards. Sample-data expectations should be reviewed when intentionally changing rates or services.

## Duplicate for a new client

**`src/client-config.js`** is the central configuration.

1. Replace `Example Painting Co.`, `[City]`, `[Areas]`, `[Phone]`, `[Email]` and `[Logo]`. Enter actual service areas as an array, a real NZ phone number (preferably `+64…`), a real email and the client logo path. Add approved hours/description when supplied. No placeholders become working `tel:`, `mailto:` or image links. The demo call button is disabled until a real phone is configured.
2. Keep or update the configurable navy/warm-white/orange colours while preserving contrast. Replace `public/favicon.svg` with the client favicon if available.
3. Configure actual services and concise approved descriptions. Each has `id`, `name`, `shortName`, `eyebrow`, `description`, `cta` and `sample`. Clear `sample` after client approval. Sample service IDs are `interior`, `exterior` and `joinery`; the unpriced joinery option uses an individual quote flow.
4. Replace `hero` with a licensed client photo, correct dimensions, descriptive alt text and `kind: 'client'`. Add genuine work to `projects` as `{image,width,height,alt,caption,type?,location?}`. Include locations only when known. The separate `illustrations` array is shown only in demo and is never called completed work or before/after results. Add genuine before/after pairs only when supplied and verified as the same project.
5. Replace every sample price, minimum, preparation allowance and optional extra with contractor-approved rates. Confirm paint/material inclusions, access, surface condition, exclusions and GST treatment. Set `pricing.approved: true` only after approval. Use `pricing: null`, empty rates or an unpriced service for an individual quote flow with no invented price.
6. Add verified `credentials`, `insurance` and `warranties` as approved strings; genuine `reviews` as `{text,author,source}`; substantiated `reasons` as `{title,text}`. Empty optional sections are hidden. Review FAQs and the actual process, then clear sample flags and set `process.approved` where appropriate. Never add assumed years of experience, qualifications, response times or guarantees.
7. Configure the quote destination and real privacy policy, test acceptance and verify delivery. Keep credentials server-side. Set a truthful client-approved `afterSubmission` message if known. Photo uploads remain omitted until the selected integration supports them securely.
8. Replace the hero illustration and all bracketed business values, approve services/business details and set `demo: false` only when ready. Shared checks in `src/client-readiness.js` block a live build/render with unresolved contact/location/logo placeholders, an unapproved business, no actual services, generated hero photography or missing quote delivery/privacy policy. Demo metadata stays `noindex`; the form still sends nothing until configured.
9. Set `business.website` to the real HTTPS domain. Client metadata and accurate `HousePainter` structured data come from configuration. No review scores, credentials or experience are fabricated. Deploy only when explicitly requested.

## Painting estimate: square metres and NZD

The estimate uses **painted surface area in m²**, not a room's floor area. Visitors can enter a combined surface area or measure one rectangular surface using width × height in metres. For multiple walls, add the wall areas and enter the combined total. Openings and final measurements need painter confirmation.

The existing payload keys `length` and `width` are retained for generic endpoint compatibility: in dimensions mode they now mean **surface width in metres** and **surface height in metres**. `project.unit: 'm2'` makes the new unit explicit.

For each supplied low/high bound:

```text
surface area = entered m² OR surface width × height in metres
base = area × configured painting rate per m²
preparation = included ? 0 : area × configured extra preparation allowance
extras = sum(each configured flat charge or per-m² allowance)
estimate = round(max(minimum charge, base + preparation + extras))
```

Included preparation is not charged twice. No invented uncertainty percentage, structural specification or arbitrary coating count is used. Sample rates are fictional demonstrations, not market guidance. They do not model ceilings, doors/trim, major repairs, access equipment or specialist work. Confirm the actual paint system and scope with the painter.

| Illustrative selection                  | Sample NZD range  |
| --------------------------------------- | ----------------- |
| 40 m² interior, sound surface allowance | $720–$1,120       |
| 40 m² interior, extra preparation       | $960–$1,520       |
| 40 m² exterior, sound surface allowance | $1,000–$1,600     |
| 5 m² interior                           | $450–$650 minimum |

All sample amounts include GST for this demonstration, and the calculator does **not** add GST again. This makes no claim about a future client's GST registration or actual pricing. Update both approved rates and `taxNote`/`assumptions` to reflect the client's confirmed treatment before launch. If the client cannot provide approved low/high figures, disable numeric pricing.

Optional extras are configured as `{id,name,unit:'m2'|'flat',low,high}` and appear only when priced. Unknown or duplicate selections are rejected. No extras are enabled in the demo. Demo size limits: 5–1,000 m²; dimensions 0.5–100 metres, with resulting area also within range.

## Quote delivery

`contact.mode: 'demo'` validates locally and explicitly states **nothing was sent**. No contact details are stored or included in analytics.

For Formspree, set `mode: 'endpoint'` and the real `https://formspree.io/f/FORM_ID` destination. The existing integration sends JSON with `Accept: application/json` and only shows success after a successful HTTP status and `{ "ok": true }`. A failure or timeout preserves inputs and enables retry. Tests intercept the request; no actual client endpoint has been supplied or contacted.

The Formspree payload contains name, email OR phone, preferred contact method, project location/type, `area_sq_m`, `preparation`, extras and a readable message including measurement details and the range. Unpriced services send `area_sq_m: null` and request an individual quote.

Generic HTTPS JSON endpoints keep the top-level API contract:

```json
{
  "name": "Customer name",
  "method": "email",
  "contact": "customer@example.com",
  "location": "Suburb or postcode",
  "notes": "Optional notes",
  "project": {
    "type": "interior",
    "measurement": "dimensions",
    "unit": "m2",
    "length": 5,
    "width": 8,
    "area": 40,
    "preparation": "sound",
    "extras": [],
    "demo": false
  },
  "estimate": { "available": true, "low": 720, "high": 1120 }
}
```

A generic endpoint must return 2xx only after accepting the enquiry. Quote-only mode sends `{available:false}` and `project.area:null`. Configure server-side validation, spam filtering, rate limiting, duplicate handling and appropriate CORS. The template retains a honeypot and duplicate-submit prevention. Treat all submitted totals as untrusted client input. Never put mail/CRM/API credentials in the client configuration.

Optional analytics receive `{name,properties}` with events `quote_cta`, `calculator_start`, `calculator_complete`, `phone_click` and `inquiry_success`. Only selected service/preparation identifiers are included. Names, contacts, location and notes are never included; demo submissions never emit success. Tracking errors cannot interrupt the quote form. Apply any necessary privacy/consent requirements before enabling tracking.

## Before launch

Supply real client identity, city, actual areas, phone, email, logo and licensed project photos; approved services and process; approved pricing and GST assumptions or no numeric rates; a working contact destination, privacy policy and truthful follow-up explanation; the real domain and explicit deployment authorisation. Genuine reviews, credentials and warranties are optional and remain hidden when missing.

`vercel.json` is retained (Vite, `npm ci`, `npm run build`, output `dist`). Use Node.js 24.x and the directory containing `package.json`. Git-connected Vercel sees only committed/pushed files. Do not push to a deployment-connected branch or publish without an explicit request.

## Image provenance

The four `public/images/painting-*.webp` images are generated architectural illustrations compressed to WebP. They show possible colours/finishes, not actual work, verified locations or before/after transformations. Both the hero and demo gallery label the illustrations. Replace them with the client's genuine work before launching the business site.
