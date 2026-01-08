'use client';

import { useState } from 'react';
import { Check, Zap, Shield, Rocket, Loader2, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for exploring our API and personal projects.',
    features: [
      'Access to standard chat models',
      'Standard image generation',
      '60 requests per minute',
      'Basic community support',
      '1,000 requests per month',
    ],
    buttonText: 'Get Started',
    buttonHref: '/dashboard',
    highlight: false,
  },
  {
    name: 'Developer',
    price: '$0',
    description: 'For hobbyists and early stage developers.',
    features: [
      'Increased rate limits',
      'Access to dev-tier models',
      'Standard image generation',
      'Priority community support',
    ],
    buttonText: 'Get Dev Access',
    buttonHref: '#',
    highlight: false,
    stripeProductId: 'prod_TkaCL0ZNJH6rwf',
    stripePriceId: 'price_1Sn51wRG5zp0rTvz8SeF3WXh', // Developer price ID
  },
  {
    name: 'Video Pro',
    price: '$5',
    period: '/month',
    description: 'Unlock high-quality AI video generation.',
    features: [
      'Access to ALL Video models',
      'Google Veo, Seedance Pro',
      'Up to 10s video duration',
      'High-priority generation',
      'Commercial usage rights',
    ],
    buttonText: 'Get Video Pro',
    buttonHref: '#',
    highlight: false,
    stripeProductId: 'prod_video_pro',
    stripePriceId: 'price_1SnLTHRG5zp0rTvzT7KuRE8v',
  },
  {
    name: 'Pro',
    price: '$1',
    period: '/month',
    description: 'For professional developers and growing applications.',
    features: [
      'Access to ALL Flagship models',
      'GPT-4.5, Claude 3.5, Gemini 2.5 Pro',
      'Reasoning & Specialized models',
      'High-res image & Video generation',
      '500 requests per minute',
      'Priority email support',
    ],
    buttonText: 'Upgrade to Pro',
    buttonHref: '#',
    highlight: true,
    stripeProductId: 'prod_TkaB1ApHkafWT1',
    stripePriceId: 'price_1Sn50iRG5zp0rTvzA3lI8SE2', // Pro price ID
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Scalable solutions for large teams and high-volume needs.',
    features: [
      'Everything in Pro',
      'Custom rate limits',
      'Dedicated support engineer',
      'SLA guarantees',
      'On-premise deployment options',
      'Custom model fine-tuning',
    ],
    buttonText: 'Contact Sales',
    buttonHref: 'mailto:enterprise@cloudgpt.com',
    highlight: false,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: typeof plans[0]) => {
    if (plan.name === 'Free') return;
    if (plan.name === 'Enterprise') {
      window.location.href = plan.buttonHref;
      return;
    }

    try {
      setLoading(plan.name);
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: (plan as any).stripePriceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      console.error('Error upgrading:', error);
      alert(error.message || 'Failed to start checkout. Please try again or contact support.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-30 pointer-events-none" />
      <div className="absolute inset-0 dot-grid opacity-[0.03] pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative z-10">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Scalable Pricing</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Professional power,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-emerald-500">predictable costs.</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Simple, transparent plans designed for developers and teams. No hidden fees, just unified AI power.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-32 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            {plans.filter(p => p.name === 'Free' || p.name === 'Pro' || p.name === 'Enterprise').map((plan, i) => (
              <div 
                key={plan.name}
                className={cn(
                  "group relative flex flex-col p-10 rounded-[2.5rem] border-2 transition-all duration-500 animate-in fade-in zoom-in-95",
                  plan.highlight 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-2xl shadow-primary/20 scale-105 z-20" 
                    : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-border hover:border-primary/30 z-10",
                  i === 0 && "delay-300",
                  i === 1 && "delay-400",
                  i === 2 && "delay-500"
                )}
              >
                <div className="absolute inset-0 dot-grid opacity-0 group-hover:opacity-10 transition-opacity rounded-[2.5rem]" />
                
                {plan.highlight && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-primary to-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-xl">
                    Most Popular
                  </div>
                )}
                
                <div className="relative z-10 mb-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black tracking-tight uppercase">{plan.name}</h3>
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center",
                      plan.highlight ? "bg-white/10 dark:bg-slate-900/5" : "bg-primary/10"
                    )}>
                      {plan.name === 'Free' ? <Rocket className="h-6 w-6 text-primary" /> : 
                       plan.name === 'Pro' ? <Zap className="h-6 w-6 text-primary" /> : 
                       <Shield className="h-6 w-6 text-primary" />}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                    {plan.period && <span className="text-sm font-bold opacity-60 uppercase tracking-widest">{plan.period}</span>}
                  </div>
                  <p className="text-sm font-medium opacity-70 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="relative z-10 space-y-5 mb-12 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-4 text-sm font-bold">
                      <div className={cn(
                        "mt-1 h-5 w-5 rounded-lg flex items-center justify-center shrink-0",
                        plan.highlight ? "bg-white/20 dark:bg-slate-900/10" : "bg-emerald-500/10"
                      )}>
                        <Check className={cn("h-3 w-3", plan.highlight ? "text-white dark:text-slate-900" : "text-emerald-500")} />
                      </div>
                      <span className="opacity-80">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="relative z-10">
                  {plan.name === 'Free' ? (
                    <Link
                      href={plan.buttonHref}
                      className="flex items-center justify-center w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      {plan.buttonText}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={loading !== null}
                      className={cn(
                        "flex items-center justify-center w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl",
                        plan.highlight
                          ? "bg-primary text-white hover:scale-[1.02] active:scale-[0.98] shadow-primary/20"
                          : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] active:scale-[0.98]",
                        loading === plan.name && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      {loading === plan.name ? <Loader2 className="h-5 w-5 animate-spin" /> : plan.buttonText}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer and Video Plans Section */}
      <section className="py-32 bg-slate-50/50 dark:bg-slate-900/20 border-y border-border relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-[0.02]" />
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight mb-4 uppercase">Specialized Tiers</h2>
            <p className="text-slate-500 font-medium">Focused plans for specific development needs.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[plans.find(p => p.name === 'Developer'), plans.find(p => p.name === 'Video Pro')].map((plan: any) => (
              <div key={plan.name} className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-border hover:border-primary/30 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 dot-grid opacity-0 group-hover:opacity-[0.05] transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight mb-1">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black tracking-tight">{plan.price}</span>
                        {plan.period && <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">{plan.period}</span>}
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {plan.name === 'Developer' ? <Rocket className="h-6 w-6 text-primary" /> : <Video className="h-6 w-6 text-primary" />}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-8">{plan.description}</p>
                  <button 
                    onClick={() => handleUpgrade(plan)}
                    className="w-full py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black tracking-tight mb-6 uppercase">Common Questions</h2>
            <p className="text-slate-500 font-medium text-lg">Everything you need to know about CloudGPT plans.</p>
          </div>

          <div className="grid gap-6">
            {[
              { 
                title: 'What are "Advanced Models"?', 
                content: 'Access state-of-the-art reasoning models like GPT-4.5, Claude 3.5 Sonnet, and Gemini 2.5 Pro through a single endpoint.',
                icon: <Zap className="h-5 w-5 text-amber-500" />
              },
              { 
                title: 'How does the rate limiting work?', 
                content: 'Rate limits are applied per API key. Free users start at 60 RPM, while Pro users enjoy up to 500 RPM for heavy workloads.',
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
