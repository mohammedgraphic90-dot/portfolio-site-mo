"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Code2, Lock } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Services", href: "/services" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {}

    const forceTop = sessionStorage.getItem("__force_scroll_top__");
    if (forceTop) {
      sessionStorage.removeItem("__force_scroll_top__");
      setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }), 0);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  function scrollToTopSmooth() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reloadPageToTop() {
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {}

    sessionStorage.setItem("__force_scroll_top__", "1");
    window.location.reload();
  }

  function handleSamePageAction(href: string) {
    if (href === "/") {
      scrollToTopSmooth();
      return;
    }
    reloadPageToTop();
  }

  function handleLogoClick(e: React.MouseEvent) {
    if (pathname === "/") {
      e.preventDefault();
      scrollToTopSmooth();
    }
  }

  function handleStartProjectClick(e: React.MouseEvent) {
    if (pathname === "/start-project") {
      e.preventDefault();
      reloadPageToTop();
    }
  }

  function handleNavClick(href: string) {
    if (href === pathname) {
      handleSamePageAction(href);
      return;
    }
    router.push(href);
  }

  return (
    <nav
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-slate-900/80 backdrop-blur-lg border-b border-white/10 shadow-lg py-3"
          : "bg-transparent py-5",
      ].join(" ")}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-teal-400 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
            <Code2 className="text-white w-6 h-6" />
          </div>

          <span className="text-xl font-bold text-white tracking-wide">
            Mohammed <span className="text-teal-400">Ayman</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={(e) => {
                if (link.href === pathname) {
                  e.preventDefault();
                  handleSamePageAction(link.href);
                }
              }}
              className="relative text-slate-300 hover:text-white transition-colors duration-300 font-medium text-sm lg:text-base group"
            >
              {link.name}
              <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-teal-400 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}

          <Link
            href="/login"
            onClick={(e) => {
              if (pathname === "/login") {
                e.preventDefault();
                reloadPageToTop();
              }
            }}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Dashboard"
            aria-label="dashboard login"
          >
            <Lock size={18} />
          </Link>

          <Link
            href="/start-project"
            onClick={handleStartProjectClick}
            className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(109,40,217,0.5)] hover:shadow-[0_0_25px_rgba(109,40,217,0.7)]"
          >
            Start a project
          </Link>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <div
        className={[
          "md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/10 overflow-hidden transition-[max-height,opacity] duration-300",
          isOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="flex flex-col items-center gap-6 py-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                setIsOpen(false);
                handleNavClick(link.href);
              }}
              className="text-lg text-slate-200 hover:text-teal-400 font-medium"
            >
              {link.name}
            </button>
          ))}

          <button
            onClick={() => {
              setIsOpen(false);
              if (pathname === "/login") {
                reloadPageToTop();
                return;
              }
              router.push("/login");
            }}
            className="flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <Lock size={16} />
            <span>Owner login</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              handleNavClick("/start-project");
            }}
            className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-all"
          >
            Start a project
          </button>
        </div>
      </div>
    </nav>
  );
}
