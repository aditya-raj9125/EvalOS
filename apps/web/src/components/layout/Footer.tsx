import Link from "next/link";
import { Bot } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

const resourceLinks = [
  { label: "Documentation", href: "#" },
  { label: "API Reference", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Changelog", href: "#" },
];

const contactLinks = [
  { label: "Contact Support", href: "mailto:support@evalai.in" },
  { label: "Twitter / X", href: "https://twitter.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/8 bg-neutral-950">
      {/* Top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">{APP_NAME}</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500">
              AI-powered exam evaluation for teachers and institutions. Fast, fair, and accurate.
            </p>
            {/* Build badge */}
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Free during beta
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-neutral-400">Product</h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href as any}
                    className="text-sm text-neutral-500 transition-colors duration-150 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-neutral-400">Resources</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href as any}
                    className="text-sm text-neutral-500 transition-colors duration-150 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-neutral-400">Connect</h3>
            <ul className="space-y-3">
              {contactLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href as any}
                    className="text-sm text-neutral-500 transition-colors duration-150 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/8 pt-7 sm:flex-row">
          <p className="text-sm text-neutral-600">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-sm text-neutral-600">
            Built for CBSE · IIT-JEE · Universities and beyond
          </p>
        </div>
      </div>
    </footer>
  );
}
