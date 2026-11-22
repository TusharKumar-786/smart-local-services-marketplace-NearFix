# NearFix Deployment Guide (DEPLOYMENT.md)

This guide details steps for deploying NearFix to production environments.

## 1. Prerequisites
- A MongoDB Atlas cluster (M0 or higher) with a database user and IP access enabled.
- A Render, Railway, or VPS account for the Express backend.
- A Vercel or Netlify account for the React frontend.

---

## 2. Database Setup (MongoDB Atlas)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new cluster and build a database named `nearfix`.
3. In **Database Access**, create a user with read/write privileges.
4. In **Network Access**, add `0.0.0.0/0` (or your backend hosting static IP).
5. Obtain the connection string formatted as:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/nearfix?retryWrites=true&w=majority
   ```

---

## 3. Backend Deployment (Render / Railway)
1. Connect your repository to Render/Railway and select the `server/` directory as the root.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Set Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI=<your-atlas-uri>`
   - `JWT_SECRET=<strong-random-secret-key>`
   - `CLIENT_URL=https://your-frontend.vercel.app`
5. Verify the health check endpoint: `GET https://your-backend.onrender.com/api/health`

---

## 4. Frontend Deployment (Vercel / Netlify)
1. Connect your repository to Vercel/Netlify and designate `client/` as root.
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Set Environment Variable:
   - `VITE_API_URL=https://your-backend.onrender.com/api`
6. Deploy and obtain the production frontend domain.
7. Return to the backend configuration and update `CLIENT_URL` with this domain.

---

## 5. Production Database Seeding
Once the backend is live, run the database seed script once to populate categories, neighbourhood nodes, verified local technicians, and reviews:
```bash
cd server
MONGODB_URI="<your-production-atlas-uri>" npm run seed
```

---

## 6. Post-Deployment Verification
- Register a new customer account and perform a search for "AC Repair" in Mohali.
- Verify provider distance, starting price, and match score display.
- Initiate a test booking and proceed through simulated payment.
- Log in to the provider demo account and accept the request.
- Log in to the admin dashboard and review system metrics and verification requests.
