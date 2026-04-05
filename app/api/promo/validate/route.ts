import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Promo code is required' },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase().trim();

    // Fetch the promo code from database
    const { data: promoCode, error } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('code', normalizedCode)
      .single();

    console.log('[PROMO_VALIDATE] Query result:', { normalizedCode, promoCode, error });

    if (error || !promoCode) {
      return NextResponse.json(
        { valid: false, error: 'Invalid promo code' },
        { status: 200 }
      );
    }

    // Check if code has expired
    if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Promo code has expired' },
        { status: 200 }
      );
    }

    // Check if usage limit exceeded
    if (promoCode.usage_limit && promoCode.times_used >= promoCode.usage_limit) {
      return NextResponse.json(
        { valid: false, error: 'Promo code usage limit exceeded' },
        { status: 200 }
      );
    }

    // Code is valid - return details
    return NextResponse.json({
      valid: true,
      discount: {
        amount: promoCode.discount_amount,
        type: promoCode.discount_type,
      },
      expiresAt: promoCode.expires_at,
    });

  } catch (error: any) {
    console.error('[PROMO_VALIDATE_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Internal Error' },
      { status: 500 }
    );
  }
}