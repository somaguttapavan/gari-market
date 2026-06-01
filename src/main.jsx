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
        window.location.href = `${state}#${hash}`;
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
