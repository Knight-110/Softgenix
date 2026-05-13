import PageShell from "@/components/PageShell";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import CTASection from "@/components/sections/CTASection";
import Contact from "@/components/sections/Contact";

const Index = () => {
  return (
    <PageShell>
      <>
        <h1 className="sr-only">
          Softgenix Infotech - Web Development, Mobile Apps, AI Chatbots & Digital Marketing
        </h1>

        <Hero />
        <About />
        <Process />
        <WhyChooseUs />
        <Testimonials />
        <CTASection variant="home" />
        <Contact />
      </>
    </PageShell>
  );
};

export default Index;
