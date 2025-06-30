import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { codexApi } from "./utils/apiClient";

// Add debug utility to global window for easy testing
if (typeof window !== 'undefined') {
  (window as any).codexApi = codexApi;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
