import PageIntro from "@/components/PageIntro";
import PageShell from "@/components/PageShell";
import ContactSection from "@/components/sections/Contact";

const Contact = () => {
  return (
    <PageShell>
      <PageIntro
        eyebrow="Contact"
        title="Let's talk about the next thing you want to ship."
        description="Share the idea, the timeline, and the rough budget. We'll keep it direct and get you to the right next step quickly."
      />
      <ContactSection />
    </PageShell>
  );
};

export default Contact;
