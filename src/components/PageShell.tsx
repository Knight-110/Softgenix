import { type ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import ScrollProgress from "@/components/ScrollProgress";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type PageShellProps = {
  children: ReactNode;
};

const PageShell = ({ children }: PageShellProps) => {
  useScrollReveal();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);

      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.hash]);

  return (
    <main className="relative min-h-screen bg-transparent text-foreground">
      <div className="relative z-10">
        <ScrollProgress />
        <Navbar />
        {children}
        <Footer />
        <FloatingWhatsApp />
      </div>
    </main>
  );
};

export default PageShell;
