# AgriGrowth: AI-Powered Organic Farming Assistant 🌿🚜

AgriGrowth is a premium, all-in-one platform designed to empower organic farmers with AI-driven quality assessment, real-time market insights, and expert agricultural advice. The project features a synchronized experience across Web (Laptop) and Mobile (Expo) platforms.

---

## 🚀 Key Features

*   **AI Quality Check 📸**: Upload or take photos of crops (Tomato, Potato, Beetroot, etc.) to get instant AI-detected quality scores and expert advice.
*   **Live Market Prices 📈**: Real-time wholesale prices from nearby mandis within 110km, prioritized by your current state and distance.
*   **AgriExpert Chatbot 💬**: Trained with 50+ specialized organic farming guides for step-by-step crop management.
*   **Dual GPS Integration 📱💻**: High-precision device GPS on mobile and smart browser-based location on web.
*   **Responsive Design**: Desktop-first sidebar layout for laptops and a premium floating toggle widget for mobile.

---

## 💻 Running on Laptop (Web)

Follow these steps to get the web application running on your computer:

1.  **Open Terminal**: Navigate to the root directory `anti-project`.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Start Dev Server**:
    ```bash
    npm run dev
    ```
4.  **Access the App**: Open your browser and go to the local URL provided (usually `http://localhost:5173`).

---

## 📱 Running on Mobile (Expo)

Follow these steps to run the mobile application using Expo:

1.  **Prerequisites**:
    *   Install the **Expo Go** app on your physical iOS or Android device.
    *   Ensure your laptop and mobile device are on the **same Wi-Fi network**.
2.  **Navigate to Mobile Folder**:
    ```bash
    cd mobile
    ```
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
4.  **Start Expo Server**:
    ```bash
    npx expo start
    ```
5.  **Scan QR Code**: Use your phone's camera (iOS) or the Expo Go app (Android) to scan the QR code displayed in your terminal.
6.  **Switch to Tunnel (If needed)**: If you are on a restricted network, press `s` in the terminal to switch to tunnel mode (`npx expo start --tunnel`).

---

## 🏗️ Technology Stack

*   **Frontend**: React.js, Framer Motion (Animations), Lucide React (Icons).
*   **Styling**: Vanilla CSS (Premium Glassmorphism 2.0).
*   **Mobile**: React Native, Expo, WebView.
*   **APIs**: data.gov.in (Market Prices), Nominatim (Geocoding).
*   **Logic**: Custom rule-based AI engine for crop detection and expert chat.

---

## 📁 Project Structure

*   `/src`: Web application source code (React).
*   `/mobile`: Mobile application source code (React Native/Expo).
*   `/src/pages`: Main application views (QualityCheck, LiveMarket, Cultivation).
*   `/src/services`: Core logic (Agri Chat Logic, Market API Service).
*   `/src/index.css`: Global design system and premium styles.

---

© 2026 AgriGrowth Team. Developed for Advanced Agentic Coding.
