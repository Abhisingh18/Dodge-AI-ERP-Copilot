# 🚀 Dodge AI: SAP Order-to-Cash Explorer

Dodge AI is a powerful, visual ERP analytics tool designed to trace and analyze the **Order-to-Cash (O2C)** process. It features a dynamic Cytoscape-powered graph and an AI Agent that provides deep business context for every transaction.

## 📁 Repository Structure

- **`/frontend`**: React + Vite application (contains the UI, Graph, and AI Chat).
- **`/backend`**: FastAPI backend (Logic, Database Queries, and AI Intent Handling).
- **`/sessions`**: Complete history of development, walkthroughs, and verification media.
- **`/DOCS`**: Master deployment guides and technical documentation.

## 🛠️ Setup Instructions

### 1. Local Development
#### Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn dodge_ai:app --host 0.0.0.0 --port 8000 --reload
```
#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

### 2. Production Deployment
- **Backend**: Deploy on **Render.com** (Root: `backend`, Command: `uvicorn dodge_ai:app --host 0.0.0.0 --port $PORT`).
- **Frontend**: Deploy on **Vercel** (Root: `frontend`, Framework: `Vite`).
- **Zero-Config**: The provided `vercel.json` automatically proxies API calls to Render.

## 🔗 Public Repository Link
[https://github.com/Abhisingh18/Dodge-AI-ERP-Copilot](https://github.com/Abhisingh18/Dodge-AI-ERP-Copilot)

---
Developed For **Dodge AI** for high-speed ERP intelligence.
