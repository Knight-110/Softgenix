import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import GooeyNav from "@/components/GooeyNav";
import { Button } from "@/components/ui/button";
import logo from "@/assets/softgenix-logo.jpeg";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/process", label: "Process" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/contact", label: "Contact" },
];

const gooeyItems = links.map((link) => ({
  label: link.label,
  href: link.to,
}));

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const activeIndex = Math.max(
    0,
    gooeyItems.findIndex((item) => item.href === location.pathname)
  );

  const handleOpenContact = () => {
    setOpen(false);
    navigate("/lets-talk");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="container">
        <nav className="flex items-center justify-between gap-6 px-4 py-3 md:px-6">
          <Link
            to="/"
            className="group flex items-center gap-3"
            aria-label="Softgenix Infotech home"
            onClick={() => setOpen(false)}
          >
            <span className="relative h-10 w-10 overflow-hidden rounded-xl ring-1 ring-white/25 shadow-[0_0_28px_rgba(255,255,255,0.12)]">
              <img
                src={logo}
                alt="Softgenix Infotech logo"
                className="h-full w-full object-cover"
              />
            </span>

            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-base font-semibold tracking-wider text-white">
                SOFTGENIX
              </span>
              <span className="text-[10px] tracking-[0.3em] text-zinc-400">
                INFOTECH
              </span>
            </span>
          </Link>

          <div className="hidden items-center justify-center md:flex">
            <GooeyNav
              items={gooeyItems}
              particleCount={10}
              particleDistances={[90, 10]}
              particleR={500}
              initialActiveIndex={activeIndex}
              animationTime={600}
              timeVariance={1000}
              colors={[1]}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="glass"
              size="sm"
              onClick={handleOpenContact}
              className="hidden h-10 rounded-full border border-white/35 bg-white/[0.06] px-5 font-display text-[11px] uppercase tracking-[0.28em] text-white shadow-[0_16px_40px_-28px_rgba(255,255,255,0.55)] transition-all duration-300 hover:border-white/70 hover:bg-white/[0.12] sm:inline-flex"
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.75)]"
                aria-hidden="true"
              />
              <span>LET&apos;S TALK</span>
            </Button>

            <button
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/20 bg-white/5 md:hidden"
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
                      isActive
                        ? "bg-white text-black"
                        : "text-zinc-300 hover:bg-white/5 hover:text-white"
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
                className="w-full rounded-full border border-white/35 bg-white/[0.08] py-5 font-display text-[11px] uppercase tracking-[0.24em] text-white hover:border-white/70 hover:bg-white/[0.12]"
                onClick={handleOpenContact}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.75)]"
                  aria-hidden="true"
                />
                <span>LET&apos;S TALK</span>
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;