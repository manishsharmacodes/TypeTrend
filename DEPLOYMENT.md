# TypeTrend — Deployment Guide (Vercel + Render)

This project consists of a **React + Vite** frontend and a **Python Flask + Scikit-Learn** backend.
The recommended production setup uses **Vercel** for the frontend and **Render** (or Railway) for the backend.

---

## Part 1: Deploy Backend to Render (Free)

1. Push your code to your GitHub account:
   ```bash
   git add .
   git commit -m "Configure deployment files"
   git push origin main
   ```
2. Go to **[dashboard.render.com](https://dashboard.render.com)** and sign in.
3. Click **New +** ➔ **Web Service**.
4. Connect your GitHub repository.
5. Configure the following fields:
   - **Name:** `typetrend-backend`
   - **Root Directory:** `backend`
   - **Language / Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Instance Type:** `Free`
6. Click **Create Web Service**.
7. Once deployed, copy your backend URL (e.g. `https://typetrend-backend.onrender.com`).

---

## Part 2: Deploy Frontend to Vercel (Free)

1. Go to **[vercel.com](https://vercel.com)** and sign in.
2. Click **Add New...** ➔ **Project**.
3. Import your GitHub repository.
4. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click edit and select `frontend`
5. Expand **Environment Variables**:
   - **Key:** `VITE_API_BASE`
   - **Value:** `https://typetrend-backend.onrender.com` *(use your Render URL without a trailing slash)*
6. Click **Deploy**.

---

## How It Works Together
- The frontend on Vercel sends all API requests to your Render URL: `https://typetrend-backend.onrender.com/api/...`
- CORS is pre-configured to allow requests from any frontend origin.
- The `frontend/vercel.json` file ensures client-side routing works on page refresh.
