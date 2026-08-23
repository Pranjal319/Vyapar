# VYAPAR: Ancient India Trading System 📜🐫

**VYAPAR** is an interactive, educational 2D RPG trading adventure game built for Smart India Hackathon (SIH). It transforms India's historical trade networks—from the imperial granaries of Pataliputra and crossroads bazaars of Ujjain to the western sea port of Bharuch, temple guilds of Madurai, and Malabar spice center of Muziris—from static textbook facts into a rich interactive experience.

---

## 🏆 SIH Presentation & Demo Mode

VYAPAR features a dedicated **5-7 Minute SIH Presentation Demo Mode**:
* **Instant Demo Access**: Click `[ 🏆 PLAY SIH DEMO ]` on the home screen.
* **Isolated Environment**: Starts at Ujjain with 500 Mudras, an unlocked Bharuch route, and 10 guided demo objectives.
* **Zero Saved State Risk**: Demo mode operates purely in-memory—real player save states and Supabase data remain 100% untouched.
* **Demo Summary**: Completing the demo displays calculated stats (`Route`, `Goods Traded`, `Trade Result`, `Knowledge Gained`, `Events Encountered`) with options to replay or return home.

---

## 🎮 Core Gameplay Flow

```
Explore 2D City Environment
        │
        ▼
Talk to Cultural Narrators & Solve Historical Questions (+10 Knowledge)
        │
        ▼
Interact with Merchant Stalls & Inspect Regional Demand
        │
        ▼
Purchase Commodities (Textiles, Pepper, Salt, Gems)
        │
        ▼
Open Strategic India Trade Map (M) & Plan Caravan Routes
        │
        ▼
Travel Overland/Maritime Routes & Resolve Travel Events
        │
        ▼
Arrive at Destination Port & Sell Cargo for Profit
        │
        ▼
Discover Historical Insights & Record Lore in Knowledge Journal
```

---

## 🛠️ Technology Architecture

* **Frontend Framework**: React + Vite
* **2D Graphics Engine**: HTML5 Canvas with custom camera follow lerp, AABB collision detection, and particle FX
* **Audio Engine**: Synthesized Web Audio API sound engine with volume sliders and ambient sound profiles
* **Backend & Auth**: Supabase PostgreSQL + Auth with RLS (Row Level Security) and JSONB progress synchronization
* **Data Layer**: Externalized JSON datasets (`questions.json`, `markets.json`, `travelEvents.json`, `story.json`, `historicalInsights.json`)

---

## 🚀 Local Development Setup

1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables (`.env`)**:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Production Build & Preview**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 📄 Presentation Documentation

* [SIH Presentation Pitch Script](docs/SIH_DEMO_SCRIPT.md) — 5-7 minute guided presentation script for SIH judges.
* [SIH Presentation Readiness Checklist](docs/SIH_DEMO_CHECKLIST.md) — Verification matrix for live demonstrations.

---

## 📜 License & Credits

Built with React, Vite, and HTML5 Canvas for Smart India Hackathon (SIH). Educational content derived from ancient and medieval Indian commercial history.
