import { useCallback, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SiteLoader from "@/components/SiteLoader";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => {
  const [showLoader, setShowLoader] = useState(() => !sessionStorage.getItem("softgenix_loader_seen"));

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
        <Toaster />
        <Sonner />

        <motion.div
          initial={{ opacity: 0.94 }}
          animate={{ opacity: showLoader ? 0.94 : 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </motion.div>

        <AnimatePresence>{showLoader ? <SiteLoader onComplete={handleLoaderComplete} /> : null}</AnimatePresence>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
