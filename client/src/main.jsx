import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { lazy, Suspense } from 'react';
import { Provider } from "react-redux";
import store from "./store/store.js";
import { Toaster } from "./components/ui/toaster.jsx";
import "@/i18n/i18n.js";
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">Loading...</div>}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </Suspense>
      <Toaster />
    </Provider>
  </BrowserRouter>
);