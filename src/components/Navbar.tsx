import { useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import GooeyNav from "@/components/GooeyNav";
import { Button } from "@/components/ui/button";
import logo from "@/assets/softgenic-logo-removebg-preview.png";

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

const letsTalkVideoSrc = "/lets-talk/watermarked_preview.mp4";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const letsTalkDesktopVideoRef = useRef<HTMLVideoElement>(null);
  const letsTalkMobileVideoRef = useRef<HTMLVideoElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/lets-talk") {
    return null;
  }

  const activeIndex = Math.max(
    0,
    gooeyItems.findIndex((item) =>
      item.href === "/"
        ? location.pathname === "/"
        : location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
    )
  );

  const handleOpenContact = () => {
    setOpen(false);
    navigate("/lets-talk");
  };

  const playLetsTalkVideo = (video: HTMLVideoElement | null) => {
    if (!video) return;
    video.currentTime = 0;
    void video.play();
  };

  const stopLetsTalkVideo = (video: HTMLVideoElement | null) => {
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="container">
        <nav className="flex items-center justify-between gap-6 px-4 py-3 md:px-6">
          <Link
            to="/"
            className="group flex items-center transition-all duration-500 ease-out hover:-translate-y-px hover:opacity-95"
            aria-label="Softgenix Infotech home"
            onClick={() => setOpen(false)}
          >
            <span
              className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14"
              aria-hidden="true"
              style={{
                backgroundColor: "#f5f5f5",
                WebkitMaskImage: `url(${logo})`,
                maskImage: `url(${logo})`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
            >
              <span className="sr-only">Softgenix Infotech logo</span>
            </span>

            <span className="hidden translate-y-[0.5px] flex-col justify-center leading-[0.93] antialiased sm:flex">
              <span
                className="font-display text-[1.02rem] font-semibold tracking-[0.09em] text-[#f5f5f5]"
                style={{ textRendering: "geometricPrecision" }}
              >
                SOFTGENIX
              </span>
              <span
                className="mt-[0.34rem] text-[6.9px] tracking-[0.5em] text-white/60"
                style={{ textRendering: "geometricPrecision" }}
              >
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
              onMouseEnter={() => playLetsTalkVideo(letsTalkDesktopVideoRef.current)}
              onMouseLeave={() => stopLetsTalkVideo(letsTalkDesktopVideoRef.current)}
              className="group relative hidden h-12 overflow-hidden rounded-full border border-white/14 bg-[linear-gradient(166deg,rgba(28,34,42,0.56)_0%,rgba(10,13,18,0.96)_62%,rgba(5,7,10,0.99)_100%)] px-3.5 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-white/84 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-11px_18px_rgba(0,0,0,0.42),0_10px_18px_-14px_rgba(0,0,0,0.9)] transition-all duration-500 ease-out hover:-translate-y-[1px] hover:border-white/24 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-11px_18px_rgba(0,0,0,0.46),0_14px_22px_-14px_rgba(0,0,0,0.95)] active:translate-y-0 active:scale-[0.985] sm:inline-flex"
            >
              <span
                className="pointer-events-none absolute inset-[1px] overflow-hidden rounded-full"
                aria-hidden="true"
              >
                <video
                  ref={letsTalkDesktopVideoRef}
                  className="h-full w-full scale-[1.32] object-cover brightness-[0.68] contrast-[1.34] saturate-[1.2] transition-[filter,transform] duration-700 ease-out group-hover:brightness-[0.82] group-hover:contrast-[1.42] group-hover:saturate-[1.3] group-hover:scale-[1.38]"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                >
                  <source src={letsTalkVideoSrc} type="video/mp4" />
                </video>
                <span
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(102deg,transparent_22%,rgba(138,224,255,0.3)_48%,transparent_74%)] opacity-45 mix-blend-screen transition-opacity duration-500 group-hover:opacity-72"
                  aria-hidden="true"
                />
                <span
                  className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_-10px_18px_rgba(0,0,0,0.52),inset_0_12px_20px_rgba(0,0,0,0.24)]"
                  aria-hidden="true"
                />
              </span>
              <span className="relative z-[1] transition-colors duration-300 group-hover:text-white">
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
                className="group relative h-12 w-full overflow-hidden rounded-full border border-white/14 bg-[linear-gradient(166deg,rgba(28,34,42,0.56)_0%,rgba(10,13,18,0.96)_62%,rgba(5,7,10,0.99)_100%)] px-3.5 py-1 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-white/84 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-11px_18px_rgba(0,0,0,0.42),0_10px_18px_-14px_rgba(0,0,0,0.9)] transition-all duration-500 ease-out hover:-translate-y-[1px] hover:border-white/24 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-11px_18px_rgba(0,0,0,0.46),0_14px_22px_-14px_rgba(0,0,0,0.95)] active:translate-y-0 active:scale-[0.985]"
                onClick={handleOpenContact}
                onMouseEnter={() => playLetsTalkVideo(letsTalkMobileVideoRef.current)}
                onMouseLeave={() => stopLetsTalkVideo(letsTalkMobileVideoRef.current)}
              >
                <span
                  className="pointer-events-none absolute inset-[1px] overflow-hidden rounded-full"
                  aria-hidden="true"
                >
                  <video
                    ref={letsTalkMobileVideoRef}
                    className="h-full w-full scale-[1.32] object-cover brightness-[0.68] contrast-[1.34] saturate-[1.2] transition-[filter,transform] duration-700 ease-out group-hover:brightness-[0.82] group-hover:contrast-[1.42] group-hover:saturate-[1.3] group-hover:scale-[1.38]"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-hidden="true"
                  >
                    <source src={letsTalkVideoSrc} type="video/mp4" />
                  </video>
                  <span
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(102deg,transparent_22%,rgba(138,224,255,0.3)_48%,transparent_74%)] opacity-45 mix-blend-screen transition-opacity duration-500 group-hover:opacity-72"
                    aria-hidden="true"
                  />
                  <span
                    className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_-10px_18px_rgba(0,0,0,0.52),inset_0_12px_20px_rgba(0,0,0,0.24)]"
                    aria-hidden="true"
                  />
                </span>
                <span className="relative z-[1] transition-colors duration-300 group-hover:text-white">
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
