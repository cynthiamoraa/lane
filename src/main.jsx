import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { CartProvider } from "./CartContext.jsx";
import { SiteDataProvider } from "./SiteDataContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SiteDataProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </SiteDataProvider>
    </BrowserRouter>
  </React.StrictMode>
);
