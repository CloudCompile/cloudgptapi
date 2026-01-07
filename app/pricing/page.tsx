'use client';

import { useState } from 'react';
import { Check, Zap, Shield, Rocket, HelpCircle, Loader2 } from 'lucide-react';
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
    stripePriceId: 'price_1Sn4OQRG5zp0rTvz6kS6Z7S9', // Standard price ID prefix
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
    stripePriceId: 'price_1Sn4OQRG5zp0rTvz6kS6Z7S9', // Standard Pro price ID
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Choose the plan that's right for your project. All plans include access to our unified API gateway.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={cn(
                  "relative flex flex-col p-8 rounded-3xl border transition-all duration-300",
                  plan.highlight 
                    ? "bg-white dark:bg-slate-900 border-primary shadow-2xl shadow-primary/10 scale-105 z-10" 
                    : "bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-slate-500">{plan.period}</span>}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5 h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.name === 'Free' ? (
                  <Link
                    href={plan.buttonHref}
                    className={cn(
                      "w-full py-4 px-6 rounded-xl font-bold text-center transition-all",
                      "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    {plan.buttonText}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={loading !== null}
                    className={cn(
                      "w-full py-4 px-6 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-2",
                      plan.highlight
                        ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700",
                      loading === plan.name && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {loading === plan.name && <Loader2 className="h-4 w-4 animate-spin" />}
                    {plan.buttonText}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ or Info Section */}
      <section className="py-24 bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600 dark:text-slate-400">Everything you need to know about our plans.</p>
          </div>

          <div className="grid gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                What are "Advanced Models"?
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Advanced models include state-of-the-art reasoning models like GPT-4.5, Claude 3.5 Sonnet, Gemini 2.5 Pro, and specialized models for coding, thinking, and creative tasks.
              </p>
            </div>
            
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                How does the rate limiting work?
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Rate limits are applied per API key. Free users are limited to 60 requests per minute (RPM), while Pro users enjoy up to 500 RPM. Enterprise customers can request custom limits.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-purple-500" />
                Can I cancel my subscription?
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Yes, you can cancel your subscription at any time from your dashboard. Your Pro features will remain active until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
