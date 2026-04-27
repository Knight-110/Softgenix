import PageIntro from "@/components/PageIntro";
import PageShell from "@/components/PageShell";
import CTASection from "@/components/sections/CTASection";
import Portfolio from "@/components/sections/Portfolio";
import Testimonials from "@/components/sections/Testimonials";

const Work = () => {
  return (
    <PageShell>
      <PageIntro
        eyebrow="Portfolio"
        title="Case studies shaped for growth, performance, and clarity."
        description="From product launches to AI-assisted support flows, these projects show how we blend visual polish with measurable business outcomes."
      />
      <Portfolio />
      <Testimonials />
      <CTASection />
    </PageShell>
  );
};

export default Work;
