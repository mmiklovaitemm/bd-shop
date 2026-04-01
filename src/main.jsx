import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// Context providers
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";

// Vercel Speed Insights import
import { SpeedInsights } from "@vercel/speed-insights/react";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <LanguageProvider>
        <FavoritesProvider>
          <App />
          {/* Vercel monitoring component */}
          <SpeedInsights />
        </FavoritesProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
