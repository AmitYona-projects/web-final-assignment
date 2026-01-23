import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { config } from "./config/index.ts";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "@mui/material";
import theme from "./theme.ts";

const clientId = config.googleClientId;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={clientId}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
