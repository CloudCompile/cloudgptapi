import { Crown, Check, Zap, Building, Building2, ExternalLink, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPlansPage() {
  const plans = [
    {
      name: 'FREE',
      price: '$0',
      period: '',
      description: 'Perfect for exploring our API and personal projects.',
      icon: Zap,
      color: 'text-slate-500 text-slate-700 dark:text-slate-400',
      bg: 'bg-slate-100 dark:bg-slate-800',
      border: 'border-slate-200 dark:border-slate-800',
      features: ['Access to standard chat models', 'Standard image generation', '5 requests per minute', 'Basic community support', '100 requests per day'],
      stripeId: 'None',
      status: 'Active',
    },
    {
      name: 'PRO',
      price: '$3',
      period: '/MONTH',
      description: 'For professional developers and growing applications.',
      icon: Crown,
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      features: ['Access to ALL Flagship models', 'GPT-5.4, Claude 4.6, Gemini 3 Pro', 'Reasoning & Specialized models', 'High-res image & Video generation', '10 requests per minute', '500 requests per day', 'Priority email support'],
      stripeId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_1Sn50iRG5zp0rTvzA3lI8SE2',
      status: 'Active',
    },
    {
      name: 'ENTERPRISE',
      price: 'Custom',
      period: '',
      description: 'Scalable solutions for large teams and high-volume needs.',
      icon: Building2,
      color: 'text-purple-500 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800/50',
      features: ['Everything in Pro', 'Custom rate limits', 'Dedicated support engineer', 'SLA guarantees', 'On-premise deployment options', 'Custom model fine-tuning'],
      stripeId: 'Contact Sales',
      status: 'Active',
    },
    {
      name: 'DEVELOPER',
      price: '$0',
      period: '',
      description: 'For hobbyists and early stage developers.',
      icon: Building,
      color: 'text-blue-500 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800/50',
      features: ['Invite Only', 'Access to early-stage features'],
      stripeId: process.env.NEXT_PUBLIC_STRIPE_DEV_PRICE_ID || 'price_1Sn51wRG5zp0rTvz8SeF3WXh',
      status: 'Invite Only',
    },
    {
      name: 'VIDEO PRO',
      price: '$5',
      period: '/MONTH',
      description: 'Unlock high-quality AI video generation.',
      icon: Video,
      color: 'text-indigo-500 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      border: 'border-indigo-200 dark:border-indigo-800/50',
      features: ['Invite Only', 'High-quality Video Generation API access'],
      stripeId: process.env.NEXT_PUBLIC_STRIPE_VIDEO_PRICE_ID || 'price_1SnLTHRG5zp0rTvzT7KuRE8v',
      status: 'Invite Only',
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            View configuration and Stripe bindings for your pricing tiers.
          </p>
        </div>
        <div>
          <a href="https://dashboard.stripe.com/products" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-[#635BFF] text-white rounded-lg text-sm font-bold hover:bg-[#635BFF]/90 transition-colors shadow-sm">
            Manage in Stripe <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className={cn("rounded-2xl border bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col", plan.border)}>
            <div className={cn("p-6 border-b", plan.border)}>
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl", plan.bg)}>
                  <plan.icon className={cn("h-5 w-5", plan.color)} />
                </div>
                <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full", plan.bg, plan.color)}>
                  {plan.status}
                </span>
              </div>
              
              <h3 className="font-bold text-lg">{plan.name}</h3>
              <p className="text-sm text-slate-500 h-10 mt-1">{plan.description}</p>
              
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                <span className="text-slate-500 font-medium">{plan.period}</span>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Features</h4>
              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={cn("h-4 w-4 shrink-0 mt-0.5", plan.color)} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Stripe Price ID</h4>
                <code className="block text-[10px] sm:text-xs font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 break-all">
                  {plan.stripeId}
                </code>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
