# NearFix Build Phases

## Phase 1: Foundation, Brand and Landing Page
- [x] Workspace setup: client (React + Vite + Tailwind + Lucide), server (Express + Mongoose + Zod + JWT), git repository.
- [x] Database models: User, ProviderProfile, ServiceCategory, Booking, Review, Payment, Complaint, Notification, AreaGraph.
- [x] Authentication & Authorization: JWT tokens, bcrypt password hashing, role-based middleware (`customer`, `provider`, `admin`).
- [x] Brand Assets: Custom NearFix logo in SVG (full color, single dark, single white, square app icon, favicon) with wrench-pin lockup.
- [x] Design System: CSS color variables, typography hierarchy, button and badge primitives.
- [x] Real-world optimized photography suite for 10 categories and tradespeople with complete CREDITS.md citations.
- [x] Complete 11-section responsive Landing Page with quiet, purposeful Framer Motion animations.
- [x] Hand-written matching engine skeleton in `server/src/engine/` with comprehensive unit test coverage.
- [x] Database seed script: 10 service categories, 32 Tricity area nodes, 140+ verified providers, 320+ bookings, realistic reviews, complaints, and 3 demo accounts.

## Phase 2: Customer and Provider Journeys
- [x] Search endpoint connected to matching engine pipeline with live filtering, sort options, and match scores.
- [x] Customer search results view with interactive Leaflet map, distance cards, and filter drawer.
- [x] Provider public profile with bio, skills, verified badges, pricing, and authentic customer reviews.
- [x] Booking workflow: service selection, date/time picker, address input, emergency flag, price quotation.
- [x] One-tap Emergency service request flow with boosted urgency weight and proximity prioritization.
- [x] Simulated payment flow with UPI, Net Banking, and Cards.
- [x] Customer booking history and real-time status tracker (Requested -> Accepted -> In Progress -> Completed).
- [x] Post-service rating and review submission.
- [x] Provider portal: dashboard metrics, booking acceptance/rejection, availability toggle, profile editor, earnings summary.
- [x] In-app notifications system for booking lifecycle events.

## Phase 3: Admin, Polish, Testing and Launch
- [x] Admin management portal: analytics overview, bookings monitoring, provider verification queue, user blocking/unblocking.
- [x] Customer and provider complaints dispute handling.
- [x] Accessibility review: WCAG AA contrast compliance, keyboard focus rings, `prefers-reduced-motion` fallbacks.
- [x] Loading skeletons, animated empty states, and toast notifications throughout.
- [x] Copy verification pass: strict exclusion of DSA terms from all customer and provider interfaces.
- [x] Documentation package: README.md, ARCHITECTURE.md, DESIGN.md, DEPLOYMENT.md.
