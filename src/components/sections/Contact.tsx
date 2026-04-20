import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { openWhatsApp } from "@/lib/whatsapp";
import { toast } from "@/hooks/use-toast";
import { Send, Mail, MessageCircle, MapPin } from "lucide-react";

// Validation
const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(80),
  company: z.string().trim().max(100).optional().or(z.literal("")),
  service: z.string().min(1, "Pick a service"),
  budget: z.string().min(1, "Pick a budget"),
  message: z.string().trim().min(10, "Tell us a little more (10+ chars)").max(1000),
});

const services = [
  "Web Development",
  "Mobile App",
  "AI Chatbot",
  "Digital Marketing",
  "Brand & UI/UX",
  "Other",
];
const budgets = ["< $2k", "$2k – $5k", "$5k – $15k", "$15k – $50k", "$50k+"];

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    company: "",
    service: "",
    budget: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      toast({
        title: "Please complete the form",
        description: "A couple of fields need your attention.",
        variant: "destructive",
      });
      return;
    }
    setErrors({});
    const msg = `Hi Softgenix! 👋

Name: ${form.name}
Company: ${form.company || "—"}
Service: ${form.service}
Budget: ${form.budget}

${form.message}`;
    openWhatsApp(msg);
    toast({
      title: "Opening WhatsApp…",
      description: "Your message has been pre-filled. Just hit send!",
    });
  };

  return (
    <section id="contact" className="relative py-28 md:py-36">
      <div className="container grid lg:grid-cols-12 gap-12">
        {/* Left copy */}
        <div className="lg:col-span-5 reveal">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow" /> Contact
          </span>
          <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold leading-[1.05]">
            Tell us about your<br />
            <span className="text-gradient-brand">next big idea.</span>
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Fill the form and we'll open WhatsApp with your message ready to send. No backend, no
            spam — just a direct line to a human.
          </p>

          <ul className="mt-10 space-y-5">
            <li className="flex items-start gap-4">
              <span className="h-10 w-10 rounded-xl grid place-items-center glass">
                <MessageCircle className="h-4 w-4 text-primary" />
              </span>
              <div>
                <div className="text-sm font-medium">WhatsApp</div>
                <div className="text-sm text-muted-foreground">Replies within an hour, on business days.</div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="h-10 w-10 rounded-xl grid place-items-center glass">
                <Mail className="h-4 w-4 text-cyan" />
              </span>
              <div>
                <div className="text-sm font-medium">hello@softgenix.tech</div>
                <div className="text-sm text-muted-foreground">For partnerships and longer briefs.</div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="h-10 w-10 rounded-xl grid place-items-center glass">
                <MapPin className="h-4 w-4 text-violet" />
              </span>
              <div>
                <div className="text-sm font-medium">Remote-first, global delivery</div>
                <div className="text-sm text-muted-foreground">Working with founders across 12 time-zones.</div>
              </div>
            </li>
          </ul>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="lg:col-span-7 reveal glass-strong rounded-3xl p-8 md:p-10 space-y-5"
          data-delay="100"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">
                Your name
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Jane Doe"
                maxLength={80}
                className="mt-2 bg-background/40 border-border/60 h-12"
              />
              {errors.name && <p className="mt-1.5 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="company" className="text-xs uppercase tracking-wider text-muted-foreground">
                Company <span className="opacity-60">(optional)</span>
              </Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="Acme Inc."
                maxLength={100}
                className="mt-2 bg-background/40 border-border/60 h-12"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Service</Label>
              <Select value={form.service} onValueChange={(v) => update("service", v)}>
                <SelectTrigger className="mt-2 bg-background/40 border-border/60 h-12">
                  <SelectValue placeholder="Pick a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.service && <p className="mt-1.5 text-xs text-destructive">{errors.service}</p>}
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Budget</Label>
              <Select value={form.budget} onValueChange={(v) => update("budget", v)}>
                <SelectTrigger className="mt-2 bg-background/40 border-border/60 h-12">
                  <SelectValue placeholder="Estimated budget" />
                </SelectTrigger>
                <SelectContent>
                  {budgets.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.budget && <p className="mt-1.5 text-xs text-destructive">{errors.budget}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="message" className="text-xs uppercase tracking-wider text-muted-foreground">
              Project details
            </Label>
            <Textarea
              id="message"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder="What are you trying to build? What does success look like?"
              maxLength={1000}
              rows={5}
              className="mt-2 bg-background/40 border-border/60"
            />
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-destructive">{errors.message}</span>
              <span className="text-muted-foreground">{form.message.length}/1000</span>
            </div>
          </div>

          <Button type="submit" variant="hero" size="xl" className="w-full">
            Send via WhatsApp
            <Send className="h-4 w-4" />
          </Button>
          <p className="text-[11px] text-center text-muted-foreground">
            No data is stored — submitting opens WhatsApp with your message ready to send.
          </p>
        </form>
      </div>
    </section>
  );
};

export default Contact;
