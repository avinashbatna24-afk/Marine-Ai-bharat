# 🌊 MarineAI — Agentic AI Marine Advisory, Safety & GIS Navigation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v6-purple.svg)](https://vitejs.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GIS-brightgreen.svg)](https://leafletjs.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)](https://ai.google.dev/)

---

## 📋 Abstract & Executive Summary

**MarineAI** (also known as *SamudraDrishti*) is a multi-agent, AI-powered marine intelligence, oceanographic advisory, and GIS navigation platform designed to empower mariners, fishermen, naval operators, and coastal safety agencies. 

Marine navigation and artisanal fishing face severe operational challenges, including sudden sea condition shifts, dangerous wave surges, accidental crossing of International Maritime Boundary Lines (IMBL), inefficient fuel expenditure while locating fish aggregations, and language barriers in accessing official scientific advisories.

MarineAI solves these challenges by combining:
1. **Agentic Conversational AI**: Natural language query processing in **English** and **Telugu** powered by Google Gemini (with deterministic rule-based fallback).
2. **Potential Fishing Zone (PFZ) Intelligence**: Satellite-derived oceanographic data (Sea Surface Temperature & Chlorophyll-a) to identify high-yield pelagic aggregation fronts.
3. **Dynamic Marine Risk Engine**: Real-time safety calculations evaluating wave heights, wind velocity, ocean currents, and storm surge warnings.
4. **Geospatial & Geofence Engine**: Interactive GIS canvas featuring vessel tracking, IMBL proximity alerts, restricted naval zone warnings, and 0.25° x 0.25° risk grid overlays.

---

## ✨ Key Features

- 🤖 **Agentic Multi-Agent Pipeline**:
  - **Intent Agent**: Classifies queries into 7 distinct maritime intents (`PFZ_SEARCH`, `MARINE_SAFETY`, `SAFE_ROUTE`, `MARINE_CONDITIONS`, `GEOFENCE_CHECK`, `HAZARD_ALERT`, `GENERAL_QUERY`).
  - **Planner Agent**: Maps intents into multi-tool execution pipelines.
  - **Tools Engine**: Interfaces with oceanographic & weather REST APIs with automatic timeout & fallback handling.
  - **Context Manager**: Remembers user vessel coordinates, destination, active PFZ, and risk history across turns.
  - **Synthesis Agent**: Generates evidence-backed natural language responses, risk levels (`SAFE_TO_SAIL`, `PROCEED_WITH_CAUTION`, `DO_NOT_SAIL`), and Telugu regional translations.

- 🐟 **Potential Fishing Zone (PFZ) Advisory**:
  - Real-time thermal and biological ocean data integration (INCOIS / Open-Meteo).
  - Spatial proximity matching matching nearest high-yield fishing zones with depth, SST (°C), and Chlorophyll (\(mg/m^3\)) metrics.

- 🗺️ **Interactive GIS Map & Spatial Intelligence**:
  - Custom Leaflet map with custom marker styling, PFZ heat circles, and connecting navigation polylines.
  - GeoJSON polygon boundary check for restricted zones and IMBL warning boundaries.
  - Dynamic 0.25° x 0.25° risk heatgrid overlay color-coded by wave height and wind speed.

- 🚨 **Safety Alerts & Emergency System**:
  - High-wave alerts, cyclone warnings, and storm advisories.
  - One-click SOS emergency alert trigger with location broadcast simulation.

- 🔒 **Dual Authentication Architecture**:
  - Seamless Firebase Authentication (Email/Password & Google Sign-In with Cloud Firestore user profiles).
  - Built-in safe local authentication fallback when environment keys are omitted.

---

## 🏗️ System Architecture & Data Flow

```
                  ┌─────────────────────────────────────┐
                  │    User Interface (React / Vite)    │
                  └──────────────────┬──────────────────┘
                                     │
                             (Natural Query)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │     AI Multi-Agent Orchestrator     │
                  └──────────────────┬──────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
 ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
 │   Intent Agent    │     │   Planner Agent   │     │ Synthesis Agent   │
 └───────────────────┘     └───────────────────┘     └───────────────────┘
                                     │
                               (Tool Execution)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │      Express Backend API Server     │
                  └──────────────────┬──────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
 ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
 │    PFZ Service    │     │   Weather / SST   │     │  Geofence / Risk  │
 │ (INCOIS / WFS)    │     │   (Open-Meteo)    │     │   (Spatial GIS)   │
 └───────────────────┘     └───────────────────┘     └───────────────────┘
```

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS, Leaflet & React-Leaflet, Recharts, Lucide Icons, Firebase Auth & Firestore.
- **Backend**: Node.js, Express.js (v5), Axios, CORS, Dotenv.
- **AI Engine**: Node-based Multi-Agent Orchestrator, `@google/generative-ai` (Gemini 2.5 Flash), System Prompt Engineering.
- **GIS & Algorithms**: Haversine distance calculations, GeoJSON Layer Generators, Point-in-Polygon spatial algorithms.

---

## 📁 Repository Structure

```
MARINE_AI/
├── frontend/                     # React + Vite Frontend Application
│   ├── public/                   # Static assets & icons
│   ├── src/
│   │   ├── api/                  # Axios API clients for backend endpoints
│   │   ├── components/           # UI & GIS map components (MarineMap, MapLegend, etc.)
│   │   ├── context/              # React Context (AuthContext, LanguageContext)
│   │   ├── firebase/             # Firebase SDK configuration & local fallback
│   │   ├── gis/                  # Distance engine, spatial queries & geofencing logic
│   │   ├── i18n/                 # Multi-language translation dictionaries (EN / TE)
│   │   ├── pages/                # Main application view pages
│   │   ├── App.jsx               # Main React router & layout
│   │   └── main.jsx              # React app entry point
│   ├── .env                      # Local frontend env config (Sanitized / No keys exposed)
│   ├── .env.example              # Frontend environment variables template
│   └── package.json
│
├── backend/                      # Node.js + Express Backend Services & AI Core
│   ├── ai/                       # Agentic AI orchestration framework
│   │   ├── agents/               # Intent, Planner, and Synthesis AI agents
│   │   ├── contextManager.js     # Short-term conversational memory
│   │   ├── orchestrator.js       # Main multi-agent execution pipeline
│   │   ├── prompts.js            # Structured prompt templates
│   │   └── tools.js              # REST tool execution wrappers
│   ├── backend/                  # Express REST API application
│   │   ├── src/                  # Controllers, routes & server.js
│   │   ├── services/             # Weather, SST, PFZ, risk & warning logic
│   │   └── package.json
│   ├── data/                     # Data stores & capabilities XMLs
│   ├── docs/                     # System architecture & developer docs
│   ├── gis/                      # Server-side spatial algorithms
│   ├── risk-engine/              # Marine risk scoring formulas
│   ├── .env                      # Backend environment configuration
│   ├── .env.example              # Backend environment variables template
│   └── package.json
│
├── .gitignore                    # Comprehensive Git ignore rules
└── README.md                     # Root project documentation
```

---

## 🔑 Environment Variables & Security

All sensitive credentials and API keys are kept strictly out of source control using `.env` environment files and managed via `.gitignore`.

### 1. Frontend Environment (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api

# Optional Firebase configuration (Leave empty for safe local auth mode)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
```

### 2. Backend Environment (`backend/.env` & `backend/backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Optional: Google Gemini API Key for hybrid AI planning
GEMINI_API_KEY=your_gemini_api_key_here
MODEL_NAME=gemini-2.5-flash
```

> 🔒 **Security Guarantee**: No private keys or secret credentials are committed to this repository. When API keys are left blank, the platform automatically switches to robust local fallback modes without throwing errors.

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/MuraliAkula04/MARINE_AI.git
cd MARINE_AI
```

### 2. Start Backend API Server
```bash
cd backend
npm install
npm start
```
*The backend server will run on `http://localhost:5000`.*

### 3. Start Frontend UI
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The React application will launch on `http://localhost:5173`.*

---

## 🧪 Verification & Automated Testing

The AI engine includes an automated end-to-end test suite verifying all 7 intent types and regional Telugu queries:

```bash
cd backend/ai
npm test
```

### Benchmark Pass Results (100% Passed ✅):
- `[1/8]` PFZ Search ("Where is the nearest PFZ?") — **PASSED** ✅
- `[2/8]` Marine Safety ("Can I go fishing tomorrow morning?") — **PASSED** ✅
- `[3/8]` Safe Route ("Find the safest route to nearest fishing zone.") — **PASSED** ✅
- `[4/8]` Marine Conditions ("What is wave height & sea weather today?") — **PASSED** ✅
- `[5/8]` Geofence Check ("Am I close to international border zone?") — **PASSED** ✅
- `[6/8]` Hazard Alert ("Are there any cyclone or wave warnings active?") — **PASSED** ✅
- `[7/8]` Regional Telugu Query ("రేపు సముద్రంలోకి వేటకు వెళ్ళవచ్చా?") — **PASSED** ✅
- `[8/8]` General Query ("Hello, what can this assistant do?") — **PASSED** ✅

---

## ⚠️ Disclaimer

> **`⚠️ Disclaimer: This application is a prototype developed for SIH 2026. Maritime boundaries, geofence polygons, and risk scores are simulated for demonstration purposes. Not intended for actual open-sea vessel navigation without official INCOIS / IMD verification.`**

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
