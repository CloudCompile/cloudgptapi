'use client';

import { Check, Zap, Shield, Rocket, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';

const plans = [
  {
    name: 'Free',
    price: '€0',
    description: 'Perfect for exploring our API and personal projects.',
    features: [
      'Access to standard chat models',
      'Standard image generation',
      '5 requests per minute',
      'Basic community support',
      '100 requests per day',
    ],
    buttonText: 'Get Started',
    buttonHref: '/dashboard',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '€5',
    period: '/month',
    description: 'For professional developers and growing applications.',
    features: [
      'Access to ALL Flagship models',
      'GPT-5.4, Claude 4.6, Gemini 3 Pro',
      'Reasoning & Specialized models',
      'High-res image generation',
      '10 requests per minute',
      '1000 requests per day',
      'Priority email support',
    ],
    buttonText: 'Upgrade to Pro',
    buttonHref: '#',
    highlight: true,
    stripeProductId: 'prod_UFav3WC8TduOAB',
    stripePriceId: 'price_1TH5jYQvLgyqzP00y0P6OYDO',
  },
  {
    name: 'Ultra',
    price: '€10',
    period: '/month',
    description: 'For power users who need higher limits.',
    features: [
      'Everything in Pro',
      'Higher rate limits',
      '2500 requests per day',
      'Priority processing',
      'Early access to new models',
    ],
    buttonText: 'Upgrade to Ultra',
    buttonHref: '#',
    highlight: false,
    stripeProductId: 'prod_UFawzHE1IUU1Rb',
    stripePriceId: 'price_1TH5l0QvLgyqzP00K7uLVmS4',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Scalable solutions for large teams and high-volume needs.',
    features: [
      'Everything in Ultra',
      'Custom rate limits',
      'Dedicated support engineer',
      'SLA guarantees',
      'On-premise deployment options',
      'Custom model fine-tuning',
    ],
    buttonText: 'Contact Sales',
    buttonHref: 'https://discord.gg/f7xR8qga',
    highlight: false,
  },
];

export default function PricingPage() {
  const inviteOnlyLabel = 'Invite Only';
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (stripePriceId: string, planName: string) => {
    if (!stripePriceId) return;
    setLoadingPlan(planName);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: stripePriceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-40 pointer-events-none" />
      <div className="absolute inset-0 dot-grid opacity-[0.03] pointer-events-none" />
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 h-[28rem] w-[28rem] rounded-full bg-white/50 dark:bg-white/10 blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-20 sm:pt-32 pb-12 sm:pb-20 px-4 relative z-10">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary">Scalable Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-6 sm:mb-8 tracking-tighter leading-tight sm:leading-none animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Professional power,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-emerald-500">predictable costs.</span>
          </h1>
          <p className="text-base sm:text-xl text-slate-500 dark:text-slate-400 mb-8 sm:mb-10 max-w-2xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Simple, transparent plans designed for developers and teams. No hidden fees, just unified AI power.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 sm:pb-32 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {plans.filter(p => p.name === 'Free' || p.name === 'Pro' || p.name === 'Ultra' || p.name === 'Enterprise').map((plan, i) => (
              <div
                key={plan.name}
                className={cn(
                  "group relative flex flex-col p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] border-2 transition-all duration-500 animate-in fade-in zoom-in-95",
                  plan.highlight
                    ? "bg-white/30 dark:bg-white/10 text-slate-900 dark:text-white border-white/40 shadow-2xl shadow-primary/20 lg:scale-105 z-20 backdrop-blur-2xl"
                    : "bg-white/45 dark:bg-slate-900/40 backdrop-blur-2xl border-white/50 dark:border-white/10 hover:border-primary/30 z-10",
                  i === 0 && "delay-300",
                  i === 1 && "delay-400",
                  i === 2 && "delay-500"
                )}
              >
                <div className="absolute inset-0 dot-grid opacity-0 group-hover:opacity-10 transition-opacity rounded-3xl sm:rounded-[2.5rem]" />

                {plan.highlight && (
                  <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-primary to-blue-600 text-white text-[9px] sm:text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-xl whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                <div className="relative z-10 mb-8 sm:mb-10">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase">{plan.name}</h3>
                    <div className={cn(
                      "h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center",
                      plan.highlight ? "bg-white/10 dark:bg-slate-900/5" : "bg-primary/10"
                    )}>
                      {plan.name === 'Free' ? <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> :
                        plan.name === 'Pro' ? <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> :
                          <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-3 sm:mb-4">
                    <span className="text-4xl sm:text-6xl font-black tracking-tighter">{plan.price}</span>
                    {plan.period && <span className="text-xs sm:text-sm font-bold opacity-60 uppercase tracking-widest">{plan.period}</span>}
                  </div>
                  <p className="text-xs sm:text-sm font-medium opacity-70 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="relative z-10 space-y-4 sm:space-y-5 mb-8 sm:mb-12 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 sm:gap-4 text-xs sm:text-sm font-bold">
                      <div className={cn(
                        "mt-0.5 sm:mt-1 h-4 w-4 sm:h-5 sm:w-5 rounded-md sm:rounded-lg flex items-center justify-center shrink-0",
                        plan.highlight ? "bg-white/20 dark:bg-slate-900/10" : "bg-emerald-500/10"
                      )}>
                        <Check className={cn("h-2.5 w-2.5 sm:h-3 sm:w-3", plan.highlight ? "text-white dark:text-slate-900" : "text-emerald-500")} />
                      </div>
                      <span className="opacity-80">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="relative z-10">
                  {plan.name === 'Free' ? (
                    <Link
                      href={plan.buttonHref}
                      className={cn(
                        "flex items-center justify-center gap-2 w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] transition-all border",
                        "bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 border-border hover:border-primary/30"
                      )}
                    >
                      <Rocket className="h-4 w-4" />
                      {plan.buttonText}
                    </Link>
                  ) : plan.name === 'Enterprise' ? (
                    <a
                      href={plan.buttonHref}
                      className={cn(
                        "flex items-center justify-center gap-2 w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] transition-all border",
                        "bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 border-border hover:border-primary/30"
                      )}
                    >
                      <Shield className="h-4 w-4" />
                      {plan.buttonText}
                    </a>
                  ) : (
                    <button
                      onClick={() => plan.stripePriceId && handleUpgrade(plan.stripePriceId, plan.name)}
                      disabled={loadingPlan === plan.name || !plan.stripePriceId}
                      className={cn(
                        "flex items-center justify-center gap-2 w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] transition-all border",
                        plan.highlight
                          ? "bg-white/30 text-slate-900 dark:text-white border-white/60 hover:bg-white/50"
                          : "bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 border-border hover:border-primary/30",
                        loadingPlan === plan.name && "opacity-50 cursor-wait"
                      )}
                    >
                      <Zap className="h-4 w-4" />
                      {loadingPlan === plan.name ? 'Processing...' : plan.buttonText}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-32 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4 sm:mb-6 uppercase">Common Questions</h2>
            <p className="text-slate-500 font-medium text-base sm:text-lg">Everything you need to know about Vetra plans.</p>
          </div>

          <div className="grid gap-4 sm:gap-6">
            {[
              {
                title: 'What are "Advanced Models"?',
                content: 'Access state-of-the-art reasoning models like GPT-5.4, Claude 4.6, and Gemini 3 Pro through a single endpoint.',
                icon: <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              },
              {
                title: 'How does the rate limiting work?',
                content: 'Rate limits are applied per API key. Free users start at 5 RPM, while Pro users enjoy up to 10 RPM for heavy workloads.',
                icon: <Shield className="h-5 w-5 text-blue-500" />
              },
              {
                title: 'Can I cancel my subscription?',
                content: 'Yes, manage your billing directly from the dashboard. Your features remain active until the end of your billing cycle.',
                icon: <Rocket className="h-5 w-5 text-purple-500" />
              }
            ].map((faq) => (
              <div key={faq.title} className="p-8 rounded-[2rem] border-2 border-border bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:border-primary/20 transition-all group">
                <div className="flex items-start gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 border-2 border-border flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-all">
                    {faq.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight mb-3 text-slate-900 dark:text-white">{faq.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{faq.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="pb-32 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="p-12 md:p-20 rounded-[3rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-center relative overflow-hidden group">
            <div className="absolute inset-0 dot-grid opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-none">
                Ready to build the<br />future of AI?
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="px-10 py-5 rounded-2xl bg-primary text-white font-black text-[12px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20"
                >
                  Get Started for Free
                </Link>
                <Link
                  href="/docs"
                  className="px-10 py-5 rounded-2xl bg-white/10 dark:bg-slate-900/10 text-white dark:text-slate-900 font-black text-[12px] uppercase tracking-[0.2em] border border-white/20 dark:border-slate-900/20 hover:bg-white/20 dark:hover:bg-slate-900/20 transition-all"
                >
                  Read the Docs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
