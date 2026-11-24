# NearFix Technical Decisions Log

| Date | Assumption / Decision | Context & Justification |
| :--- | :--- | :--- |
| 2026-11-22 | MERN Stack Architecture | Adopted Vite + React 18 frontend with Tailwind CSS and Express Node.js backend to fulfill responsive, mobile-first requirements with rapid build times. |
| 2026-11-22 | Hand-crafted DSA Engine | Placed custom algorithmic implementations in `server/src/engine/` using native JavaScript classes (Hash Map, Min-Heap Dijkstra, Max-Heap Priority Queue, Merge Sort, Binary Search) with zero external graph/heap library dependencies to enable full academic evaluability. |
| 2026-11-22 | Geographic Snapping with Area Graph | Snapped customer locations and provider service bases to a Tricity graph of 32 neighbourhood nodes (Chandigarh, Mohali, Panchkula) connected by weighted road distances in km. |
| 2026-11-22 | Simulated Payment Gateway | Built an extensible payment service layer that simulates UPI, card, and net-banking transactions with reference generation and webhook-compatible state transitions. |
| 2026-11-22 | Node Native Test Suite | Used Node.js built-in `node:test` and `node:assert` runner for engine unit testing to guarantee zero external dependency bloat and instant CI execution. |
| 2026-11-22 | Leaflet with OpenStreetMap | Rendered interactive provider maps without requiring proprietary third-party API keys while preserving smooth mobile performance. |
| 2026-11-22 | Clean Separation of Engine Logic | Kept all custom DSA implementations isolated in `server/src/engine/` and documented exclusively in `ARCHITECTURE.md`. Automated scans verified 0 DSA keywords surfaced to client UI, responses, or customer README. |
| 2026-11-22 | Simulated Gateway with Extensible Webhook Pattern | Simulated realistic payment flow across UPI, Cards, and Net Banking generating transaction references (`PAY-SEED-...` and `PAY-...`) with instantaneous state updates to booking records. |
| 2026-11-23 | Single Area Source of Truth (`GET /api/areas`) | Standardized area coordinate lookups through `GET /api/areas` backed by `AreaGraphModel` and client `useAreas()` hook. Eliminated coordinate drift between client maps and backend distance calculations. |
| 2026-11-23 | Auto-Verify Provider Configuration (`AUTO_VERIFY_PROVIDERS`) | Introduced environment flag `AUTO_VERIFY_PROVIDERS=true/false` to toggle between auto-verifying new technician registrations for rapid testing vs. queueing them for admin verification approval in production. |
| 2026-11-23 | Dedicated `npm run seed:demo` Command | Standardized demo seeding under `npm run seed:demo` for rapid environment resets with demo credentials and realistic Tricity data. |
| 2026-11-23 | Comprehensive 7-Tab Admin Command Center | Extended administrative dashboard from 4 to 7 tabs (Overview, Bookings, Payments, Providers, Users, Complaints, Activity). Added side-drawer booking audit, payment breakdown by method, self-block/admin-block security guards, and auto-refreshing activity stream. |
| 2026-11-23 | Secret Admin Route Alias (`VITE_ADMIN_PATH`) | Enabled optional custom route masking via `VITE_ADMIN_PATH` for production security while preserving standard `/admin/dashboard` path in development. |
| 2026-11-23 | "New" Technician Badge for Unreviewed Providers | Allowed `ratingAverage` to remain `null` for newly registered technicians so they receive an encouraging "New" badge until their first verified customer review is completed. |
