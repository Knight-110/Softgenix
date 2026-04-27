import PageIntro from "@/components/PageIntro";
import PageShell from "@/components/PageShell";
import CTASection from "@/components/sections/CTASection";
import ProcessSection from "@/components/sections/Process";

const Process = () => {
  return (
    <PageShell>
      <PageIntro
        eyebrow="Process"
        title="A calm, structured path from idea to launch."
        description="Every engagement runs through a simple rhythm: discover clearly, design intentionally, build carefully, and keep improving after launch."
      />
      <ProcessSection />
      <CTASection />
    </PageShell>
  );
};

export default Process;
