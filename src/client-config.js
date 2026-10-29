/** CLIENT CONFIGURATION — edit this file for each painting contractor.
 * Bracketed values are deliberate demo placeholders, never working contacts.
 * Keep demo=true until client details, imagery, pricing and delivery are approved.
 */
export const client = {
  demo: true,
  business: {
    name: "Example Painting Co.",
    descriptor: "INDEPENDENT PAINTER · NEW ZEALAND",
    logo: "[Logo]",
    primaryCity: "[City]",
    region: "New Zealand",
    serviceAreas: ["[Areas]"],
    phone: "[Phone]",
    email: "[Email]",
    hours: null,
    description: null,
    approved: false,
    website: null,
  },
  brand: { accent: "#344443", accentLight: "#e7ece8", warm: "#f4f1ea" },
  hero: {
    image: "/images/painting-exterior.webp",
    width: 1536,
    height: 1024,
    alt: "Illustrative freshly painted New Zealand weatherboard home with ivory walls and dark green joinery",
    kind: "generated",
    caption: "Illustrative demo image · not completed client work",
  },
  services: [
    {
      id: "interior",
      name: "Interior painting",
      shortName: "Interior",
      eyebrow: "A FRESH FEEL, ROOM BY ROOM",
      description:
        "Refresh the rooms you spend time in. Discuss your walls, colours and finish, from one room to a wider interior repaint.",
      cta: "Plan an interior project",
      sample: true,
    },
    {
      id: "exterior",
      name: "Exterior painting",
      shortName: "Exterior",
      eyebrow: "A NEW LOOK FOR THE OUTSIDE",
      description:
        "Plan an exterior repaint around your home’s surfaces and condition. Start with a conversation about preparation, access and the look you want.",
      cta: "Plan an exterior project",
      sample: true,
    },
    {
      id: "joinery",
      name: "Doors & trim",
      shortName: "Doors & trim",
      eyebrow: "THE FINISHING DETAILS",
      description:
        "Bring doors, skirting and other painted timber details into the plan. These smaller surfaces need their own scope and an individual quote.",
      cta: "Ask about doors & trim",
      sample: true,
    },
  ],
  // Real client projects only: {image,width,height,alt,caption,type?,location?}.
  projects: [],
  // Shown in demo only, never described as completed jobs or before/after results.
  illustrations: [
    {
      image: "/images/painting-living.webp",
      width: 1536,
      height: 1024,
      alt: "Generated illustration of a living room with fresh warm white painted walls and crisp white trim",
      caption: "A lighter living space",
      type: "Interior painting",
    },
    {
      image: "/images/painting-exterior.webp",
      width: 1536,
      height: 1024,
      alt: "Generated illustration of an ivory painted New Zealand weatherboard exterior with green joinery",
      caption: "A fresh exterior colour scheme",
      type: "Exterior painting",
    },
    {
      image: "/images/painting-bedroom.webp",
      width: 1536,
      height: 1024,
      alt: "Generated illustration of a bedroom with sage painted walls and white timber trim",
      caption: "A calmer colour for the bedroom",
      type: "Interior painting",
    },
    {
      image: "/images/painting-trim.webp",
      width: 1536,
      height: 1024,
      alt: "Generated illustration of a green painted panel door and white timber architraves",
      caption: "Details that bring it together",
      type: "Doors & trim",
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
        title: "Tell us what you have in mind",
        text: "Share the rooms or exterior surfaces, your location and any colours or finishes you are considering.",
      },
      {
        title: "Discuss preparation & pricing",
        text: "Talk through the surface condition, access and scope so your painter can prepare a project-specific quote.",
      },
      {
        title: "Agree on the next steps",
        text: "Confirm the work, finish and schedule with your painter before the project begins.",
      },
    ],
  },
  faqs: [
    {
      question: "Is the calculator a final quote?",
      answer:
        "No. The demo uses illustrative rates in New Zealand dollars. A final quote needs an assessment of surface condition, preparation, access and the agreed painting scope.",
      sample: true,
    },
    {
      question: "What area should I measure?",
      answer:
        "Measure the surface to be painted in square metres, not the floor area of the room. For a rectangular wall, multiply its width by its height in metres. Add the wall areas for more than one wall. Your painter should confirm measurements and any deductions for openings.",
      sample: false,
    },
    {
      question: "What preparation is included?",
      answer:
        "Preparation depends on the condition of the existing surface and the finish being requested. Discuss what needs to be cleaned, repaired or prepared with your painter, and make sure the agreed work is listed in the final quote.",
      sample: false,
    },
    {
      question: "Can I request a quote for a small project?",
      answer:
        "Describe the room, doors, trim or other surfaces you want painted in the enquiry form. Your painter can discuss the scope and whether it fits the services they offer.",
      sample: false,
    },
  ],
  pricing: {
    approved: false,
    currency: "NZD",
    locale: "en-NZ",
    minArea: 5,
    maxArea: 1000,
    minDimension: 0.5,
    maxDimension: 100,
    defaultArea: 40,
    defaultLength: 5,
    defaultWidth: 2.4,
    defaultType: "interior",
    defaultPreparation: "sound",
    minimum: { low: 450, high: 650 },
    // FICTIONAL DEMO rates per m² of painted surface, not room floor area.
    // All sample amounts include GST for this demonstration. They are not a
    // statement about a real contractor's GST registration or pricing.
    rates: { interior: { low: 18, high: 28 }, exterior: { low: 25, high: 40 } },
    preparation: [
      {
        id: "sound",
        name: "Sound, previously painted surface",
        included: true,
        perSqM: { low: 0, high: 0 },
      },
      {
        id: "extra",
        name: "Extra preparation allowance",
        included: false,
        perSqM: { low: 6, high: 10 },
      },
    ],
    // Optional supported extras: {id,name,unit:'m2'|'flat',low,high}.
    // No unpriced extras are shown or silently charged.
    extras: [],
    taxNote: "NZD · sample amounts include GST",
    assumptions:
      "Illustrative NZD rates per square metre of painted surface include a sample allowance for paint application and basic preparation. Extra preparation adds only the configured per-m² allowance. Apply the minimum charge after extras. Sample amounts include GST; no additional GST is added. Rates are not market guidance or contractor-approved. Ceilings, doors, trim, access equipment, major repairs and specialist work are not priced here. A painter must confirm preparation, paint system, scope and the client’s actual GST treatment.",
  },
  contact: {
    // Existing Formspree and generic HTTPS JSON endpoints are supported.
    // Demo sends nothing. Never put API credentials in this public file.
    mode: "demo",
    endpoint: null,
    afterSubmission: null,
    privacyUrl: null,
  },
  analytics: null,
};
