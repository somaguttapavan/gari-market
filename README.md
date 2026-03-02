# AgriGrowth: AI-Powered Organic Farming Assistant 🌿🚜

AgriGrowth is a premium, full-stack platform empowering organic farmers with AI-driven soil analysis, real-time market prices, expert guidance, and a synchronized Web + Mobile experience.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🧪 **Smart Soil Analyzer** | Enter soil NPK/pH values and get AI-powered crop recommendations and fertilizer advice |
| 📈 **Live Market Prices** | Real-time mandi prices from 39+ markets, automatically sorted by nearest distance |
| 💬 **AgriExpert Chatbot** | 80+ expert-verified organic farming guides, responds in natural language |
| 📸 **AI Quality Check** | Upload crop photos for instant AI quality scoring |
| 📱 **Mobile App** | React Native app (Expo Go) that mirrors the full web experience |

---

## 🛠️ Step-by-Step Installation

### Step 1 — Prerequisites
Make sure you have the following installed:
- **Node.js** v18 or above → [nodejs.org](https://nodejs.org)
- **Python** 3.9 or above → [python.org](https://python.org)
- **Git** → [git-scm.com](https://git-scm.com)

---

### Step 2 — Clone the Repository
```powershell
git clone https://github.com/somaguttapavan/gari-market.git
cd gari-market
```

---

### Step 3 — Set Up Python Backend

1. Create a virtual environment:
    ```powershell
    python -m venv .venv
    ```
2. Activate it:
    ```powershell
    .\.venv\Scripts\Activate.ps1
    ```
    > *On Mac/Linux:* `source .venv/bin/activate`

3. Install Python dependencies:
    ```powershell
    pip install -r backend/requirements.txt
    ```

---

### Step 4 — Set Up Frontend

Install Node.js dependencies:
```powershell
npm install
```

---

### Step 5 — Set Up Mobile (Optional)

```powershell
cd mobile
npm install
cd ..
```

---

## ▶️ How to Run

### Option A — One Command (Recommended)
Use the included launcher script to start **both** backend and frontend together:
```powershell
.\start.ps1
```
This automatically:
- Activates `.venv` if present
- Starts the Python backend on `http://localhost:8000`
- Starts Vite frontend on `http://localhost:5173`
- Stops both when you press `Ctrl+C`

---

### Option B — Manual (Two Terminals)

**Terminal 1 — Backend:**
```powershell
.\.venv\Scripts\Activate.ps1
cd backend
python main.py
```

**Terminal 2 — Frontend:**
```powershell
npm run dev
```

Open **http://localhost:5173** in your browser.

---

### 📱 Run Mobile App

1. Make sure your phone and laptop are on the **same Wi-Fi network**.
2. Start Expo:
    ```powershell
    cd mobile
    npx expo start
    ```
3. Scan the **QR code** using the **Expo Go** app on your phone.

---

## 🧪 Running Tests

**Backend (Python):**
```powershell
.\.venv\Scripts\Activate.ps1
python -m pytest backend/test_soil_service.py -v
```

**Frontend (Web):**
```powershell
npm test
```

**Mobile:**
```powershell
cd mobile
npm test
```

---

## 🏗️ Architecture

```
anti-project/
├── backend/              # Python FastAPI server (port 8000)
│   ├── main.py           # API routes: /api/analyze-soil, /api/markets/nearby
│   ├── soil_service.py   # ML-based soil analysis logic
│   └── test_soil_service.py  # 14 pytest unit tests
├── src/                  # React frontend
│   ├── pages/            # QualityCheck, LiveMarket, Cultivation
│   ├── components/       # SoilTester, Chatbot, etc.
│   ├── hooks/            # useCultivation, useNearbyMarkets, etc.
│   └── services/         # Chatbot rules, Market service
├── mobile/               # React Native (Expo) app
│   └── App.js            # WebView wrapper with GPS sync
├── start.ps1             # One-click launcher (Windows)
└── start.sh              # One-click launcher (Mac/Linux)
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/analyze-soil` | POST | Analyze soil and get crop recommendations |
| `/api/markets/nearby?lat=&lon=` | GET | Markets within 100km, sorted by distance |
| `/` | GET | API health check |

---

## 🏷️ Technology Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, Scikit-Learn, Uvicorn, Python 3.9+ |
| Frontend | React 19, Vite, Framer Motion, Vanilla CSS |
| Mobile | React Native, Expo, WebView |
| Testing | pytest (backend), Vitest (web), Jest (mobile) |

---

© 2026 AgriGrowth Team. Developed for Advanced Agentic Coding.
