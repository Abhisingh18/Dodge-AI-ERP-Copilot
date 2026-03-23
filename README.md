# Dodge AI - ERP Intelligence Copilot 🚀

An AI-powered ERP Data Assistant that transforms natural language queries into real-time insights, visual flow traces, and interactive graph visualizations.

## ✨ Key Features
- **AI Intent Detection**: Classifies ERP queries (Trace, Aggregation, Fraud, etc.) using LLMs.
- **Visual Transaction Stream**: Displays the full P2P chain (Order → Delivery → Billing → Journal → Payment) with interactive icons.
- **Dynamic Graph Visualization**: Interactive Cytoscape graph with node highlighting and live metadata popups.
- **Smart Analytics**: Automated chart generation (Bar, Line, Pie) via Recharts.
- **Monorepo Architecture**: Clean separation between FastAPI backend and React (Vite) frontend.

## 📁 Repository Structure
```
dodge-ai/
 ├── backend/            # FastAPI + SQLite + LLM Logic
 ├── frontend/           # React + Cytoscape + Tailwind
 ├── archive/            # Legacy prototype files
 └── DOCS/               # Walkthroughs and Deployment Guides
```

## 🚀 Quick Start
For full deployment instructions, see [DOCS/deployment_guide.md](./DOCS/deployment_guide.md).

### Local Setup
1. **Backend**: `cd backend && uvicorn dodge_ai:app --reload`
2. **Frontend**: `cd frontend && npm run dev`

## 🛠 Tech Stack
- **Frontend**: React, Vite, Cytoscape.js, Recharts, Lucide Icons, Tailwind CSS.
- **Backend**: FastAPI, SQLite, Pandas, OpenRouter (OpenAI API).
- **Deployment**: Render (Backend), Vercel (Frontend).

---
Developed with 💀 by Antigravity
