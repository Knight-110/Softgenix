import { useCallback, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import FluidBackground from "@/components/effects/FluidBackground";
import SiteLoader from "@/components/SiteLoader";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Process from "./pages/Process";
import Services from "./pages/Services";
import Work from "./pages/Work";

const queryClient = new QueryClient();

const App = () => {
  const [showLoader, setShowLoader] = useState(
    () => !sessionStorage.getItem("softgenix_loader_seen")
  );

  useEffect(() => {
    const original = document.body.style.overflow;

    if (showLoader) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original;
    }

    return () => {
      document.body.style.overflow = original;
    };
  }, [showLoader]);

  const handleLoaderComplete = useCallback(() => {
    sessionStorage.setItem("softgenix_loader_seen", "1");
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
              initial={{ opacity: 0.94 }}
              animate={{ opacity: showLoader ? 0.94 : 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/process" element={<Process />} />
                  <Route path="/portfolio" element={<Work />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </motion.div>
          </div>

          <AnimatePresence>
            {showLoader ? <SiteLoader onComplete={handleLoaderComplete} /> : null}
          </AnimatePresence>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
