import PageIntro from "@/components/PageIntro";
import PageShell from "@/components/PageShell";
import CTASection from "@/components/sections/CTASection";
import AboutSection from "@/components/sections/About";
import Testimonials from "@/components/sections/Testimonials";
import WhyChooseUs from "@/components/sections/WhyChooseUs";

const About = () => {
  return (
    <PageShell>
      <PageIntro
        eyebrow="About"
        title="Small team, senior execution, outsized impact."
        description="Softgenix combines product thinking, visual craft, and reliable delivery so founders can move faster without sacrificing quality."
      />
      <AboutSection />
      <WhyChooseUs />
      <Testimonials />
      <CTASection />
    </PageShell>
  );
};

export default About;
