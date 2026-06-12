"use client";

import { motion } from "framer-motion";
import { Check, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const tiers = [
  {
    name: "Beta Trial",
    price: "0",
    description: "Full access to all AI features during the public beta and hackathon phase.",
    features: [
      "Up to 500 answer sheets per batch",
      "AI checking & marks annotation",
      "Custom rubrics & special guidelines",
      "Human review queue interface",
      "Public student portal access",
      "Email support",
    ],
    cta: "Start Free Trial",
    href: "/register",
    popular: true,
  },
  {
    name: "Pro Plan",
    price: "1,999",
    description: "For institutions and professional educators looking for high volume throughput.",
    features: [
      "Unlimited answer sheets & batches",
      "Priority AI queue processing",
      "Custom school/institution branding",
      "Advanced class-wise analytics",
      "Integrations with school LMS",
      "Dedicated 24/7 account manager",
    ],
    cta: "Coming Soon",
    href: "#",
    popular: false,
  },
] as const;

export default function PricingPage() {
  return (
    <div className="bg-surface-50 py-24 sm:py-32 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base font-semibold leading-7 text-primary-600 dark:text-primary-400"
          >
            Pricing
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-white"
          >
            Simple, transparent pricing during beta
          </motion.p>
        </div>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-neutral-600 dark:text-neutral-400"
        >
          EvalAI is free for everyone during our beta test. Experience the future of automated exam evaluation.
        </motion.p>

        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8">
          {tiers.map((tier, tierIdx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + tierIdx * 0.1 }}
              className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800 xl:p-10 ${
                tier.popular ? "relative shadow-elevated border-2 border-primary-600 dark:border-primary-500" : ""
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  Most Popular
                </span>
              )}
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 id={tier.name} className="text-lg font-semibold leading-8 text-neutral-900 dark:text-white">
                    {tier.name}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-neutral-600 dark:text-neutral-400">{tier.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    ₹{tier.price}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-neutral-600 dark:text-neutral-400">/month</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-primary-600 dark:text-primary-400" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                {tier.name === "Beta Trial" ? (
                  <Button asChild className="w-full btn-primary h-11 text-base">
                    <Link href={tier.href}>{tier.cta}</Link>
                  </Button>
                ) : (
                  <Button disabled variant="outline" className="w-full h-11 text-base">
                    {tier.cta}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
