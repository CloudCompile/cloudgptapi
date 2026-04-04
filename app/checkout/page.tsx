'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, Tag, X, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const plans = [
  {
    name: 'Pro',
    price: '10',
    period: '/month',
    description: 'For professional developers and growing applications.',
    features: [
      'Access to ALL Flagship models',
      'Claude Sonnet, Gemini 3.1, GPT-4o',
      'DeepSeek V3.1, Kimi K2, MiniMax',
      'High-res image generation (Flux)',
      'Video generation',
      '10 requests per minute',
      '1000 requests per day',
      'Priority email support',
    ],
    stripePriceId: 'price_1TH5jYQvLgyqzP00y0P6OYDO',
  },
  {
    name: 'Ultra',
    price: '20',
    period: '/month',
    description: 'For power users who need higher limits and premium models.',
    features: [
      'Everything in Pro',
      'Claude Opus (4.5 & 4.6)',
      'DALL-E 3, GPT Image 1 & 1.5',
      'Veo 3.1 Video generation',
      'Higher rate limits',
      '2500 requests per day',
      'Priority processing',
      'Early access to new models',
    ],
    stripePriceId: 'price_1TH5l0QvLgyqzP00K7uLVmS4',
  },
];

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam = searchParams.get('plan');
  
  const [selectedPlan, setSelectedPlan] = useState<string>(planParam || 'pro');
  const [loading, setLoading] = useState(false);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<{ amount: number; type: string } | null>(null);
  const [appliedPromoCode, setAppliedPromoCode] = useState('');

  const currentPlan = plans.find(p => p.name.toLowerCase() === selectedPlan.toLowerCase()) || plans[0];
  const originalPrice = parseFloat(currentPlan.price);
  const discount = promoDiscount ? 
    (promoDiscount.type === 'percent' 
      ? originalPrice * (promoDiscount.amount / 100)
      : promoDiscount.amount) 
    : 0;
  const finalPrice = Math.max(0, originalPrice - discount).toFixed(2);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = await res.json();
      
      if (data.valid) {
        setPromoDiscount(data.discount);
        setAppliedPromoCode(promoCode.toUpperCase());
      } else {
        setPromoError(data.error || 'Invalid promo code');
      }
    } catch (err) {
      setPromoError('Failed to validate promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const clearPromoCode = () => {
    setPromoCode('');
    setPromoDiscount(null);
    setPromoError('');
    setAppliedPromoCode('');
  };

  const handleCheckout = async () => {
    if (!currentPlan.stripePriceId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId: currentPlan.stripePriceId,
          promoCode: appliedPromoCode || undefined 
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        setPromoError(data.error);
        setPromoDiscount(null);
        setAppliedPromoCode('');
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <Link href="/pricing" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to pricing
        </Link>

        <h1 className="text-3xl font-black mb-8">Checkout</h1>

        {/* Plan Selection */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Select Plan</h2>
          <div className="flex gap-4">
            {plans.map((plan) => (
              <button
                key={plan.name}
                onClick={() => setSelectedPlan(plan.name.toLowerCase())}
                className={cn(
                  "flex-1 p-4 rounded-xl border-2 transition-all text-left",
                  selectedPlan === plan.name.toLowerCase()
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">{plan.name}</span>
                  {selectedPlan === plan.name.toLowerCase() && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                <span className="text-2xl font-black">${plan.price}</span>
                <span className="text-xs text-slate-500">/month</span>
              </button>
            ))}
          </div>
        </div>

        {/* Promo Code */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Promo Code</h2>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <Tag className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
              {promoDiscount && (
                <button onClick={clearPromoCode}>
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>
            <button
              onClick={handleApplyPromoCode}
              disabled={promoLoading || !promoCode.trim() || !!promoDiscount}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50"
            >
              {promoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
            </button>
          </div>
          {promoError && (
            <p className="text-xs text-red-500 mt-2">{promoError}</p>
          )}
          {promoDiscount && (
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
              <Check className="h-3 w-3" />
              {promoDiscount.type === 'percent' 
                ? `${promoDiscount.amount}% discount applied!`
                : `$${promoDiscount.amount} discount applied!`}
            </p>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">{currentPlan.name} Plan</span>
              <span className="font-medium">${originalPrice}/month</span>
            </div>
            {promoDiscount && (
              <div className="flex justify-between text-emerald-500">
                <span>Promo Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
              <span className="font-bold">Total</span>
              <span className="text-2xl font-black">${finalPrice}/month</span>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          ) : (
            `Subscribe for $${finalPrice}/month`
          )}
        </button>

        <p className="text-center text-xs text-slate-500 mt-4">
          Secure payment powered by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-12 px-4 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CheckoutContent />
    </Suspense>
  );
}