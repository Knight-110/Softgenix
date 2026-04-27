import { type ReactNode, useEffect } from "react";
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

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
