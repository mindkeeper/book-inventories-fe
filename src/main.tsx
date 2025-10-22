import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppRoutes } from "./components/routes";
import { QueryProvider } from "./providers/query-provider";
import NuqsProvider from "./providers/nuqs-provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <>
      <NuqsProvider>
        <QueryProvider>
          <AppRoutes />
        </QueryProvider>
      </NuqsProvider>
    </>
  </StrictMode>
);
