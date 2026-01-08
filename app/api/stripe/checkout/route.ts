import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  return NextResponse.json({ error: 'This endpoint has been moved to /api/stripe/create-checkout-session' }, { status: 301 });
}
