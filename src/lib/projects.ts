import pLaungLaachi from "@/assets/laung-laachi.jpg";
import pLaungLaachiGallery from "@/assets/laung-laachi-showcase-gallery.jpg";
import pLaungLaachiMenu from "@/assets/laung-laachi-showcase-menu.png";
import pDayalHero from "@/assets/dayal-hotel-hero.jpg";
import pDayalShowcaseHero from "@/assets/dayal-hotel-showcase-hero.png";
import pDayalShowcaseRooms from "@/assets/dayal-hotel-showcase-rooms.png";
import pMeeSumHero from "@/assets/mee-sum-cafe-hero.jpg";
import pMeeSumShowcaseHero from "@/assets/mee-sum-cafe-showcase-hero.png";
import pMeeSumShowcaseMenu from "@/assets/mee-sum-cafe-showcase-menu.png";
import pArtesanoHero from "@/assets/artesano-cafe-hero.jpg";
import pArtesanoShowcaseHero from "@/assets/artesano-cafe-showcase-hero.png";
import pArtesanoShowcaseAbout from "@/assets/artesano-cafe-showcase-about.png";
import p2 from "@/assets/p2.jpg";

export type Project = {
  slug: string;
  name: string;
  client: string;
  year: string;
  category: "Restaurant" | "Hospitality" | "Web" | "Brand" | "3D" | "Product";
  services: string[];
  image: string;
  detailImage1?: string;
  detailImage2?: string;
  tagline: string;
  overview: string;
  objective: string;
  direction: string;
  ux: string;
  motion: string;
  result: string;
  url?: string;
};

export const projects: Project[] = [
  {
    slug: "laung-laachi",
    name: "Laung Laachi",
    client: "Laung Laachi",
    year: "2026",
    category: "Restaurant",
    services: ["Web Experience", "Brand Identity", "Digital Menu & Booking"],
    image: pLaungLaachi,
    detailImage1: pLaungLaachiGallery,
    detailImage2: pLaungLaachiMenu,
    tagline: "Good food. Warm vibes. A stop worth remembering.",
    overview: "A digital experience and booking platform for an authentic Punjabi restaurant, highway retreat and celebration banquet hall on Nangal–Chandigarh Road, Brahmpur.",
    objective: "Translate genuine Punjabi warmth, live highway hospitality and festive celebration culture into a premium digital storefront that drives dine-in visits and banquet hall bookings.",
    direction: "Heritage brass accents, warm saffron gradients and clean typography paired with authentic photography of culinary delights, air-conditioned banquet spaces and folk motifs.",
    ux: "Intuitive one-tap banquet booking inquiries, visual culinary showcases, live WhatsApp reservations, and verified highway route navigation.",
    motion: "Fluid menu reveals, gentle scroll parallax over architectural details, and celebratory micro-interactions.",
    result: "A fast, immersive web experience boosting party reservations and walk-in diners along the Nangal–Chandigarh route.",
    url: "https://launglacchi.vercel.app/",
  },
  {
    slug: "dayal-hotel",
    name: "Dayal Hotel",
    client: "Dayal Hotel",
    year: "2026",
    category: "Hospitality",
    services: ["Web Experience", "3D Hospitality", "Booking Engine"],
    image: pDayalHero,
    detailImage1: pDayalShowcaseHero,
    detailImage2: pDayalShowcaseRooms,
    tagline: "Immersive luxury hospitality in Una.",
    overview: "An immersive 3D boutique hospitality platform for Dayal Hotel in Una, Himachal Pradesh, combining luxury room tours, multi-cuisine dining, and celebration venue bookings.",
    objective: "Elevate Una's premier boutique hotel into a digital-first luxury brand with real-time room discovery, interactive venue showcases, and friction-free direct reservations.",
    direction: "Atmospheric dark luxury aesthetics with Himalayan gold accents, bespoke typography, and cinematic architectural photography.",
    ux: "Frictionless room booking engine, interactive multi-cuisine menu viewer, banquet capacity planning, and instant concierge WhatsApp connectivity.",
    motion: "Gentle 3D camera sweeps, golden light reveals, and fluid booking step transitions.",
    result: "A cohesive digital luxury ecosystem driving higher direct bookings, wedding enquiries, and traveler stops along the Himachal corridor.",
    url: "http://www.dayalhotels.com/",
  },
  {
    slug: "mee-sum-cafe",
    name: "Mee Sum Cafe",
    client: "Mee Sum Cafe",
    year: "2026",
    category: "Restaurant",
    services: ["Web Experience", "Brand & Editorial", "Digital Menu"],
    image: pMeeSumHero,
    detailImage1: pMeeSumShowcaseHero,
    detailImage2: pMeeSumShowcaseMenu,
    tagline: "Classic Chinatown. Cantonese comfort.",
    overview: "A warm, editorial, mobile-first web experience and digital menu platform for Mee Sum Cafe, an authentic Cantonese comfort food destination on historic Pell Street in Manhattan Chinatown, NYC.",
    objective: "Honor the heritage of an iconic Chinatown cafe with a clean digital storefront making dim sum menus, takeaway orders, and neighborhood visit directions effortlessly accessible to New Yorkers and travelers.",
    direction: "Warm ivory and aged-paper surfaces, deep charcoal typography, vintage Hong Kong tea diner aesthetics, muted vermilion accents, and authentic editorial food and interior photography.",
    ux: "Instant menu search with AI dish recommendations, sticky category filtering, one-tap takeaway calling, and verified Google Maps navigation to 26 Pell Street.",
    motion: "Restrained paper-like page reveals, tactile menu card interactions, and smooth category transitions.",
    result: "A fast, culturally authentic web experience connecting locals and travelers with Pell Street's classic comfort dishes and takeout ordering.",
    url: "https://www.google.com/maps/search/?api=1&query=Mee+Sum+Cafe+26+Pell+St+New+York+NY+10013",
  },
  {
    slug: "artesano-cafe",
    name: "Artesano Cafe",
    client: "Artesano Cafe",
    year: "2026",
    category: "Restaurant",
    services: ["Web Experience", "Brand Identity", "Digital Ordering"],
    image: pArtesanoHero,
    detailImage1: pArtesanoShowcaseHero,
    detailImage2: pArtesanoShowcaseAbout,
    tagline: "Specialty coffee & good moments in Lower Manhattan.",
    overview: "An artisanal digital storefront and coffee sanctuary experience for Artesano Cafe at 90 Chambers Street in Lower Manhattan, NYC, celebrating specialty pour-overs, single-origin roasts, and morning hospitality.",
    objective: "Translate the tactile warmth, aromatic single-origin roastery craft, and community morning ritual of Chambers Street into an evocative, high-converting digital presence.",
    direction: "Warm cream surfaces, rich espresso browns, terracotta accents, editorial serif typography, and natural morning light photography.",
    ux: "Live roast batch indicators, interactive signature brew tastings, frictionless online ordering, and verified Google Maps navigation to 90 Chambers Street.",
    motion: "Soft aroma-inspired fades, smooth craft marquee tickers, and responsive brew discovery interactions.",
    result: "A distinctive Lower Manhattan digital flagship driving daily neighborhood foot traffic, pickup orders, and specialty coffee appreciation.",
    url: "https://maps.google.com/?cid=8488695738211103794",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
