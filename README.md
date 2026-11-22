# NearFix — Skilled help, nearby, fast.

NearFix is a modern local services marketplace connecting homeowners and residents with vetted, dependable tradespeople right in their neighbourhood. Whether you are dealing with a leaking pipe, need urgent AC servicing in the middle of summer, or want a trusted electrician for wiring upgrades, NearFix connects you to the right professional in minutes.

---

## Key Features by Role

### 👤 Customer
- **Fast Local Search**: Find nearby technicians by service category, neighbourhood, budget, and urgency.
- **Clear Match Scores**: Transparent match ratings, true road distance, authentic neighbour reviews, and verified credentials.
- **One-Tap Emergency Requests**: Urgent bookings for burst pipes, electrical faults, or breakdown situations prioritized for immediate response.
- **Seamless Booking & Payment**: Choose preferred time slots, track real-time job status, and complete transactions with simulated UPI/card options.
- **Ratings & Reviews**: Share genuine feedback and ratings after work completion.

### 🛠️ Service Provider
- **Profile & Skill Management**: Showcase trade certifications, service areas, visit charges, and hourly pricing.
- **Live Availability**: Toggle between on-duty and off-duty states with immediate status updates.
- **Job Dispatch**: Accept or decline incoming job requests with detailed addresses and problem descriptions.
- **Job Tracker**: Transition bookings smoothly from *Accepted* to *In Progress* to *Completed*.
- **Earnings & Reviews**: Track completed jobs, overall revenue, and customer ratings.

### 🛡️ Admin
- **Platform Analytics**: Real-time metrics on total bookings, emergency requests, revenue, and popular trade categories.
- **Provider Verification**: Review tradesperson credentials, identity documentation, and approve profiles before they go live.
- **Safety & Moderation**: Block or unblock accounts, handle customer complaints, and ensure high service standards across the platform.

---

## Technology Stack

- **Frontend**: React 18 (Vite), Tailwind CSS, Framer Motion, Lucide Icons, Leaflet OpenStreetMap.
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

Run backend unit tests for the core service matching routines and business logic:
```bash
cd server
npm test
```

---

## Architecture & Design Documents
- [ARCHITECTURE.md](file:///c:/Users/Tushar/Desktop/NearFix/ARCHITECTURE.md) — Technical system architecture, route graph topology, and engine complexity analysis for evaluators.
- [DESIGN.md](file:///c:/Users/Tushar/Desktop/NearFix/DESIGN.md) — Visual standards, brand palette, typography, and motion specifications.
- [RULES.md](file:///c:/Users/Tushar/Desktop/NearFix/RULES.md) — Engineering constraints and customer-facing language guidelines.
- [DEPLOYMENT.md](file:///c:/Users/Tushar/Desktop/NearFix/DEPLOYMENT.md) — Step-by-step production deployment instructions.
- [CREDITS.md](file:///c:/Users/Tushar/Desktop/NearFix/CREDITS.md) — Photographic citations and asset licensing.
- [DECISIONS.md](file:///c:/Users/Tushar/Desktop/NearFix/DECISIONS.md) — Technical decisions log.
