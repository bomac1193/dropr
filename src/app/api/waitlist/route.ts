/**
 * Waitlist API Route
 *
 * POST /api/waitlist - Add email to waitlist
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email' },
        { status: 400 }
      );
    }

    // If Supabase is configured, store the email
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { error } = await supabase
        .from('waitlist')
        .insert({ email, created_at: new Date().toISOString() });

      if (error && error.code !== '23505') {
        // 23505 is duplicate key - that's okay
        console.error('Waitlist error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to join waitlist' },
          { status: 500 }
        );
      }
    } else {
      // Log to console if Supabase not configured
      console.log('Waitlist signup:', email);
    }

    return NextResponse.json({
      success: true,
      message: 'Added to waitlist',
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to join waitlist' },
      { status: 500 }
    );
  }
}
