import { useCallback, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import FluidBackground from "@/components/effects/FluidBackground";
import Navbar from "@/components/Navbar";
import SiteLoader from "@/components/SiteLoader";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Index from "./pages/Index";
import LetsTalk from "./pages/LetsTalk";
import NotFound from "./pages/NotFound";
import Services from "./pages/Services";
import Work from "./pages/Work";

const queryClient = new QueryClient();
const LOADER_SESSION_KEY = "softgenix_loader_seen";

const App = () => {
  const [showLoader, setShowLoader] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return !window.sessionStorage.getItem(LOADER_SESSION_KEY);
  });

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (showLoader) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showLoader]);

  const handleLoaderComplete = useCallback(() => {
    window.sessionStorage.setItem(LOADER_SESSION_KEY, "1");
    setShowLoader(false);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="app-shell">
          <div className="app-base" aria-hidden="true" />
          <FluidBackground />

          <div className="app-content">
            <Toaster />
            <Sonner />

            <motion.div
              initial={{ opacity: showLoader ? 0.84 : 1, scale: showLoader ? 0.992 : 1 }}
              animate={{ opacity: showLoader ? 0.9 : 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Navbar />

                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/portfolio" element={<Work />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/lets-talk" element={<LetsTalk />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {showLoader ? <SiteLoader onComplete={handleLoaderComplete} /> : null}
          </AnimatePresence>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
