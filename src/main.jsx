import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
