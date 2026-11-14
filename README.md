# FieldWise — Smarter Rotations. Resilient Agriculture.

> **NASA Space Apps Challenge 2026**  
> **Challenge:** Field Shift – Adapting Farms with NASA Data

FieldWise is a **Location-Based Agricultural Decision Support System** designed to assist farmers, agricultural extension agents, and agronomists in designing, evaluating, and comparing crop rotation strategies based on farm parcel coordinates, real NASA satellite agroclimatology data, and soil context.

---

## 🚜 The Core Problem

Two farms located close to each other often have divergent microclimates, drainage patterns, or historical soil depletion. Recommending a generic one-size-fits-all crop rotation risks yield penalties, excessive synthetic fertilizer use, and vulnerability to drought.

FieldWise bridges this gap by grounding every rotation recommendation in **parcel-specific coordinates**, querying **NASA POWER environmental data**, and computing **explainable, multi-criteria agronomic trade-offs**.

---

## 🛰️ NASA Data Integration

FieldWise integrates directly with the **NASA POWER API** (Prediction Of Worldwide Energy Resources):
- **API Endpoint:** `https://power.larc.nasa.gov/api/temporal/climatology/point`
- **User Community:** `AG` (Agroclimatology)
- **Key Parameters Harvested:**
  - `T2M`: Mean Air Temperature at 2m (°C)
  - `T2M_MAX`: Maximum Air Temperature at 2m (°C)
  - `T2M_MIN`: Minimum Air Temperature at 2m (°C)
  - `PRECTOTCORR`: Bias-corrected precipitation (mm/day & annual sum)
  - `RH2M`: Relative Humidity at 2m (%)
  - `ALLSKY_SFC_SW_DWN`: All-sky downward solar radiation (MJ/m²/day)

### Scientific Transparency & Limitations
- **Spatial Resolution:** ~0.5° latitude/longitude (~50 km grid). Marked clearly as regional climatological estimates.
- **Climatology vs. Forecast:** Long-term historical averages (20+ years of satellite observations). Not a 10-day weather forecast.
- **Soil Chemistry:** FieldWise does not invent laboratory measurements or claim satellites measure soil salinity or fertility directly.

---

## 🧠 Explainable Recommendation Engine

FieldWise deliberately avoids opaque "black-box" predictions. The decision matrix evaluates rotations across 6 transparent agronomic dimensions:

1. **Climate Suitability:** Matches crop cardinal temperatures ($T_{min}$, $T_{opt}$, $T_{max}$) against NASA seasonal curves.
2. **Water Balance:** Balances precipitation volume plus farm irrigation against crop water demands.
3. **Soil Health & Structure:** Rewards diverse root architectures (fibrous roots paired with deep taproots) to reduce compaction and enhance infiltration.
4. **Biological Nitrogen Balance:** Quantifies Rhizobium nitrogen fixation from legumes (saving 30–50 kg N/ha of synthetic fertilizer).
5. **Pest & Pathogen Cycle Interruption:** Penalizes monocultures and continuous same-family sequences; rewards rotational breaks.
6. **Botanical Family Diversity:** Measures functional multi-family diversity (Poaceae, Fabaceae, Asteraceae).

### Evaluated Strategies:
- **Strategy A (Baseline):** Farmer's current crop rotation.
- **Strategy B (Legume-Enhanced):** Integrates high-efficiency legumes (e.g. Faba Bean / Soybean) to restore soil nitrogen and break pathogen cycles.
- **Strategy C (3-Family Diversification):** Combines cereals, legumes, and deep-rooted broadleaves (e.g. Sunflower/Sorghum) for maximum climate resilience.

---

## 🛠️ Technology Stack

- **Frontend & Full-Stack Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling & UI:** Tailwind CSS, Lucide React icons, responsive layout
- **Mapping & GIS:** Leaflet 1.9.4, React Leaflet (OpenStreetMap tiles, custom marker management)
- **Data Visualization:** Recharts (Monthly Temperature, Precipitation, Humidity, and 6-Axis Comparison Radar)
- **State & Caching:** Resilient client-side caching & server-side proxying

---

## 🚀 Running Locally

```bash
# 1. Navigate to the project directory
cd fieldwise

# 2. Install dependencies (if not already installed)
npm install

# 3. Start development server
npm run dev

# 4. Or build and run production server
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📋 Application Route Sitemap

- `/` — **Landing Page**: Problem overview, 5-stage workflow, crop knowledge base, and mission.
- `/farm` — **Farm Profile & Location**: Interactive Leaflet map, GPS coordinates, water access, and soil context.
- `/dashboard` — **NASA Climate Dashboard**: Real-time NASA POWER data, summary metric cards, monthly charts, and limitations disclosure.
- `/recommendations` — **Strategy Comparison**: Side-by-side strategy cards, multi-criteria radar chart, and trade-off matrix.
- `/report` — **Final Farm Report**: Comprehensive report exportable to PDF and printable for field use.
- `/api/nasa-power` — Server-side proxy for NASA POWER API with automatic demonstration fallback.
- `/api/recommendations` — Server-side rule-based recommendation API.

---

## 📄 License & Attribution

Developed for the **NASA Space Apps Challenge 2026**. Environmental data courtesy of NASA Langley Research Center POWER Project.
