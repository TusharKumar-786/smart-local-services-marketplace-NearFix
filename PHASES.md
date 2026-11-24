# NearFix Build Phases

## Phase 1: Foundation, Brand and Landing Page
- [x] Workspace setup: client (React + Vite + Tailwind + Lucide), server (Express + Mongoose + Zod + JWT), git repository.
- [x] Database models: User, ProviderProfile, ServiceCategory, Booking, Review, Payment, Complaint, Notification, AreaGraph.
- [x] Authentication & Authorization: JWT tokens, bcrypt password hashing, role-based middleware (`customer`, `provider`, `admin`).
- [x] Brand Assets: Custom NearFix logo in SVG (full color, single dark, single white, square app icon, favicon) with wrench-pin lockup.
- [x] Design System: CSS color variables, typography hierarchy, button and badge primitives.
- [x] Real-world photography suite for 10 categories and tradespeople with complete CREDITS.md citations.
- [x] Complete 11-section responsive Landing Page with quiet, purposeful Framer Motion animations.
- [x] Hand-written matching engine in `server/src/engine/` with comprehensive unit test coverage.
- [x] Database seed script: 10 service categories, 32 Tricity area nodes, 71 providers, sample customers, bookings, reviews, complaints, and 3 demo accounts (`npm run seed:demo`).

## Phase 2: Customer and Provider Journeys
- [x] Search endpoint connected to matching engine pipeline with live filtering, sort options, and natural match scores.
- [x] Customer search results view with interactive Leaflet map, distance cards, and filter drawer.
- [x] Provider public profile with bio, skills, verified badges, pricing, and authentic customer reviews.
- [x] Booking workflow: service selection, date/time picker, address input, emergency flag, price quotation, geographic coordinate storage.
- [x] One-tap Emergency service request flow with boosted urgency weight and proximity prioritization.
- [x] Simulated payment flow with UPI, Net Banking, and Cards with detailed receipt generation and state guards.
- [x] Customer booking history and real-time status tracker (Requested -> Accepted -> In Progress -> Completed).
- [x] Post-service rating and review submission with dynamic average rating recomputation and pipeline cache refresh.
- [x] Provider portal: dashboard metrics, booking acceptance/rejection, availability toggle, profile editor, earnings summary.
- [x] In-app notifications system for booking lifecycle events.

## Phase 3: Admin, Maps, Polish, Testing and Launch
- [x] Extended 7-Tab Admin Command Center:
  - Overview: KPI cards, CSS bar charts (status distribution, payment method split, 7-day trends).
  - Bookings: Multi-criteria filtering, responsive table, slide-over drawer with status history and linked payment.
  - Payments: Volume totals by method (UPI, Card, Net Banking), transaction table.
  - Providers: Verification approval/rejection queue, roster overview, completed jobs count, total earnings.
  - Users: User directory, role/status filtering, self-block and admin-block safeguards.
  - Complaints: Dispute queue with administrative resolution modal.
  - Activity Feed: 50-event live platform activity stream with 30s auto-refresh.
- [x] Map Accuracy & Geolocation:
  - Universal availability helper `isProviderAvailable` for legend, pins, and popups.
  - Default coordinate detection with fallback to primary service area + deterministic jitter.
  - Live dispatch tracking: status-aware simulation (requested waiting state, accepted/in-progress transit with ETA/speed controls, completed/cancelled static record).
  - Centralized area coordination via `GET /api/areas` and client `useAreas()` hook.
- [x] Dedicated Terms (`/terms`) and Privacy (`/privacy`) legal pages.
- [x] Secret admin path alias (`VITE_ADMIN_PATH`) support.
- [x] Automated test suite: 16 passing unit and integration tests covering algorithmic engine, RBAC, state machines, and payment authorization.
- [x] Copy audit: 0 DSA keywords surfaced in client UI, error notifications, or customer copy.
