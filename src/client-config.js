/** CLIENT CONFIGURATION — all sample business content and rates live here.
 * Keep demo=true until every launch requirement in README.md is satisfied.
 * Prices below illustrate the calculator. They are NOT contractor-approved.
 */
export const client = {
  demo: true,
  business: {
    name: "Cedar & Field",
    descriptor: "FENCE COMPANY",
    logo: null,
    primaryCity: "Austin",
    region: "TX",
    serviceAreas: [],
    phone: null,
    email: null,
    hours: null,
    description: null,
    approved: false,
    website: null,
  },
  brand: { accent: "#354638", accentLight: "#e8ece4", warm: "#f4f2eb" },
  hero: {
    image: "/images/fence-hero.webp",
    width: 1536,
    height: 1024,
    alt: "Illustrative cedar privacy fence beside a landscaped residential garden",
    kind: "generated",
    caption: "Illustrative design image. Not a completed client project.",
  },
  services: [
    {
      id: "cedar",
      name: "Cedar wood",
      eyebrow: "NATURALLY AT HOME",
      description:
        "Warm wood grain and a classic backyard feel. Explore a layout that gives your outdoor space a little more privacy.",
      benefit: "Privacy with natural character",
      icon: "wood",
      sample: true,
    },
    {
      id: "vinyl",
      name: "Vinyl",
      eyebrow: "A CLEAN, SIMPLE LOOK",
      description:
        "Clean lines for a defined backyard. Compare styles and heights to find a look that suits your home.",
      benefit: "A fresh, consistent finish",
      icon: "vinyl",
      sample: true,
    },
    {
      id: "aluminum",
      name: "Aluminum",
      eyebrow: "KEEP THE VIEW OPEN",
      description:
        "An open fence style that defines your space while keeping the garden in view. A different approach to your boundary.",
      benefit: "Definition without closing in",
      icon: "metal",
      sample: true,
    },
  ],
  // Only actual, approved contractor work belongs in this gallery.
  projects: [],
  reviews: [],
  credentials: [],
  warranties: [],
  insurance: [],
  reasons: [],
  process: {
    approved: false,
    steps: [
      {
        title: "Share your project",
        text: "Start with your fence style, approximate length and project location.",
      },
      {
        title: "Confirm scope & pricing",
        text: "Review the materials, site conditions and details needed for a final quote.",
      },
      {
        title: "Schedule the work",
        text: "Agree on the project scope and schedule before work begins.",
      },
    ],
  },
  faqs: [
    {
      question: "Is the calculator a final quote?",
      answer:
        "No. It shows an illustrative price range using sample rates. A final quote requires contractor-approved pricing and an assessment of your site, materials and project scope.",
      sample: true,
    },
    {
      question: "How do I estimate the length of my fence?",
      answer:
        "Measure each proposed fence run in feet and add the lengths together. A rough measurement is enough to explore this calculator. Exact measurements should be confirmed before a final quote.",
      sample: false,
    },
    {
      question: "What details should I include in my inquiry?",
      answer:
        "Include your project location, approximate fence length, preferred material and whether you need gates or removal. Additional site details can be included in your notes.",
      sample: false,
    },
  ],
  pricing: {
    approved: false,
    currency: "USD",
    locale: "en-US",
    minLength: 10,
    maxLength: 1000,
    defaultLength: 150,
    defaultType: "cedar",
    defaultHeight: 6,
    minimum: { low: 1500, high: 2000 },
    rates: {
      cedar: { low: 28, high: 38 },
      vinyl: { low: 32, high: 46 },
      aluminum: { low: 35, high: 50 },
    },
    heights: [
      { feet: 4, multiplier: 0.8 },
      { feet: 6, multiplier: 1 },
      { feet: 8, multiplier: 1.25 },
    ],
    extras: {
      gate: { low: 250, high: 450, max: 5 },
      removal: { low: 3, high: 5 },
    },
    assumptions:
      "Sample installed rates per linear foot; height multiplies the fence portion only. Add each walk gate and removal per foot, then apply the minimum job charge to each end of the range. No other taxes, permits or site costs are modeled.",
  },
  contact: {
    // mode: 'demo' | 'endpoint'. An endpoint must accept JSON via HTTPS and return
    // a 2xx response only after accepting the inquiry. Never put credentials here.
    mode: "demo",
    endpoint: null,
    afterSubmission: null,
    privacyUrl: null,
  },
  // Optional function receiving {name, properties}; only non-personal allowlisted
  // calculator data is supplied. Do not pass contact fields to analytics.
  analytics: null,
};
