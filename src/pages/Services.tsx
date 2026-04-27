import PageIntro from "@/components/PageIntro";
import PageShell from "@/components/PageShell";
import CTASection from "@/components/sections/CTASection";
import ServicesSection from "@/components/sections/Services";

const Services = () => {
  return (
    <PageShell>
      <PageIntro
        eyebrow="Services"
        title="A full-stack digital studio for brands that want momentum."
        description="We design, build, launch, and grow digital products with one senior team across engineering, design, AI, and marketing."
      />
      <ServicesSection />
      <CTASection />
    </PageShell>
  );
};

export default Services;
