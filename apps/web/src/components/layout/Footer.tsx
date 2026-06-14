import Link from "next/link";
import { ArrowRight, Feather } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const productLinks = [
  { label: "Schools - Eval AI", href: "#features" },
  { label: "Teachers - Eval App", href: "#how-it-works" },
  { label: "Developers - API", href: "/pricing" },
];

const resourceLinks = [
  { label: "Documentation", href: "#" },
  { label: "Demo Playground", href: "#" },
  { label: "Admin Dashboard", href: "#" },
  { label: "Eval API Skill", href: "#" },
  { label: "Eval App Skill", href: "#" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Security", href: "#" },
];

const companyLinks = [
  { label: "Support", href: "mailto:support@evalai.in" },
  { label: "FAQ", href: "#" },
];

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-white to-primary-50/50 pt-20 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Floating White Card */}
        <div className="relative overflow-hidden rounded-[2rem] bg-white p-12 shadow-xl ring-1 ring-neutral-200 lg:p-16">
          
          {/* Giant watermark */}
          <div className="pointer-events-none absolute -bottom-16 -left-16 flex items-center opacity-[0.03] grayscale">
            <Feather className="h-64 w-64 text-neutral-900" />
            <span className="text-[12rem] font-bold tracking-tighter text-neutral-900">
              EvalAI
            </span>
          </div>

          <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-12">
            
            {/* Left side: CTA */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              <div>
                <h3 className="mb-4 text-3xl font-medium tracking-tight text-[#222222]">
                  When Teachers Need a Break,
                  <br />
                  <span className="text-primary-600">Eval AI Steps In!</span>
                </h3>
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-primary-600"
                >
                  Try Now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right side: Links */}
            <div className="lg:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {/* Column 1 */}
              <div>
                <h4 className="mb-4 text-sm font-bold text-[#222222]">Products</h4>
                <ul className="space-y-3">
                  {productLinks.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href as any} className="text-sm text-neutral-500 hover:text-primary-600">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2 */}
              <div>
                <h4 className="mb-4 text-sm font-bold text-[#222222]">Resources</h4>
                <ul className="space-y-3">
                  {resourceLinks.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href as any} className="text-sm text-neutral-500 hover:text-primary-600">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3 */}
              <div>
                <h4 className="mb-4 text-sm font-bold text-[#222222]">Legal / Security</h4>
                <ul className="space-y-3">
                  {legalLinks.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href as any} className="text-sm text-neutral-500 hover:text-primary-600">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 4 */}
              <div className="flex flex-col justify-between">
                <div>
                  <h4 className="mb-4 text-sm font-bold text-[#222222]">Company</h4>
                  <ul className="space-y-3">
                    {companyLinks.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href as any} className="text-sm text-neutral-500 hover:text-primary-600">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Social icons */}
                <div className="mt-8 flex gap-4">
                  <a href="#" className="text-neutral-900 transition-colors hover:text-primary-600">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="#" className="text-neutral-900 transition-colors hover:text-primary-600">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                    </svg>
                  </a>
                  <a href="#" className="text-neutral-900 transition-colors hover:text-primary-600">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-500">
            Copyright © {new Date().getFullYear()} {APP_NAME} Inc. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
