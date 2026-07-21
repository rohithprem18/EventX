import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// Self-hosted via Fontsource instead of a Google Fonts <link> tag, so the
// app never blocks on (or leaks a request to) fonts.googleapis.com.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
// Display face for the app's own "marquee" moments — event titles, page
// headlines, the brand wordmark — so the identity isn't one grotesque sans
// doing every job. Inter stays the workhorse for UI, forms, and dashboards.
// Instrument Serif ships one weight (400) by design — it's a display face,
// never meant to carry bold/black cuts.
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
