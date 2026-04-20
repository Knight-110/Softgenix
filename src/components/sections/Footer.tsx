import logo from "@/assets/softgenix-logo.jpeg";
import { openWhatsApp } from "@/lib/whatsapp";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="relative pt-20 pb-10 border-t border-border/60">
      <div className="container">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="h-11 w-11 rounded-xl overflow-hidden ring-1 ring-primary/30 shadow-glow">
                <img src={logo} alt="Softgenix Infotech" className="h-full w-full object-cover" />
              </span>
              <div>
                <div className="font-display font-semibold tracking-wider">SOFTGENIX</div>
                <div className="text-[10px] tracking-[0.3em] text-muted-foreground">INFOTECH</div>
              </div>
            </div>
            <p className="mt-6 text-muted-foreground max-w-sm leading-relaxed">
              A multidisciplinary technology and growth studio building cinematic digital products
              for ambitious brands.
            </p>
            <button
              onClick={() => openWhatsApp("Hi Softgenix, I have a quick question.")}
              className="mt-6 inline-flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
              We're online — chat with us
            </button>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Studio</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
              <li><a href="#process" className="hover:text-primary transition-colors">Process</a></li>
              <li><a href="#work" className="hover:text-primary transition-colors">Work</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Services</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#services" className="hover:text-primary transition-colors">Web</a></li>
              <li><a href="#services" className="hover:text-primary transition-colors">Mobile</a></li>
              <li><a href="#services" className="hover:text-primary transition-colors">AI Chatbots</a></li>
              <li><a href="#services" className="hover:text-primary transition-colors">Marketing</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Get in touch</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li className="text-muted-foreground">hello@softgenix.tech</li>
              <li className="text-muted-foreground">Remote-first · Global</li>
              <li>
                <button
                  onClick={() => openWhatsApp("Hi Softgenix!")}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  WhatsApp us →
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="hairline mt-16" />
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {year} Softgenix Infotech. All rights reserved.</div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <span>Crafted with cinematic intent.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
