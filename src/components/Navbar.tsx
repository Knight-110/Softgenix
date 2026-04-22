import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/softgenix-logo.jpeg";
import WhatsAppModal from "@/components/WhatsAppModal";

const links = [
  { id: "services", label: "Services" },
  { id: "about", label: "About" },
  { id: "process", label: "Process" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleOpenWhatsAppModal = () => {
    setOpen(false);
    setIsWhatsAppModalOpen(true);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="container">
        <nav
          className={`flex items-center justify-between gap-6 px-4 md:px-6 py-3 rounded-2xl transition-all duration-500 ${
            scrolled ? "glass-strong shadow-card" : "bg-transparent"
          }`}
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 group"
            aria-label="Softgenix Infotech home"
          >
            <span className="relative h-10 w-10 rounded-xl overflow-hidden ring-1 ring-primary/30 shadow-glow">
              <img src={logo} alt="Softgenix Infotech logo" className="h-full w-full object-cover" />
            </span>
            <span className="hidden sm:flex flex-col leading-none">
              <span className="font-display text-base font-semibold tracking-wider text-foreground">
                SOFTGENIX
              </span>
              <span className="text-[10px] tracking-[0.3em] text-muted-foreground">INFOTECH</span>
            </span>
          </button>

          <ul className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => handleNav(l.id)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {l.label}
                  <span className="absolute left-4 right-4 -bottom-0.5 h-px bg-gradient-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Button
              variant="hero"
              size="sm"
              onClick={handleOpenWhatsAppModal}
              className="hidden sm:inline-flex"
            >
              LET'S TALK
            </Button>
            <button
              className="md:hidden h-10 w-10 grid place-items-center rounded-xl glass"
              aria-label="Toggle menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-3 w-5">
                <span
                  className={`absolute inset-x-0 top-0 h-px bg-foreground transition-transform ${
                    open ? "translate-y-1.5 rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute inset-x-0 bottom-0 h-px bg-foreground transition-transform ${
                    open ? "-translate-y-1.5 -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-500 ${
            open ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="glass-strong rounded-2xl p-2 flex flex-col">
            {links.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => handleNav(l.id)}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-foreground/5 text-foreground"
                >
                  {l.label}
                </button>
              </li>
            ))}
            <li className="p-2">
              <Button
                variant="hero"
                className="w-full"
                onClick={handleOpenWhatsAppModal}
              >
                Chat on WhatsApp
              </Button>
            </li>
          </ul>
        </div>
      </div>
      <WhatsAppModal open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen} />
    </header>
  );
};

export default Navbar;
