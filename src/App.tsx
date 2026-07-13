import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { BookingStoreProvider } from "@/hooks/useBookingStore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import HomePage from "@/pages/HomePage";
import EventPage from "@/pages/EventPage";
import BookingPage from "@/pages/BookingPage";
import UserDashboard from "@/pages/UserDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import NotFound from "./pages/NotFound";

// Keying Routes by pathname lets AnimatePresence detect a page change and
// play each page's exit transition before the next one mounts, instead of
// the old page vanishing instantly mid-animation.
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/event/:id" element={<EventPage />} />
        <Route path="/booking/:id" element={<BookingPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="eventx-theme" disableTransitionOnChange>
    <AuthProvider>
      <BookingStoreProvider>
        <Toaster />
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <div className="min-h-screen">
            <AnimatedRoutes />
          </div>
          <Footer />
        </BrowserRouter>
      </BookingStoreProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
