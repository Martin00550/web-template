/** CLIENT CONFIGURATION — fictional Irish landscaping demonstration.
 * Replace business details, imagery, services, rates and contact destination here.
 * Prices are illustrative, not market guidance. Keep demo enabled until approved.
 */
export const client = {
  demo: true,
  business: {
    name: "Oak & Fern",
    descriptor: "LANDSCAPES · GALWAY, IRELAND",
    logo: "/oak-fern-mark.svg",
    primaryCity: "Galway",
    region: "Ireland",
    serviceAreas: ["Galway", "Oranmore", "Barna", "Moycullen"],
    phone: "+353 00 000 0000",
    mockContacts: true,
    email: "hello@oakandfern.example",
    hours: null,
    description: null,
    approved: false,
    website: null,
  },
  brand: {
    accent: "#243c30",
    accentLight: "#eaf0e5",
    warm: "#f5f2e9",
    action: "#e0bd79",
    actionHover: "#cfa762",
    ink: "#25392d",
    muted: "#5c685b",
    line: "#d9dfd1",
    white: "#fffefa",
    surface: "#eaf0e5",
  },
  hero: {
    image: "/images/landscape-garden.webp",
    width: 1536,
    height: 1024,
    alt: "Illustrative Irish garden with a limestone patio, green lawn and layered planting",
    kind: "generated",
    caption: "Illustrative garden design · not a completed client project",
  },
  services: [
    {
      id: "patio",
      name: "Patios & paving",
      shortName: "Patios",
      image: "/images/landscape-patio.webp",
      eyebrow: "MAKE ROOM FOR OUTSIDE",
      description:
        "A place for slow mornings and long evenings. Explore natural stone paving and a patio layout that works with your home and garden.",
      cta: "Plan a patio",
      sample: true,
    },
    {
      id: "lawn",
      name: "Lawns & turf",
      shortName: "Lawns",
      image: "/images/landscape-lawn.webp",
      eyebrow: "A LITTLE GREENER",
      description:
        "Bring a new lawn into the plan, or rethink a tired patch of garden. Discuss the ground, access and preparation before deciding on turf.",
      cta: "Plan your lawn",
      sample: true,
    },
    {
      id: "planting",
      name: "Planting & garden design",
      shortName: "Planting",
      image: "/images/landscape-planting.webp",
      eyebrow: "LET YOUR GARDEN GROW",
      description:
        "Shape a garden with texture, seasonal interest and space to breathe. Planting schemes need their own conversation about the site and what you enjoy.",
      cta: "Discuss your garden",
      sample: true,
    },
  ],
  projects: [],
  illustrations: [
    {
      image: "/images/landscape-patio.webp",
      width: 1536,
      height: 1024,
      alt: "Generated illustration of an Irish limestone garden patio with outdoor seating",
      caption: "A place to slow down",
      type: "Patios & paving",
    },
    {
      image: "/images/landscape-garden.webp",
      width: 1536,
      height: 1024,
      alt: "Generated illustration of a layered Irish cottage garden",
      caption: "A garden that feels like home",
      type: "Garden inspiration",
    },
    {
      image: "/images/landscape-lawn.webp",
      width: 1536,
      height: 1024,
      alt: "Generated illustration of a small green lawn and softly planted borders",
      caption: "Space for the everyday",
      type: "Lawns & turf",
    },
    {
      image: "/images/landscape-planting.webp",
      width: 1536,
      height: 1024,
      alt: "Generated illustration of ferns, grasses and perennials beside an Irish stone wall",
      caption: "Soft edges. Seasonal texture.",
      type: "Planting design",
    },
  ],
  reviews: [],
  credentials: [],
  warranties: [],
  insurance: [],
  reasons: [],
  process: {
    approved: false,
    steps: [
      {
        title: "Tell us about your garden",
        text: "Share your ideas, the space you have and how you would like to use it.",
      },
      {
        title: "Walk through the possibilities",
        text: "Discuss access, ground conditions, materials and scope before agreeing on a project quote.",
      },
      {
        title: "Bring the plan together",
        text: "Confirm the work and schedule with your landscaper before your project begins.",
      },
    ],
  },
  faqs: [
    {
      question: "Is the calculator a final quote?",
      answer:
        "No. The demo uses fictional rates in euros to show a starting range. Ground conditions, access, excavation, drainage and material choices need to be assessed before a real quote.",
      sample: true,
    },
    {
      question: "How should I measure my garden project?",
      answer:
        "For a rectangular patio or lawn, multiply length by width in metres. For an irregular shape, add smaller rectangular areas together. A landscaper should confirm all final measurements.",
      sample: false,
    },
    {
      question: "Can I discuss a complete garden redesign?",
      answer:
        "Use the enquiry form to describe the garden, what you want to change and how you hope to use the space. Planting and full garden schemes need a project-specific discussion and quote.",
      sample: false,
    },
    {
      question: "What preparation might be needed?",
      answer:
        "Existing surfaces, soil levels, drainage and access all affect preparation. Discuss these during the site assessment and confirm what is included in the written scope.",
      sample: false,
    },
  ],
  pricing: {
    approved: false,
    currency: "EUR",
    locale: "en-IE",
    minArea: 5,
    maxArea: 1000,
    minDimension: 0.5,
    maxDimension: 100,
    defaultArea: 30,
    defaultLength: 6,
    defaultWidth: 5,
    defaultType: "patio",
    defaultPreparation: "sound",
    minimum: {
      low: 650,
      high: 950,
    },
    rates: {
      patio: {
        low: 85,
        high: 125,
      },
      lawn: {
        low: 18,
        high: 30,
      },
    },
    preparation: [
      {
        id: "sound",
        name: "Standard site preparation allowance",
        included: true,
        perSqM: {
          low: 0,
          high: 0,
        },
      },
      {
        id: "extra",
        name: "Extra site preparation allowance",
        included: false,
        perSqM: {
          low: 12,
          high: 20,
        },
      },
    ],
    extras: [],
    taxNote: "EUR · illustrative amounts include VAT",
    assumptions:
      "Fictional demonstration rates per square metre, including a sample material and installation allowance with standard site preparation. The extra site-preparation option adds only its configured per-m² allowance. Minimum charge applies after allowances. Sample amounts include VAT and no VAT is added again; this is not a statement about a real business’s registration or tax rate. Drainage works, major excavation, retaining structures, planting schemes and restricted-access equipment are not priced here. Materials, preparation and actual VAT treatment require client approval.",
  },
  contact: {
    mode: "demo",
    endpoint: null,
    afterSubmission: null,
    privacyUrl: null,
  },
  analytics: null,
};
