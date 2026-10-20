# Residential fence company template

A customer-facing, mobile-first website built with vanilla JavaScript and CSS, with Vite for development and static builds. No runtime framework, backend, tracking SDK or account is required.

## Run locally

Requires Node.js 22.12+ (Node 24 recommended) and npm. From `/workspace/web-template`:

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

Browser tests use system Chromium when `/usr/bin/chromium` exists. Else set `CHROMIUM_PATH` or run `npx playwright install chromium`. They start and stop their own local server on port 4175, check six widths (320–1440px), calculator arithmetic/validation, navigation, forms, endpoint success/failure, production guards and optional configuration. Screenshots are saved under ignored `test-results/`.

## Duplicate for a new client

1. Copy this project and edit **`src/client-config.js`**. This is the single source for business details, branding, services, projects, pricing, reviews, verified statements and form integration.
2. Replace the fictional name, demo city and descriptor. Add the real phone in international format, email, hours, approved description and actual service areas. Add a logo under `public/` and its path to `business.logo`. Choose accessible brand colors: the accent must contrast with light button text.
3. Replace the hero with a licensed client photo under `public/images/`. Set correct dimensions and meaningful alt text. Mark `hero.kind: 'client'` only for genuine client work. Add real completed projects to `projects`, each with `image`, `alt`, `width`, `height`, `caption` and an optional confirmed `location`. The generated garden illustration is explicitly labeled in demo and must not be presented as a completed job.
4. Configure actual services. Each needs a unique `id`, `name`, `eyebrow`, `description`, `benefit` and `icon` (`wood`, `vinyl` or `metal`). Set `sample: false` only after confirming the service and copy. Remove services the client does not offer. Default calculator type must match an offered service.
5. Replace every sample rate with contractor-approved values. Rates use matching service IDs and `{low, high}` per linear foot. Configure height multipliers, minimum job charges and supported extras. Remove an unsupported extra to hide its control. Set `pricing.approved: true` only after approval. You can use `pricing: null` for a quote-only workflow: no invented numeric result is shown.
6. Confirm the real project process and set `process.approved: true`, or leave it unapproved to hide it outside demo. Supply only genuine `reviews: [{text, author, source}]`, verified `reasons: [{title, text}]` and confirmed credentials, insurance or warranty statements (arrays of approved strings). Empty optional sections are hidden. Review each FAQ and clear its `sample` flag only when approved.
7. Connect quote delivery as described below, add the approved follow-up explanation and a real privacy policy URL. Test a complete inquiry and verify receipt at the destination.
8. Complete the launch checklist, set `business.approved: true` and `demo: false`, then build. Production removes the demo banner and `noindex`; it blocks rendering if business details, actual services or the endpoint are incomplete. Unapproved rates and sample services/FAQs/process copy are hidden.
9. Point the client's domain at a static host of your choice and deploy the `dist/` directory **only when explicitly authorized**. Set `business.website` to the real HTTPS canonical URL. Production title, description, indexing policy and canonical URL are written into the built HTML. Known business facts generate basic structured data; no review scores, address or opening-hour claims are invented. Review title/description and add a canonical tag if your host requires it.

## Calculator formula

For each bound (`low`, `high`):

```text
fence = linear feet × per-foot rate × chosen height multiplier
gates = gate count × configured per-gate rate
removal = removal selected ? linear feet × removal rate : 0
result = round(max(minimum job charge, fence + gates + removal))
```

Low and high rates must both be contractor supplied. There is no invented percentage or confidence interval. The sample default is 150 ft of 6 ft cedar at $28–$38/ft, or $4,200–$5,700. Sample limits are 10–1,000 ft and up to 5 walk gates. At 200 ft, 8 ft height, 2 gates and removal, the sample range is $8,100–$11,400. Taxes, permits, site work and other unconfigured charges are excluded. Explain the actual client's inclusions in `pricing.assumptions`.

## Quote delivery contract

By default, `contact.mode: 'demo'` validates the form and explicitly confirms **nothing was sent**. No contact data is sent, logged, stored or included in analytics.

For live use, configure `contact.mode: 'endpoint'` and an HTTPS `contact.endpoint` (or same-origin `/api/quote`). The browser sends a JSON POST:

```json
{
  "name": "Customer name",
  "method": "email",
  "contact": "customer@example.com",
  "location": "Project location",
  "notes": "Optional notes",
  "project": {
    "type": "cedar",
    "length": 150,
    "height": 6,
    "gates": 0,
    "removal": false,
    "demo": false
  },
  "estimate": { "available": true, "low": 4200, "high": 5700 }
}
```

Return 2xx only after actually accepting an inquiry. Other statuses/network errors show a retry message. A successful request stays disabled to prevent accidental repeat submissions. The static template has a honeypot and client-side input validation; the receiving endpoint must validate inputs again, apply length limits/rate limits/spam filtering, restrict CORS to the client's domain and protect against repeated requests. Treat calculator totals as untrusted client input. Keep all mail/CRM/API credentials server-side. Do not place secrets in the client config or Vite public variables. Photo uploads are intentionally absent until a secure upload integration is implemented.

Optional analytics: set `analytics` to a function receiving `{name, properties}`. Supported events are `estimate_cta`, `calculator_start`, `calculator_complete`, `phone_click` and `inquiry_success`. Properties only contain selected fence type/height; no names, contacts, locations or notes. The success event is never emitted by demo mode. Add tracking only with appropriate client privacy/consent requirements.

## Missing before launch

### Deploying a demo to Vercel

Vercel's Git integration builds files committed and pushed to GitHub; files present only in a cloud workspace are not available to it. Commit and push the project to the branch selected in Vercel before deploying. The included `vercel.json` selects Vite, `npm ci`, `npm run build` and the `dist` output directory. Set Vercel's Root Directory to the directory containing `package.json` (leave it unset when these files are at the repository root), and select Node.js 24.x in project settings. Do not select Next.js or use the development server as the build command. Keep `demo: true` for a demonstration deployment; live client requirements still apply before launching an actual contractor site.

- Real business identity, approved city/service areas, contact details, hours and business copy.
- Confirmed services, site process, FAQs, approved calculator rates and assumptions (or disable pricing).
- Genuine client photography and licensed logo. Current image is an AI-generated, labeled illustration.
- Live, tested contact destination and its server-side validation, spam protection, credentials and privacy policy.
- Real domain and explicit authorization to deploy. No site has been published.
- Optional verified reviews, source links, credentials, insurance statements and warranties. None have been invented.

Demo mode must stay on until these items are supplied. The template deliberately has no agency offer, fabricated ratings, customer testimonials or unsupported business guarantees.

## Image provenance

`public/images/fence-hero.webp` is an AI-generated architectural garden illustration created for this template, compressed to WebP. Both uses are explicitly labeled as illustrative demo imagery. It is not a photograph of contractor work.
