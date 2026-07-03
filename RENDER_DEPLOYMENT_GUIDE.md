# Render Deployment Guide

Follow this step-by-step procedure to deploy the RideX platform (Backend, Main Frontend, Rider Frontend, and Driver Frontend) to Render for free.

> [!NOTE]
> I have already updated your codebase so that it correctly reads environment variables (`VITE_API_URL` and `VITE_SOCKET_URL`) instead of relying on `http://localhost:5000`. Please make sure to commit and push these latest changes to your GitHub repository before starting the deployment.

---

## 1. Deploy the Backend (Web Service)

The backend must be deployed first so we can obtain its live URL, which the frontends will need.

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click the **New +** button and select **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your `capstone_project` repository.
4. Fill out the deployment details:
   - **Name**: `ridex-backend` (or similar)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Scroll down to **Environment Variables** and click **Add Environment Variable**. Add the following:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string for JWT token generation.
6. Click **Create Web Service**.
7. Wait for the deployment to finish. Once live, copy the **onrender.com URL** displayed at the top (e.g., `https://ridex-backend.onrender.com`). You will need this for the next steps.

---

## 2. Deploy the Frontends (Static Sites)

You will repeat this process three times: once for `frontend`, once for `rider-frontend`, and once for `driver-frontend`.

1. Go back to your Render Dashboard, click **New +**, and select **Static Site**.
2. Connect the same `capstone_project` repository.
3. Fill out the deployment details based on which frontend you are deploying:

   **For Rider Frontend:**
   - **Name**: `ridex-rider`
   - **Root Directory**: `rider-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

   **For Driver Frontend:**
   - **Name**: `ridex-driver`
   - **Root Directory**: `driver-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

   **For Main Frontend:**
   - **Name**: `ridex-main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. For each frontend, scroll down to **Environment Variables** and add the following keys (using the backend URL you copied earlier):
   - `VITE_API_URL` : `https://your-backend-url.onrender.com/api` *(Make sure to add `/api` at the end)*
   - `VITE_SOCKET_URL` : `https://your-backend-url.onrender.com`

5. Click **Create Static Site**.

### 🔧 Crucial Step: Fix React Router (For all 3 Static Sites)
Because we are using React Router, if a user refreshes the page on any URL other than the root `/`, Render will show a 404 error. We need to set a rewrite rule.

For each of the three static sites you just created:
1. Go to the project dashboard on Render.
2. Click on **Redirects/Rewrites** in the left sidebar.
3. Add a new rule with the following configuration:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite` (NOT Redirect)
4. Click **Save Changes**.

---

## Summary of URLs

Once everything is deployed, you will have 4 active URLs. 
- **Backend**: `https://ridex-backend.onrender.com`
- **Rider App**: `https://ridex-rider.onrender.com`
- **Driver App**: `https://ridex-driver.onrender.com`
- **Main Website**: `https://ridex-main.onrender.com`

> [!TIP]
> If you face issues with sockets not connecting on Render, ensure you don't have trailing slashes `/` on your `VITE_SOCKET_URL`. Render free tier instances go to sleep after 15 minutes of inactivity, so the first API call or Socket connection might take 30-50 seconds to wake up the server.
