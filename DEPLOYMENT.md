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
   - `JWT_SECRET=<strong-random-secret-key-min-32-chars>`
   - `CLIENT_URL=https://your-frontend.vercel.app`
   - `AUTO_VERIFY_PROVIDERS=false` (Set `true` only for demo/evaluation environments where new providers should skip administrative review)
5. Verify the health check endpoint: `GET https://your-backend.onrender.com/api/health`
6. Verify the geographic area endpoint: `GET https://your-backend.onrender.com/api/areas`

---

## 4. Frontend Deployment (Vercel / Netlify)
1. Connect your repository to Vercel/Netlify and designate `client/` as root.
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Set Environment Variables:
   - `VITE_API_URL=https://your-backend.onrender.com/api`
   - `VITE_ADMIN_PATH=/admin-secure-path` (Optional secret URL alias for the administrative dashboard; `/admin/dashboard` remains active as default)
6. Deploy and obtain the production frontend domain.
7. Return to the backend configuration and update `CLIENT_URL` with this domain.

---

## 5. Production Database Seeding & Administration
To populate service categories, neighbourhood nodes, demo providers, and reviews in development or staging:
```bash
cd server
npm run seed:demo
```
In production, create the initial administrative account securely:
```bash
cd server
ADMIN_NAME="Platform Administrator" ADMIN_EMAIL="admin@yourdomain.com" ADMIN_PASSWORD="<strong-password-min-10-chars>" npm run create-admin
```

---

## 6. Post-Deployment Verification
- Perform a search across all 10 service categories in Mohali, Chandigarh, and Panchkula.
- Verify map pins display with accurate availability counts and fallbacks.
- Register a test provider profile: confirm it appears in the admin Providers verification queue.
- Initiate a customer booking, accept as provider, simulate UPI payment, complete service, and leave a review.
- Access the Admin Command Center via `/admin/dashboard` or your configured `VITE_ADMIN_PATH`: inspect KPIs, booking drawer, payment logs, and live activity stream.
