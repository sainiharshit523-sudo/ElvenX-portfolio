# ElvenX Studio — Portfolio Website Plan

A dark, cinematic, motion-driven studio site built around the recurring "X" mark, following the uploaded brief.

## Visual system
- Near-black / charcoal / graphite / soft white, with one restrained luminous accent (electric lime-cyan, used sparingly — no neon glow, no rainbow gradients).
- Typography: Space Grotesk-style display (huge, tight tracking, uppercase micro-labels) + clean body sans. Not Inter/Poppins.
- Swiss grid, editorial spacing, thin hairline dividers, sharp corners.

## Pages
1. **Home** — the full story:
   - Loader: X mark draws itself, counts to 100, splits open into the page.
   - Hero: "WE CREATE / DIGITAL EXPERIENCES / THAT MOVE." with split-letter reveal; "MOVE" gets a special kinetic treatment. Interactive 3D X object (glassy/metallic, reacts to pointer, slight scroll camera move) with a static fallback for low-power/reduced-motion.
   - Intro statement, scroll-revealed word by word.
   - "What we create" — 5 interactive rows (Web, UI/UX, Brand, 3D & Motion, Development) that expand with preview on hover.
   - Selected Work — large project showcases with image reveal and "VIEW" cursor.
   - "Every pixel has a purpose" — pinned typographic moment with X grid.
   - Digital Playground — small interactive experiments (draggable X, particle field, type toy).
   - Services (01–05), Process steps, Studio ("Small studio. Big digital thinking."), Capabilities, Quality/trust.
   - Contact CTA "Let's make something unforgettable." + final X-to-logo animation and minimal footer.
2. **Work** — filterable project grid.
3. **Project detail** (`/work/$slug`) — case study: intro, overview, objective, direction, UX, desktop, mobile, motion, result, next project.
4. **Studio**, **Services**, **Contact** (form with validation; front-end only for now).

## Global interactions
- Custom cursor (dot + ring, states VIEW / DRAG / EXPLORE / OPEN / START), desktop only.
- Magnetic buttons/links, smooth scrolling, page transitions with an X wipe.
- Fullscreen menu overlay nav.
- Respects reduced motion; fully responsive; accessible contrast and keyboard focus.

## Content
- 4 sample projects with placeholder (invented) names and copy, plus generated imagery. You'll need to provide real projects, contact email and socials later.

## Technical details
- TanStack Start routes: `/`, `/work`, `/work/$slug`, `/studio`, `/services`, `/contact`, each with own head() metadata.
- Motion: `motion` (Framer) + Lenis smooth scroll; 3D: three + @react-three/fiber + drei in a client-only lazy component with procedural X geometry, Lightformer environment, capped DPR.
- Design tokens in `src/styles.css` (oklch), fonts via `<link>` in root.
- Projects data in a shared module; contact form uses zod validation, no backend (can add Lovable Cloud later to store submissions).
