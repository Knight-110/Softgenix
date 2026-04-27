import { Link } from "react-router-dom";
import logo from "@/assets/softgenix-logo.jpeg";
import { openWhatsApp } from "@/lib/whatsapp";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/70 pt-20 pb-10">
      <div className="container">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="h-11 w-11 overflow-hidden rounded-xl ring-1 ring-white/30 shadow-glow">
                <img src={logo} alt="Softgenix Infotech" className="h-full w-full object-cover" />
              </span>
              <div>
                <div className="font-display font-semibold tracking-wider">SOFTGENIX</div>
                <div className="text-[10px] tracking-[0.3em] text-muted-foreground">INFOTECH</div>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-secondary-foreground leading-relaxed">
              A multidisciplinary technology and growth studio building cinematic digital products
              for ambitious brands.
            </p>
            <button
              onClick={() => openWhatsApp("Hi Softgenix, I have a quick question.")}
              className="mt-6 inline-flex items-center gap-2 text-sm text-foreground transition-colors hover:text-foreground/80"
            >
              <span className="h-2 w-2 rounded-full bg-foreground animate-pulse-glow" />
              We are online, chat with us
            </button>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Studio</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="transition-colors hover:text-foreground/80">
                  About
                </Link>
              </li>
              <li>
                <Link to="/process" className="transition-colors hover:text-foreground/80">
                  Process
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="transition-colors hover:text-foreground/80">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-foreground/80">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Services</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/services" className="transition-colors hover:text-foreground/80">
                  Web
                </Link>
              </li>
              <li>
                <Link to="/services" className="transition-colors hover:text-foreground/80">
                  Mobile
                </Link>
              </li>
              <li>
                <Link to="/services" className="transition-colors hover:text-foreground/80">
                  AI Chatbots
                </Link>
              </li>
              <li>
                <Link to="/services" className="transition-colors hover:text-foreground/80">
                  Marketing
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Get in touch</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li className="text-secondary-foreground">hello@softgenix.tech</li>
              <li className="text-secondary-foreground">Remote-first, global</li>
              <li>
                <button
                  onClick={() => openWhatsApp("Hi Softgenix!")}
                  className="text-foreground transition-colors hover:text-foreground/80"
                >
                  WhatsApp us {"->"}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="hairline mt-16" />
        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground md:flex-row">
          <div>(c) {year} Softgenix Infotech. All rights reserved.</div>
          <div className="flex items-center gap-5">
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Terms
            </a>
            <span>Crafted with cinematic intent.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
