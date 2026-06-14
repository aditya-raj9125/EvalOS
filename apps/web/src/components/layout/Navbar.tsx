"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Feather } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "Product", href: "#product" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Blogs", href: "#blogs" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <header className="fixed top-6 left-1/2 z-50 w-[95%] max-w-5xl -translate-x-1/2 transition-all duration-300 ease-out">
        <nav
          className={cn(
            "flex h-14 items-center justify-between rounded-full bg-[#020617] px-6 shadow-2xl transition-all duration-300",
            scrolled ? "bg-[#020617]/90 backdrop-blur-md border border-white/10" : ""
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center transition-transform hover:scale-105">
            <Feather className="h-5 w-5 text-neutral-400" fill="currentColor" />
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((link, idx) => (
              <li key={link.href}>
                <Link
                  href={link.href as any}
                  className={cn(
                    "text-sm font-medium transition-colors duration-150",
                    idx === 0
                      ? "text-primary-500" // "Home" gets the teal color
                      : "text-neutral-400 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop auth buttons */}
          <div className="hidden items-center md:flex">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-primary-500 transition-colors duration-150 hover:text-primary-400"
            >
              Dashboard
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-btn"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-4 top-24 z-40 rounded-2xl border border-white/10 bg-[#020617]/95 p-4 backdrop-blur-xl md:hidden shadow-2xl"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link, idx) => (
                <Link
                  key={link.href}
                  href={link.href as any}
                  className={cn(
                    "rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5",
                    idx === 0 ? "text-primary-500" : "text-neutral-300 hover:text-white"
                  )}
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-4">
                <Link
                  href="/dashboard"
                  className="rounded-lg px-4 py-3 text-center text-sm font-medium text-primary-500 hover:bg-white/5 transition-colors"
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
