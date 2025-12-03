import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [projects, stories] = await Promise.all([
      getProjects({ publishedOnly: true, kind: 'project' }),
      getProjects({ publishedOnly: true, kind: 'story' })
    ]);

    return NextResponse.json({
      projects: projects.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
      })),
      stories: stories.map(s => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
      })),
    });
  } catch (error) {
    console.error('Error fetching projects/stories list:', error);
    return NextResponse.json(
      { projects: [], stories: [] },
      { status: 500 }
    );
  }
}

