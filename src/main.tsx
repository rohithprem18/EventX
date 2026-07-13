import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// Self-hosted via Fontsource instead of a Google Fonts <link> tag, so the
// app never blocks on (or leaks a request to) fonts.googleapis.com.
import "@fontsource/outfit/300.css";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/outfit/800.css";
import "@fontsource/outfit/900.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
