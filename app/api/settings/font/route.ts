import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'primary_font')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      font: data?.value || '"Crimson Text", "Ethos Nova", serif'
    });
  } catch (error) {
    console.error('Error fetching font setting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch font setting' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { font } = await request.json();
    
    if (!font) {
      return NextResponse.json(
        { error: 'Font is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'primary_font',
        value: font,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating font setting:', error);
    return NextResponse.json(
      { error: 'Failed to update font setting' },
      { status: 500 }
    );
  }
}

