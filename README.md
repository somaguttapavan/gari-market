# AgriGrowth: AI-Powered Organic Farming Assistant 🌿🚜

AgriGrowth is a premium, all-in-one platform designed to empower organic farmers with AI-driven soil analysis, quality assessment, real-time market insights, and expert agricultural advice.

---

## 🚀 Key Features

*   **Smart Soil Analyzer 🧪**: Deep AI analysis of NPK levels, pH, and moisture to provide custom crop recommendations and fertilizer advice.
*   **AI Quality Check 📸**: Upload or take photos of crops to get instant AI-detected quality scores.
*   **Live Market Prices 📈**: Real-time wholesale prices from nearby mandis, automatically sorted by distance.
*   **AgriExpert Chatbot 💬**: Specialized organic farming assistant for step-by-step management.

---

## 🛠️ Installation & Setup

Follow these steps to get the entire platform (Frontend + Unified Backend) running on your computer.

### 1. Prerequisites
*   **Node.js** (v18+)
*   **Python** (3.9+)
*   **Git**

### 2. Backend Setup (Python)
The backend is powered by FastAPI and handles AI logic and market data.

1.  Navigate to the root directory `anti-project`.
2.  Create and activate a virtual environment:
    ```powershell
    python -m venv .venv
    .\.venv\Scripts\Activate.ps1
    ```
3.  Install Python dependencies:
    ```powershell
    pip install -r backend/requirements.txt
    ```

### 3. Frontend Setup (React)
1.  Install Node dependencies:
    ```powershell
    npm install
    ```

---

## 🏃 How to Run

To run the full application, you need to start **two** terminals.

### Terminal 1: Unified Backend
```powershell
cd backend
python main.py
```
*Server will run at http://localhost:8000*

### Terminal 2: Frontend (Web)
```powershell
npm run dev
```
*Open http://localhost:5173 to access the app.*

---

## 📱 Running on Mobile (Expo)

1.  Navigate to the `mobile` folder:
    ```bash
    cd mobile
    npm install
    ```
2.  Ensure your phone and laptop are on the **same Wi-Fi**.
3.  Start Expo:
    ```bash
    npx expo start
    ```
4.  Scan the QR code with the **Expo Go** app.

---

## 🏗️ Technology Stack

*   **Backend**: FastAPI (Python), Scikit-Learn (ML), Uvicorn.
*   **Frontend**: React.js, Vite, Framer Motion, Vanilla CSS.
*   **Mobile**: React Native, Expo.
*   **APIs**: data.gov.in (Market Data).

---

© 2026 AgriGrowth Team. Developed for Advanced Agentic Coding.
