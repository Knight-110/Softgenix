import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import GooeyNav from "@/components/GooeyNav";
import { Button } from "@/components/ui/button";
import logo from "@/assets/softgenix-logo.jpeg";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
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

  if (location.pathname === "/lets-talk") {
    return null;
  }

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
              className="group relative hidden h-10 overflow-hidden rounded-full border border-white/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(77,208,255,0.14)_48%,rgba(255,255,255,0.08))] px-1 font-display text-[11px] uppercase tracking-[0.28em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_26px_-22px_rgba(77,208,255,0.45)] transition-all duration-500 hover:-translate-y-0.5 hover:border-white/35 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_16px_34px_-20px_rgba(77,208,255,0.42)] sm:inline-flex"
            >
              <span
                className="pointer-events-none absolute inset-[1px] rounded-full bg-[linear-gradient(135deg,rgba(7,10,18,0.98),rgba(13,19,34,0.9)_42%,rgba(10,17,31,0.98))]"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none absolute inset-y-[5px] left-[-30%] w-[34%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(125,233,255,0.9),transparent)] blur-md opacity-70 transition-all duration-700 group-hover:left-[96%]"
                aria-hidden="true"
              />
              <span
                className="relative h-7 w-7 rounded-full border border-white/12 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.95),rgba(125,233,255,0.45)_38%,rgba(21,35,68,0.2)_72%,transparent_76%)] shadow-[0_0_18px_rgba(125,233,255,0.2)] transition-transform duration-500 group-hover:scale-105 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
              <span className="relative px-3 transition-transform duration-500 group-hover:translate-x-[1px]">
                LET&apos;S TALK
              </span>
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
                className="group relative w-full overflow-hidden rounded-full border border-white/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(77,208,255,0.14)_48%,rgba(255,255,255,0.08))] py-1 pl-1 pr-3 font-display text-[11px] uppercase tracking-[0.24em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_26px_-22px_rgba(77,208,255,0.45)] transition-all duration-500 hover:border-white/35 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_16px_34px_-20px_rgba(77,208,255,0.42)]"
                onClick={handleOpenContact}
              >
                <span
                  className="pointer-events-none absolute inset-[1px] rounded-full bg-[linear-gradient(135deg,rgba(7,10,18,0.98),rgba(13,19,34,0.9)_42%,rgba(10,17,31,0.98))]"
                  aria-hidden="true"
                />
                <span
                  className="pointer-events-none absolute inset-y-[7px] left-[-30%] w-[34%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(125,233,255,0.9),transparent)] blur-md opacity-70 transition-all duration-700 group-hover:left-[96%]"
                  aria-hidden="true"
                />
                <span
                  className="relative h-8 w-8 rounded-full border border-white/12 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.95),rgba(125,233,255,0.45)_38%,rgba(21,35,68,0.2)_72%,transparent_76%)] shadow-[0_0_18px_rgba(125,233,255,0.2)] transition-transform duration-500 group-hover:scale-105 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
                <span className="relative px-3 transition-transform duration-500 group-hover:translate-x-[1px]">
                  LET&apos;S TALK
                </span>
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
