import { useScrollReveal } from "@/hooks/useScrollReveal";
import ImmersiveBackground from "@/components/ImmersiveBackground";
import ScrollProgress from "@/components/ScrollProgress";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import TransitionStrip from "@/components/sections/TransitionStrip";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Process from "@/components/sections/Process";
import Portfolio from "@/components/sections/Portfolio";
import Testimonials from "@/components/sections/Testimonials";
import CTASection from "@/components/sections/CTASection";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const Index = () => {
  useScrollReveal();

  return (
    <main className="relative min-h-screen text-foreground">
      <ImmersiveBackground />
      <ScrollProgress />
      <Navbar />

      <h1 className="sr-only">
        Softgenix Infotech — Web Development, Mobile Apps, AI Chatbots & Digital Marketing
      </h1>

      <Hero />
      <TransitionStrip />
      <Services />
      <About />
      <WhyChooseUs />
      <Process />
      <Portfolio />
      <Testimonials />
      <CTASection />
      <Contact />
      <Footer />

      <FloatingWhatsApp />
    </main>
  );
};

export default Index;
