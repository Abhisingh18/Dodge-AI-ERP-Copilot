# 🚀 Master Deployment Guide: Dodge AI

Follow these steps to take your project from local to live.

## 📁 Repository Structure (Monorepo)
Your project is now organized for professional deployment:
```
dodge-ai/
 ├── backend/            # FastAPI + SQLite
 │    ├── dodge_ai.py    # Main API
 │    ├── data.db        # Database
 │    └── requirements.txt
 └── frontend/           # React (Vite)
      ├── src/           # UI Components
      └── .env           # Environment config
```

---

## 🟢 Step 1: Backend Deployment (Render.com)

1. **Create Account**: Go to [Render](https://render.com) and connect your GitHub.
2. **New Web Service**: Select your repository.
3. **Configure**:
   - **Name**: `dodge-ai-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn dodge_ai:app --host 0.0.0.0 --port 10000`
4. **Env Variables**:
   - Add `OPENROUTER_API_KEY`: `your_key_here`
5. **Wait**: Once deployed, you will get a URL like `https://dodge-ai-backend.onrender.com`.

---

## 🔵 Step 2: Frontend Deployment (Vercel.com)

1. **Create Account**: Go to [Vercel](https://vercel.com) and connect your GitHub.
2. **Import Project**: Select the same repository.
3. **Configure**:
   - **Project Name**: `dodge-ai-frontend`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. **Env Variables** (CRITICAL):
   - Add `VITE_API_URL`: `https://dodge-ai-backend.onrender.com` (from Step 1)
5. **Deploy**: Click Deploy. Your site will be live at `https://dodge-ai-frontend.vercel.app`.

---

## 🧠 Master Prompt for Future AI Help
If you need to explain this deployment to another AI or for documentation, use this:

> **Goal**: Deploy a monorepo ERP AI System.
> **Backend**: FastAPI in `/backend`, port 10000, Root Dir: `backend`.
> **Frontend**: React (Vite) in `/frontend`, Root Dir: `frontend`.
> **Linkage**: Frontend uses `VITE_API_URL` to hit the Render backend.
> **Features**: Intent detection, SQL generation, Cytoscape graph, Recharts.
