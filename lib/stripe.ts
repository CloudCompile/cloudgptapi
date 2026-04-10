import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
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
  get checkout() {
    return {
      get sessions() {
        return {
          create: (params: Stripe.Checkout.SessionCreateParams, options?: Stripe.RequestOptions) =>
            getStripe().checkout.sessions.create(params, options),
          listLineItems: (sessionId: string, params?: Stripe.Checkout.SessionListLineItemsParams, options?: Stripe.RequestOptions) =>
            getStripe().checkout.sessions.listLineItems(sessionId, params, options),
        };
      },
    };
  },
  get billingPortal() {
    return {
      get sessions() {
        return {
          create: (params: Stripe.BillingPortal.SessionCreateParams, options?: Stripe.RequestOptions) =>
            getStripe().billingPortal.sessions.create(params, options),
        };
      },
    };
  },
  get webhooks() {
    return {
      constructEvent: (payload: string | Buffer, signature: string, secret: string) =>
        getStripe().webhooks.constructEvent(payload, signature, secret),
    };
  },
  get subscriptions() {
    return {
      retrieve: (id: string, params?: Stripe.SubscriptionRetrieveParams, options?: Stripe.RequestOptions) =>
        getStripe().subscriptions.retrieve(id, params, options),
    };
  },
  get coupons() {
    return {
      create: (params: Stripe.CouponCreateParams, options?: Stripe.RequestOptions) =>
        getStripe().coupons.create(params, options),
      del: (id: string, options?: Stripe.RequestOptions) =>
        getStripe().coupons.del(id, options),
    };
  },
};