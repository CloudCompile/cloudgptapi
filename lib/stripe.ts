import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      appInfo: {
        name: 'Vetra',
        version: '1.0.0',
      },
    });
  }
  return stripeInstance;
}

export const stripe = {
  get instance() {
    return getStripe();
  },
  get checkout() {
    return {
      get sessions() {
        return {
          create: (...args: Parameters<Stripe['checkout']['sessions']['create']>) =>
            getStripe().checkout.sessions.create(...args),
          listLineItems: (...args: Parameters<Stripe['checkout']['sessions']['listLineItems']>) =>
            getStripe().checkout.sessions.listLineItems(...args),
        };
      },
    };
  },
  get billingPortal() {
    return {
      get sessions() {
        return {
          create: (...args: Parameters<Stripe['billingPortal']['sessions']['create']>) =>
            getStripe().billingPortal.sessions.create(...args),
        };
      },
    };
  },
  get webhooks() {
    return {
      constructEvent: (...args: Parameters<Stripe['webhooks']['constructEvent']>) =>
        getStripe().webhooks.constructEvent(...args),
    };
  },
  get subscriptions() {
    return {
      retrieve: (...args: Parameters<Stripe['subscriptions']['retrieve']>) =>
        getStripe().subscriptions.retrieve(...args),
    };
  },
  get coupons() {
    return {
      create: (...args: Parameters<Stripe['coupons']['create']>) =>
        getStripe().coupons.create(...args),
      del: (...args: Parameters<Stripe['coupons']['del']>) =>
        getStripe().coupons.del(...args),
    };
  },
};
