/** CLIENT CONFIGURATION
 * Replace the sample content here for each contractor. Keep demo: true until
 * business details, rates, imagery and quote delivery are approved and tested.
 * These illustrative rates are NOT a contractor's quote or verified pricing.
 */
export const client = {
  demo: true,
  business: {
    name: "Example Concrete Co.",
    descriptor: "RESIDENTIAL CONCRETE",
    logo: null,
    primaryCity: "McKinney",
    region: "Texas",
    serviceAreas: [],
    phone: null,
    email: null,
    hours: null,
    description: null,
    approved: false,
    website: null,
  },
  brand: { accent: "#344443", accentLight: "#e7ece8", warm: "#f4f1ea" },
  hero: {
    image: "/images/concrete-driveway.webp",
    width: 1536,
    height: 1024,
    alt: "Illustrative finished concrete driveway outside a landscaped North Texas home",
    kind: "generated",
    caption: "Illustrative demo image · not a completed client project",
  },
  services: [
    {
      id: "driveway",
      name: "Driveways",
      eyebrow: "A WELCOME HOME",
      description:
        "Create a clear, practical approach to your home. Explore a new driveway or plan the replacement of an existing concrete surface.",
      benefit: "A considered approach to your home",
      icon: "driveway",
      sample: true,
    },
    {
      id: "patio",
      name: "Patios",
      eyebrow: "MORE ROOM FOR EVERYDAY LIFE",
      description:
        "Make space for a quiet morning, a family dinner or an evening outside. Plan a concrete patio around the way you use your backyard.",
      benefit: "A place to settle in outside",
      icon: "patio",
      sample: true,
    },
    {
      id: "walkway",
      name: "Walkways",
      eyebrow: "CONNECT YOUR SPACE",
      description:
        "Bring your entry, garden and outdoor spaces together with a defined concrete path. Start with the route that works for your property.",
      benefit: "A thoughtful connection from here to there",
      icon: "walkway",
      sample: true,
    },
  ],
  // Genuine completed client projects only: { image, width, height, alt,
  // caption, location? }. Never add generated images as completed work.
  projects: [],
  // Displayed only in demo when no actual client projects have been supplied.
  illustrations: [
    {
      image: "/images/concrete-driveway.webp",
      width: 1536,
      height: 1024,
      alt: "Generated illustration of a concrete driveway leading to a residential garage",
      caption: "A welcoming arrival",
      type: "Driveway",
    },
    {
      image: "/images/concrete-patio.webp",
      width: 1536,
      height: 1024,
      alt: "Generated illustration of a concrete backyard patio with outdoor seating",
      caption: "An everyday escape",
      type: "Patio",
    },
    {
      image: "/images/concrete-walkway.webp",
      width: 1536,
      height: 1024,
      alt: "Generated illustration of a concrete walkway through residential landscaping",
      caption: "A path that brings it together",
      type: "Walkway",
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
        title: "Share your project",
        text: "Tell us what you have in mind, your approximate project size and where the work would take place.",
      },
      {
        title: "Confirm scope & pricing",
        text: "Review site access, preparation, finishes and project details before agreeing on a final quote.",
      },
      {
        title: "Schedule the work",
        text: "Confirm the scope and schedule with your contractor before your project begins.",
      },
    ],
  },
  faqs: [
    {
      question: "Is the calculator a final quote?",
      answer:
        "No. This demo uses clearly labeled sample rates to show a ballpark range. A real quote depends on site access, ground conditions, preparation and specifications assessed by your contractor.",
      sample: true,
    },
    {
      question: "How do I measure my project?",
      answer:
        "For a rectangular area, multiply its length by its width in feet to get square feet. You can enter either the total area or both dimensions in the calculator. For irregular shapes, add up smaller rectangular sections. A contractor should confirm final measurements.",
      sample: false,
    },
    {
      question: "Can I include removal of existing concrete?",
      answer:
        "This demo includes an optional removal allowance, calculated per square foot of the selected project area. Actual removal scope, access and disposal must be confirmed with the contractor.",
      sample: true,
    },
    {
      question: "What should I share when requesting a quote?",
      answer:
        "Include your project type, approximate area and location. Notes about existing surfaces, access and your preferred finish help describe the project. Your contractor will assess preparation and project specifications.",
      sample: false,
    },
  ],
  pricing: {
    approved: false,
    currency: "USD",
    locale: "en-US",
    minArea: 50,
    maxArea: 5000,
    minDimension: 1,
    maxDimension: 500,
    defaultArea: 400,
    defaultLength: 20,
    defaultWidth: 20,
    defaultType: "driveway",
    defaultFinish: "broom",
    minimum: { low: 1500, high: 2000 },
    // Installed $/sq ft for the included broom finish. No structural specs
    // are prescribed; the contractor must assess each project's requirements.
    rates: {
      driveway: { low: 8, high: 12 },
      patio: { low: 10, high: 15 },
      walkway: { low: 9, high: 14 },
    },
    finishes: [
      {
        id: "broom",
        name: "Broom finish",
        included: true,
        perSqFt: { low: 0, high: 0 },
      },
      {
        id: "smooth",
        name: "Smooth finish",
        included: false,
        perSqFt: { low: 1, high: 2 },
      },
    ],
    extras: { removal: { low: 2, high: 4 } },
    assumptions:
      "Sample installed rates per square foot include the selected base finish. An optional finish upgrade and existing-concrete removal add only their configured per-square-foot allowances. Apply the minimum job charge to each end of the range after extras. No other taxes, permits, drainage, access or site-specific preparation costs are modeled. No slab thickness, reinforcement or structural specifications are assumed.",
  },
  contact: {
    // 'demo' sends nothing. Use 'endpoint' for a JSON API or a Formspree URL.
    // A configured https://formspree.io/f/... endpoint is detected automatically.
    mode: "demo",
    endpoint: null,
    afterSubmission: null,
    privacyUrl: null,
  },
  // Receives only non-personal allowlisted events. Never pass form details.
  analytics: null,
};
