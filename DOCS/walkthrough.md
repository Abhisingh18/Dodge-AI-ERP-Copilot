# ERP Intelligence Engine — Walkthrough

## What Was Built (Real AI Flow)

| Feature | Backend | Frontend |
|---------|---------|----------|
| **LLM Intent Classifier** | `deepseek-chat` detects intent & entities | — |
| **Deterministic SQL** | Intent-based queries (no keyword matching) | — |
| **LLM Business Summary** | Natural language insights from SQL results | Clean text without raw tables |
| **Visual Flow Trace** | **NEW**: Transaction Stream UI in chat | 📦 Order → 🚚 Delivery → 📄 Billing → 📒 Journal |
| **Smart Graph Highlighting** | Only triggers on Trace/Explain intents | **Step 5 Fixed**: Highlights clear on general queries |
| **Resizable Chat** | **NEW**: Draggable resize handle | Mouse-drag to expand/collapse chat width |
| **Monorepo Refactor** | **NEW**: Deployment ready structure | Organized into `backend/` and `frontend/` |
| **Environment Vars** | **NEW**: VITE_API_URL support | Local/Production API switching ready |
| **GitHub Repo** | **DONE**: Pushed to [Dodge-AI-ERP-Copilot](https://github.com/Abhisingh18/Dodge-AI-ERP-Copilot) | Full Monorepo live 🚀 |
| **Vercel Fix** | **DONE**: Added `vercel.json` | 404 Routing issue resolved |
| **API Protocol** | **DONE**: Switched to `POST /query` | Resolved "Field required" (422) error |
| **Node Details Popup** | `GET /node-details/{id}` — live DB metadata | Popup with real values & Explain/Explore buttons |
| **Fraud Detection** | `GET /fraud-check` — 4 core anomaly rules | 🚨 Red badge + flagged issues list |

## Verification: Resizable UI & Flow Trace

1.  **Natural Language Answer**: The AI provides a concise business summary first.
2.  **Transaction Stream**: Below the answer, a visual chain of document icons and IDs (Order → Delivery → Billing → Journal → Payment) appears.
3.  **Interactive IDs**: Clicking any ID in the chat flow (e.g., Sales Order `740550`) instantly pans and highlights that node in the graph.

## Screenshots

![Visual Flow Trace — Transaction Stream in Chat](/home/abhishek/.gemini/antigravity/brain/aae00780-4a21-44b2-a300-4679b870a57a/visual_flow_trace_result_1774273287851.png)

![Resizable Chat Panel](/home/abhishek/.gemini/antigravity/brain/aae00780-4a21-44b2-a300-4679b870a57a/wide_chat_panel_1774273771803.png)

![Final Monorepo Running Dashboard](/home/abhishek/.gemini/antigravity/brain/aae00780-4a21-44b2-a300-4679b870a57a/final_monorepo_running_dashboard_1774275326249.png)

![Highlights Active during Trace](/home/abhishek/.gemini/antigravity/brain/aae00780-4a21-44b2-a300-4679b870a57a/trace_highlight_active_1774270288860.png)

![Highlights Cleared after General Query](/home/abhishek/.gemini/antigravity/brain/aae00780-4a21-44b2-a300-4679b870a57a/highlights_cleared_after_general_query_1774270320902.png)

![Full Flow Recording (AI Intent + Clear Highlights)](/home/abhishek/.gemini/antigravity/brain/aae00780-4a21-44b2-a300-4679b870a57a/erp_ai_flow_final_check_1774270223594.webp)

## Core Files Updated
- **Backend Master**: [main_OPENROUTER_FINAL.py](file:///mnt/a6018f24-00cb-4575-aa02-54436341e065/All%20Project/Dodge%20AI%2026/main_OPENROUTER_FINAL.py)
- **Shared Logic**: [main.py](file:///mnt/a6018f24-00cb-4575-aa02-54436341e065/All%20Project/Dodge%20AI%2026/main.py)
- **Frontend Sync**: [ChatPanel.jsx](file:///mnt/a6018f24-00cb-4575-aa02-54436341e065/All%20Project/Dodge%20AI%2026/dodge-ui/src/components/ChatPanel.jsx)

