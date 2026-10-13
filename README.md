# NearFix — Smart Local Services Marketplace 

Rayat Bahra University · B.Tech CSE (3rd year, 5th semester) · DSA project.

NearFix connects customers with verified local service providers (plumbers, electricians,
AC technicians, …). This repository holds the project.



| Area | What it does |
|------|--------------|
| Landing page | Hero with service and area search, match-score preview, categories, how it works |
| Register | Customer or provider sign-up (email, phone, area, password rules) |
| Login | Email and password, JWT access and refresh tokens, logout blacklists the refresh token |
| Dashboard | Role-based: customer, provider (stats and requests) and admin (platform stats) |
| Backend | Django REST API: accounts, service categories and areas, providers, bookings data model, seed data |

Pages from later weeks (search, DSA matching, booking flow, profile, DSA lab) show a
"coming soon" page until they are added.

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite, React Router, Axios, plain CSS |
| Backend | Python 3.10+, Django 5, Django REST Framework, Simple JWT |
| Database | PostgreSQL 14+ |

## Setup

Prerequisites: Python 3.10+, Node.js 18+, PostgreSQL 14+.

### 1. Database
```sql
CREATE USER User_nearfix  WITH PASSWORD 'choose-a-strong-password';
ALTER USER User_nearfix CREATEDB;
CREATE DATABASE nearfix_db OWNER User_nearfix;
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                # Windows: copy .env.example .env
# edit .env: DB_PASSWORD, DJANGO_SECRET_KEY, JWT_SIGNING_KEY
python manage.py migrate
python manage.py seed_nearfix       # demo categories, areas, providers and bookings
python manage.py runserver          # http://127.0.0.1:8000
```
Generate a secret key with `python -c "import secrets; print(secrets.token_urlsafe(50))"`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                         # http://localhost:5173
```
The Vite dev server proxies `/api` and `/admin` to `http://127.0.0.1:8000`.

### Demo accounts (created by `seed_nearfix`, development only)
Password for all: `NearFix@123`

| Role | Email |
|------|-------|
| Customer | alex1232gmail.com |
| Provider | rajkumar@gmail.com |

## Project structure
```
NearFix/
├── backend/
│   ├── config/      settings, urls, permissions, error handler
│   ├── accounts/    custom User (email login, roles), register / login / logout / me
│   ├── services/    categories, areas, provider profiles, availability, seed command
│   └── bookings/    booking, payment, review and complaint models and API
└── frontend/
    └── src/         api client, auth context, components, pages (Home, Login, Register, Dashboard)
```

## Roadmap
search and filters, DSA matching engine (HashMap, Max-Heap, Merge Sort,
Dijkstra), booking flow, payments and reviews, testing and final report.
