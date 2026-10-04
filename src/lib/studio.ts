export const services = [
  { n: "01", title: "Web Experience", desc: "Cinematic, high-performance websites engineered to convert attention into action.", items: ["Creative websites", "Launch & product pages", "Portfolio experiences", "Headless CMS"] },
  { n: "02", title: "UI / UX Systems", desc: "Interfaces that feel inevitable — researched, prototyped and systematised.", items: ["Product design", "Design systems", "Prototyping", "UX audits"] },
  { n: "03", title: "Brand Identity", desc: "Distinct visual identities with a strong idea at the centre.", items: ["Strategy & naming", "Logo & marks", "Typography", "Guidelines"] },
  { n: "04", title: "3D & Motion", desc: "Real-time 3D and motion languages that give brands a physical presence.", items: ["WebGL scenes", "Product renders", "Motion systems", "Micro-interactions"] },
  { n: "05", title: "Digital Development", desc: "Precise frontend engineering — fast, accessible and built to last.", items: ["React / TypeScript", "Animation engineering", "Performance", "Accessibility"] },
];

export const process = [
  { n: "01", title: "Discover", desc: "Goals, audience, competitors and the one idea worth building around." },
  { n: "02", title: "Define", desc: "Strategy, structure and a clear creative direction everyone signs off on." },
  { n: "03", title: "Design", desc: "Interface, identity and motion explored in high fidelity, not wireframe theatre." },
  { n: "04", title: "Develop", desc: "Production-grade build with motion, 3D and performance tuned to the frame." },
  { n: "05", title: "Launch", desc: "QA across devices, launch support and iteration from real data." },
];

export const capabilities = ["Creative Direction", "Web Design", "UI/UX", "Design Systems", "Brand Identity", "3D / WebGL", "Motion Design", "React", "TypeScript", "Animation", "CMS", "Performance", "Accessibility", "Prototyping"];

export interface WhyElvenXPillar {
  n: string;
  title: string;
  tagline: string;
  desc: string;
  highlight: string;
  points: string[];
}

export const whyElvenX: WhyElvenXPillar[] = [
  {
    n: "01",
    title: "Strategy before screens",
    tagline: "We don't start with templates. We start with the business.",
    desc: "Most developers rush straight into code or buy a generic theme. We dissect your market positioning, ideal customer psychology, and commercial targets first. Every layout is calculated to solve a real business challenge.",
    highlight: "Zero templates · Business-first architecture",
    points: ["Audience & competitor analysis", "Value proposition clarity", "Conversion funnel mapping"],
  },
  {
    n: "02",
    title: "Design + Development",
    tagline: "No disconnect between what is designed and what gets built.",
    desc: "Traditional workflows split designers and coders into silos, causing broken promises, delayed deadlines, and diluted animations. At ElvenX, design and engineering are one seamless craft. What you approve is pixel-for-pixel what ships.",
    highlight: "100% Fidelity guarantee · No handoff friction",
    points: ["Unified design-engineering mindset", "Motion physics tuned to the frame", "Interactive prototypes in real code"],
  },
  {
    n: "03",
    title: "Built to convert",
    tagline: "Every page has a purpose: trust, enquiry, booking or sale.",
    desc: "A pretty website that doesn't generate leads or revenue is a failed investment. We engineer every page with strategic visual hierarchy, high-trust cues, instant contact channels, and frictionless CTAs that turn casual visitors into paying clients.",
    highlight: "Action-driven UX · Measurable commercial ROI",
    points: ["Intentional user flow & hierarchy", "Frictionless WhatsApp & lead channels", "High-trust social proof integration"],
  },
  {
    n: "04",
    title: "Premium by default",
    tagline: "Modern interaction, typography, motion and visual systems.",
    desc: "Your digital presence is the primary benchmark clients use to judge your credibility and pricing power. We craft bespoke typography scales, fluid physics, and tailored dark aesthetics that immediately command authority and position you at the top of your market.",
    highlight: "Tailored brand elevation · World-class finish",
    points: ["Tactile micro-interactions & cursor effects", "Dynamic 3D & interactive moments", "Distinctive visual identity"],
  },
  {
    n: "05",
    title: "Built for real businesses",
    tagline: "Fast, responsive, SEO-ready and optimized for mobile.",
    desc: "Visual richness shouldn't compromise performance. We engineer lightweight, accessible, modern codebases optimized for rapid load times, clean technical SEO, and flawless touch interaction on every smartphone, tablet, and high-DPI desktop.",
    highlight: "Sub-second speed · Flawless mobile experience",
    points: ["Sub-second Core Web Vitals", "Mobile-first responsive engineering", "Technical SEO & social share ready"],
  },
];

export const comparisonTable = [
  {
    metric: "Starting Point",
    freelancer: "Pre-made WordPress / Webflow theme",
    agency: "Endless discovery meetings & wireframe theatre",
    elvenx: "Deep dive into your business model & target audience",
  },
  {
    metric: "Design & Code",
    freelancer: "Tries to tweak code they didn't write",
    agency: "Designers throw static mockups to junior devs",
    elvenx: "Senior design + engineering unified in the same room",
  },
  {
    metric: "Commercial Focus",
    freelancer: "\"It looks like the demo, you're on your own\"",
    agency: "High focus on agency awards, low focus on your conversions",
    elvenx: "Every page engineered for trust, enquiries, and bookings",
  },
  {
    metric: "Speed & Polish",
    freelancer: "Bloated plugins, sluggish mobile lag",
    agency: "Complex bloated stacks with heavy maintenance fees",
    elvenx: "Handcrafted, blazing-fast, sub-second load times",
  },
  {
    metric: "Collaboration",
    freelancer: "Inconsistent communication & vanished support",
    agency: "Middle managers and account executives",
    elvenx: "Direct senior collaboration with founder-level care",
  },
];
