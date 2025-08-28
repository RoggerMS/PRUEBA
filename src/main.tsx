import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SessionProvider } from "next-auth/react";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SessionProvider>
      <App />
    </SessionProvider>
  </StrictMode>
);
