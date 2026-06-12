import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/providers";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — AI-Powered Exam Evaluation`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Upload bulk answer sheets. AI checks, annotates, and delivers results — just like manual grading, in minutes.",
  keywords: ["exam evaluation", "AI grading", "answer sheets", "CBSE", "IIT-JEE", "education"],
  authors: [{ name: "EvalAI Team" }],
  openGraph: {
    title: `${APP_NAME} — AI-Powered Exam Evaluation`,
    description: "Upload bulk answer sheets. AI evaluates them instantly.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#030712" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("dark font-sans", inter.variable)} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
