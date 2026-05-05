import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/health
// A lightweight endpoint to check database connectivity and keep Supabase from pausing.
export async function GET() {
  try {
    // Perform a very lightweight query just to wake up/ping the database
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.error("Health check database error:", error.message);
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      status: 'ok', 
      database: 'connected', 
      timestamp: new Date().toISOString() 
    });
  } catch (err: any) {
    console.error("Health check failed:", err.message);
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
