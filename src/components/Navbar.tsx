import { lazy, Suspense, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/softgenix-logo.jpeg";

const WhatsAppModal = lazy(() => import("@/components/WhatsAppModal"));

const links = [
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/process", label: "Process" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/contact", label: "Contact" },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block transition-colors ${isActive ? "text-white" : "text-zinc-400 hover:text-white"}`;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [hasOpenedWhatsAppModal, setHasOpenedWhatsAppModal] = useState(false);

  const handleOpenWhatsAppModal = () => {
    setOpen(false);
    setHasOpenedWhatsAppModal(true);
    setIsWhatsAppModalOpen(true);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-md">
      <div className="container">
        <nav className="flex items-center justify-between gap-6 px-4 py-3 md:px-6">
          <Link
            to="/"
            className="flex items-center gap-3 group"
            aria-label="Softgenix Infotech home"
            onClick={() => setOpen(false)}
          >
            <span className="relative h-10 w-10 overflow-hidden rounded-xl ring-1 ring-primary/30 shadow-glow">
              <img src={logo} alt="Softgenix Infotech logo" className="h-full w-full object-cover" />
            </span>
            <span className="hidden sm:flex flex-col leading-none">
              <span className="font-display text-base font-semibold tracking-wider text-white">
                SOFTGENIX
              </span>
              <span className="text-[10px] tracking-[0.3em] text-zinc-400">INFOTECH</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className={navLinkClass}>
                  {({ isActive }) => (
                    <span className="group relative block px-4 py-2 text-sm">
                      {link.label}
                      <span
                        className={`absolute left-4 right-4 -bottom-0.5 h-px bg-white transition-opacity ${
                          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                      />
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Button
              variant="glass"
              size="sm"
              onClick={handleOpenWhatsAppModal}
              className="hidden h-10 rounded-full border border-white/24 bg-white/[0.08] px-5 font-display text-[11px] uppercase tracking-[0.28em] text-white shadow-[0_16px_40px_-28px_rgba(91,191,255,0.9)] transition-all duration-300 hover:border-white/44 hover:bg-white/[0.14] sm:inline-flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#73d7ff]" aria-hidden="true" />
              <span>LET&apos;S TALK</span>
            </Button>
            <button
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/12 bg-white/5 md:hidden"
              aria-label="Toggle menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-3 w-5">
                <span
                  className={`absolute inset-x-0 top-0 h-px bg-white transition-transform ${
                    open ? "translate-y-1.5 rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute inset-x-0 bottom-0 h-px bg-white transition-transform ${
                    open ? "-translate-y-1.5 -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>

        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-500 md:hidden ${
            open ? "mt-2 max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="flex flex-col rounded-2xl border border-white/10 bg-black p-2">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block w-full rounded-xl px-4 py-3 text-left transition-colors ${
                      isActive ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li className="p-2">
              <Button
                variant="glass"
                className="w-full rounded-full border border-white/24 bg-white/[0.08] py-5 font-display text-[11px] uppercase tracking-[0.24em] text-white hover:border-white/42 hover:bg-white/[0.12]"
                onClick={handleOpenWhatsAppModal}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#73d7ff]" aria-hidden="true" />
                <span>LET&apos;S TALK</span>
              </Button>
            </li>
          </ul>
        </div>
      </div>
      {hasOpenedWhatsAppModal ? (
        <Suspense fallback={null}>
          <WhatsAppModal open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen} />
        </Suspense>
      ) : null}
    </header>
  );
};

export default Navbar;
