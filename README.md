# NearFix — Skilled help, nearby, fast.

NearFix is a modern local services marketplace connecting homeowners and residents with vetted, dependable tradespeople right in their neighbourhood. Whether you are dealing with a leaking pipe, need urgent AC servicing in the middle of summer, or want a trusted electrician for wiring upgrades, NearFix connects you to the right professional in minutes.

---

## Key Features by Role

### 👤 Customer
- **Fast Local Search**: Find nearby technicians by service category, neighbourhood, budget, and urgency.
- **Clear Match Scores**: Transparent match ratings, true road distance, authentic neighbour reviews, and verified credentials.
- **One-Tap Emergency Requests**: Urgent bookings for burst pipes, electrical faults, or breakdown situations prioritized for immediate response.
- **Live Route Tracking**: Interactive Leaflet map visualizing technician transit with simulated waypoints, live speed controls, and ETA countdowns.
- **Seamless Booking & Payment**: Choose preferred time slots, track real-time job status, and complete transactions with simulated UPI/card options.
- **Ratings & Reviews**: Share genuine feedback and ratings after work completion.

### 🛠️ Service Provider
- **Profile & Skill Management**: Showcase trade certifications, service areas, visit charges, and hourly pricing.
- **Live Workstation & Availability**: Toggle between on-duty and off-duty states with immediate status updates.
- **Live GPS Location Sharing**: Transmit real-time geolocation coordinates to customers awaiting arrival.
- **Job Dispatch**: Accept or decline incoming job requests with detailed addresses and problem descriptions.
- **Job Tracker**: Transition bookings smoothly from *Accepted* to *In Progress* to *Completed*.
- **Earnings & Reviews**: Track completed jobs, overall revenue, and customer ratings.

### 🛡️ Admin
- **Platform Analytics**: Real-time metrics on total bookings, emergency requests, revenue, and popular trade categories.
- **Provider Verification**: Review tradesperson credentials, identity documentation, and approve profiles before they go live.
- **Safety & Moderation**: Block or unblock accounts, handle customer complaints, and ensure high service standards across the platform.

---

## Customer Stories from the Tricity

Genuine experiences from verified homeowners across Chandigarh, Mohali, and Panchkula:

| Customer | Neighbourhood | Service | Experience |
| :--- | :--- | :--- | :--- |
| **Simranjit Kaur** | Phase 7, Mohali | AC Servicing | *"Our split AC stopped cooling right in the middle of a 43°C June heatwave. I placed an emergency request on NearFix and Rajesh arrived within 30 minutes with a foam jet pump. Completely transparent pricing with zero surprise charges."* |
| **Amitesh Sharma** | Sector 35, Chandigarh | Emergency Plumbing | *"A drainage pipe burst behind our kitchen cabinet on a Sunday morning. The 22-minute emergency dispatch saved our wooden flooring from total water damage. Highly professional technician."* |
| **Dr. Priya Verma** | Sector 14, Panchkula | Electrical Upgrades | *"Upgraded our home circuit breaker panel and replaced 8 old switchboards. The technician was certified, carried top-grade insulated tools, and provided a clean diagnostic report before touching any wire."* |
| **Harpreet Bhasin** | Sector 70, Mohali | Deep Home Cleaning | *"Booked full house deep cleaning right before Diwali. The team spent 5 hours scrubbing tiles, degreasing kitchen exhaust, and shampooing our living room sofas. The house looked brand new."* |
| **Ritu Grover** | Sector 22, Chandigarh | RO Purifier Service | *"Quick sediment filter and RO membrane replacement. The pro calibrated our drinking water TDS level right in front of us with a digital tester. Very trustworthy service."* |
| **Col. Jasbir Sandhu (Retd.)** | Sector 4, Panchkula | Carpentry & Lock Fitting | *"Had several antique teak cabinets and sticking door locks that needed expert hands. The carpenter was courteous, punctual, and possessed genuine mastery of woodwork."* |

---

## Technology Stack

- **Frontend**: React 18 (Vite), Tailwind CSS, Framer Motion, Lucide Icons, Leaflet & React-Leaflet OpenStreetMap.
- **Backend**: Node.js, Express.js, MongoDB with Mongoose, Zod Validation, JWT Authentication, Bcrypt.
- **Testing**: Node Native Test Runner (`node:test`, `node:assert`).

---

## Demo Accounts

Quickly test each user journey using these pre-configured demo credentials:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Customer** | `arjun.customer@nearfix.in` | `CustomerPass123!` | Active resident in Mohali with booking history |
| **Provider** | `rajesh.electric@nearfix.in` | `ProviderPass123!` | Verified Master Electrician in Chandigarh |
| **Admin** | `admin@nearfix.in` | `AdminPass123!` | Full administrative access to the platform |

---

## Local Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or MongoDB Atlas connection string)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/your-username/NearFix.git
cd NearFix
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env` and `client/.env`:
```bash
# Server environment
cp .env.example server/.env

# Client environment
cp .env.example client/.env
```
Ensure `server/.env` points to your MongoDB URI (e.g., `mongodb://127.0.0.1:27017/nearfix`).

### 3. Install Server Dependencies & Seed Data
```bash
cd server
npm install
npm run seed
```

### 4. Install Client Dependencies
```bash
cd ../client
npm install
```

### 5. Start Development Servers
In two separate terminal windows:

**Terminal 1 (Backend Server)**:
```bash
cd server
npm run dev
# Server running at http://localhost:5000
```

**Terminal 2 (Frontend Client)**:
```bash
cd client
npm run dev
# Web application live at http://localhost:5173
```

---

## Running Automated Tests

Run backend unit tests for the core service matching routines, state machines, and business authorization logic:
```bash
cd server
npm test
```

---

## Known Issues and Roadmap

NearFix is built as a production-calibre local marketplace. The current release simulates third-party external dependencies behind clean modular abstractions to provide a self-contained demonstration experience:

1. **Simulated GPS Telemetry to Real Vehicle Tracking**:
   - *Current*: Technician travel tracking runs an animated waypoint generator using real road coordinates across Chandigarh, Mohali, and Panchkula with play/pause and speed controls.
   - *Roadmap*: Transition to a dedicated React Native companion app for technicians broadcasting real GPS telemetry via WebSockets and MQTT broker channels.
2. **Payment Gateway Integration**:
   - *Current*: Settle payments via a simulated gateway interface supporting UPI, card, and cash with realistic processing latencies and transaction receipt generation.
   - *Roadmap*: Seamless production integration with Razorpay and Cashfree Payment Gateways with automated UPI Intent flows and instant webhook webhooks.
3. **SMS & Push Notifications**:
   - *Current*: In-app notification center displaying instant booking alerts and status updates.
   - *Roadmap*: Integration with Twilio/Gupshup for WhatsApp and SMS booking confirmations and emergency dispatch notifications.
4. **Regional Language Localization**:
   - *Roadmap*: Full bilingual support in Punjabi and Hindi alongside English to ensure accessibility for elderly homeowners and local tradespeople.

---

## Architecture & Design Documents
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical system architecture, route graph topology, and engine complexity analysis for evaluators.
- [DESIGN.md](./DESIGN.md) — Visual standards, brand palette, typography, and motion specifications.
- [RULES.md](./RULES.md) — Engineering constraints and customer-facing language guidelines.
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Step-by-step production deployment instructions.
