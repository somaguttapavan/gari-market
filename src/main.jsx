import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

// Handle Native OAuth redirect back to mobile app in Expo Go or Standalone App
if (typeof window !== 'undefined' && window.location.hash) {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const state = params.get('state');
    if (accessToken && state && (state.startsWith('exp://') || state.startsWith('com.agrigrowth.app://'))) {
        console.log("Redirecting back to native app:", state);
        
        // Attempt automatic redirect immediately
        window.location.href = `${state}#${hash}`;
        
        // Render a beautiful interactive fallback page so it never stays blank or white if the automatic redirect is blocked
        const renderFallbackUI = () => {
            const root = document.getElementById('root');
            if (root) {
                root.innerHTML = `
                    <div style="
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        color: #ffffff;
                        padding: 24px;
                        text-align: center;
                        box-sizing: border-box;
                    ">
                        <div style="
                            background: rgba(255, 255, 255, 0.1);
                            backdrop-filter: blur(16px);
                            -webkit-backdrop-filter: blur(16px);
                            border: 1px solid rgba(255, 255, 255, 0.2);
                            border-radius: 24px;
                            padding: 40px 32px;
                            max-width: 440px;
                            width: 100%;
                            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 24px;
                        ">
                            <div style="position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
                                <div style="
                                    position: absolute;
                                    width: 100%;
                                    height: 100%;
                                    border-radius: 50%;
                                    background: rgba(255, 255, 255, 0.2);
                                    animation: pulse 2s infinite ease-in-out;
                                "></div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: relative; z-index: 10;">
                                    <path d="M7 20h10" />
                                    <path d="M10 20v-5a2 2 0 0 1 4 0v5" />
                                    <path d="M12 15V3m0 0a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3M12 3a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3" />
                                </svg>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Authenticating...</h1>
                                <p style="margin: 0; font-size: 15px; color: rgba(255, 255, 255, 0.8); line-height: 1.5;">
                                    Successfully signed in with Google.
                                </p>
                            </div>

                            <a href="${state}#${hash}" style="
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                gap: 8px;
                                background-color: #ffffff;
                                color: #1b5e20;
                                text-decoration: none;
                                padding: 14px 28px;
                                border-radius: 50px;
                                font-weight: 700;
                                font-size: 16px;
                                width: 100%;
                                box-sizing: border-box;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                                transition: transform 0.2s, background-color 0.2s;
                            " onmouseover="this.style.backgroundColor='#f1f8e9'; this.style.transform='translateY(-2px)';" onmouseout="this.style.backgroundColor='#ffffff'; this.style.transform='none';">
                                Open Agri-Growth App
                            </a>

                            <span style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">
                                If the app did not open automatically, please click the button above.
                            </span>
                        </div>
                        
                        <style>
                            @keyframes pulse {
                                0% { transform: scale(0.9); opacity: 0.8; }
                                50% { transform: scale(1.1); opacity: 0.3; }
                                100% { transform: scale(0.9); opacity: 0.8; }
                            }
                        </style>
                    </div>
                `;
            } else {
                document.addEventListener('DOMContentLoaded', renderFallbackUI);
            }
        };
        renderFallbackUI();
    }
}

const GOOGLE_CLIENT_ID = "908874412227-0td5t7ftigm6itgcjh0m0sd77jn64fim.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)
