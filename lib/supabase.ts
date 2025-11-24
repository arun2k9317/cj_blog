import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let serverClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
    if (serverClient) return serverClient;

    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url) throw new Error('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required.');
    if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required.');

    serverClient = createClient(url, key);
    return serverClient;
}

// Database schema creation
export async function initializeDatabase() {
    try {
        const supabase = getSupabaseServerClient();
        // Create projects table
        const { error: projectsError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS projects (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          location VARCHAR(255),
          featured_image VARCHAR(500),
          kind VARCHAR(20) DEFAULT 'project',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          published BOOLEAN DEFAULT false,
          tags TEXT[] DEFAULT '{}'
        )
      `
        });

        if (projectsError) {
            console.log('Projects table might already exist:', projectsError.message);
        }

        // Ensure kind column exists for legacy tables
        await supabase.rpc('exec_sql', {
            sql: `
        ALTER TABLE projects
        ADD COLUMN IF NOT EXISTS kind VARCHAR(20) DEFAULT 'project'
      `
        });

        // Create content_blocks table
        const { error: blocksError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS content_blocks (
          id VARCHAR(255) PRIMARY KEY,
          project_id VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          "order" INTEGER NOT NULL,
          content TEXT,
          text_align VARCHAR(20),
          font_size VARCHAR(20),
          font_weight VARCHAR(20),
          src VARCHAR(500),
          alt TEXT,
          caption TEXT,
          aspect_ratio VARCHAR(20),
          alignment VARCHAR(20),
          images JSONB,
          layout VARCHAR(20),
          columns INTEGER,
          text TEXT,
          author VARCHAR(255),
          style VARCHAR(20),
          height INTEGER,
          subtitle TEXT,
          line_height NUMERIC,
          max_width INTEGER,
          size VARCHAR(50),
          aspect_ratio_lock BOOLEAN,
          placement VARCHAR(20),
          italic BOOLEAN,
          spacing_top INTEGER,
          spacing_bottom INTEGER,
          date VARCHAR(255),
          credits TEXT,
          page_width VARCHAR(20),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
        });

        if (blocksError) {
            console.log('Content blocks table might already exist:', blocksError.message);
        }

        // Add new columns for story blocks if they don't exist
        // Note: exec_sql RPC may not exist in Supabase, so we'll try to add columns
        // If this fails, run the migration SQL manually in Supabase SQL Editor
        const addColumnQueries = [
            { sql: `ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS subtitle TEXT`, name: 'subtitle' },
            { sql: `ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS line_height NUMERIC`, name: 'line_height' },
            { sql: `ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS max_width INTEGER`, name: 'max_width' },
            { sql: `ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS size VARCHAR(50)`, name: 'size' },
            { sql: `ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS aspect_ratio_lock BOOLEAN`, name: 'aspect_ratio_lock' },
            { sql: `ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS placement VARCHAR(20)`, name: 'placement' },
            { sql: `ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS italic BOOLEAN`, name: 'italic' },
            { sql: `ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS spacing_top INTEGER`, name: 'spacing_top' },
            { sql: `ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS spacing_bottom INTEGER`, name: 'spacing_bottom' },
            { sql: `ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS date VARCHAR(255)`, name: 'date' },
            { sql: `ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS credits TEXT`, name: 'credits' },
            { sql: `ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS page_width VARCHAR(20)`, name: 'page_width' },
        ];

        for (const query of addColumnQueries) {
            try {
                const { error } = await supabase.rpc('exec_sql', { sql: query.sql });
                if (error) {
                    console.log(`Could not add column ${query.name} via exec_sql (this is normal if exec_sql doesn't exist):`, error.message);
                }
            } catch (err) {
                console.log(`Could not add column ${query.name} (exec_sql may not be available):`, err instanceof Error ? err.message : 'Unknown error');
            }
        }

        // Create indexes for better performance
        await supabase.rpc('exec_sql', {
            sql: 'CREATE INDEX IF NOT EXISTS idx_content_blocks_project_id ON content_blocks(project_id)'
        });

        await supabase.rpc('exec_sql', {
            sql: 'CREATE INDEX IF NOT EXISTS idx_content_blocks_order ON content_blocks(project_id, "order")'
        });

        await supabase.rpc('exec_sql', {
            sql: 'CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug)'
        });

        await supabase.rpc('exec_sql', {
            sql: 'CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published)'
        });

        await supabase.rpc('exec_sql', {
            sql: 'CREATE INDEX IF NOT EXISTS idx_projects_kind ON projects(kind)'
        });

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Project operations
export async function createProject(project: {
    id: string;
    title: string;
    slug: string;
    description?: string;
    location?: string;
    featuredImage?: string;
    published?: boolean;
    tags?: string[];
    kind?: 'project' | 'story';
}) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from('projects')
        .insert({
            id: project.id,
            title: project.title,
            slug: project.slug,
            description: project.description || null,
            location: project.location || null,
            featured_image: project.featuredImage || null,
            kind: project.kind ?? 'project',
            published: project.published || false,
            tags: project.tags || []
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getProject(id: string) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

export async function getAllProjects(publishedOnly: boolean = true) {
    const supabase = getSupabaseServerClient();
    let query = supabase.from('projects').select('*');

    if (publishedOnly) {
        query = query.eq('published', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

// Flexible fetch with optional kind filter
export async function getProjects(options?: {
    publishedOnly?: boolean;
    kind?: 'project' | 'story';
}) {
    const supabase = getSupabaseServerClient();
    let query = supabase.from('projects').select('*');
    if (options?.publishedOnly) {
        query = query.eq('published', true);
    }
    if (options?.kind) {
        // Only apply if column exists; if it doesn't, this will error.
        // Callers should handle errors or avoid passing kind if schema lacks it.
        query = query.eq('kind', options.kind);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function updateProject(id: string, updates: Partial<{
    title: string;
    slug: string;
    description: string;
    location: string;
    featuredImage: string;
    published: boolean;
    tags: string[];
    kind: 'project' | 'story';
}>) {
    const supabase = getSupabaseServerClient();
    const mappedUpdates: Record<string, unknown> = {};

    if (typeof updates.title !== 'undefined') mappedUpdates.title = updates.title;
    if (typeof updates.slug !== 'undefined') mappedUpdates.slug = updates.slug;
    if (typeof updates.description !== 'undefined') mappedUpdates.description = updates.description ?? null;
    if (typeof updates.location !== 'undefined') mappedUpdates.location = updates.location ?? null;
    if (typeof updates.featuredImage !== 'undefined') mappedUpdates.featured_image = updates.featuredImage ?? null;
    if (typeof updates.published !== 'undefined') mappedUpdates.published = updates.published;
    if (typeof updates.tags !== 'undefined') mappedUpdates.tags = updates.tags ?? [];
    if (typeof updates.kind !== 'undefined') mappedUpdates.kind = updates.kind;

    const { data, error } = await supabase
        .from('projects')
        .update({
            ...mappedUpdates,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteProject(id: string) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// Content block operations
export async function createContentBlock(block: {
    id: string;
    projectId: string;
    type: string;
    order: number;
    content?: string;
    textAlign?: string;
    fontSize?: string;
    fontWeight?: string;
    src?: string;
    alt?: string;
    caption?: string;
    aspectRatio?: string;
    alignment?: string;
    images?: unknown;
    layout?: string;
    columns?: number;
    text?: string;
    author?: string;
    style?: string;
    height?: number;
    subtitle?: string;
    lineHeight?: number;
    maxWidth?: number;
    size?: string | number;
    aspectRatioLock?: boolean;
    placement?: string;
    italic?: boolean;
    spacingTop?: number;
    spacingBottom?: number;
    date?: string;
    credits?: string;
    pageWidth?: string;
}) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from('content_blocks')
        .insert({
            id: block.id,
            project_id: block.projectId,
            type: block.type,
            order: block.order,
            content: block.content || null,
            text_align: block.textAlign || null,
            font_size: block.fontSize || null,
            font_weight: block.fontWeight || null,
            src: block.src || null,
            alt: block.alt || null,
            caption: block.caption || null,
            aspect_ratio: block.aspectRatio || null,
            alignment: block.alignment || null,
            images: block.images || null,
            layout: block.layout || null,
            columns: block.columns || null,
            text: block.text || null,
            author: block.author || null,
            style: block.style || null,
            height: block.height || null,
            subtitle: block.subtitle || null,
            line_height: block.lineHeight || null,
            max_width: block.maxWidth || null,
            size: typeof block.size === 'number' ? block.size.toString() : (block.size || null),
            aspect_ratio_lock: block.aspectRatioLock || null,
            placement: block.placement || null,
            italic: block.italic || null,
            spacing_top: block.spacingTop || null,
            spacing_bottom: block.spacingBottom || null,
            date: block.date || null,
            credits: block.credits || null,
            page_width: block.pageWidth || null
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getContentBlocks(projectId: string) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('project_id', projectId)
        .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
}

// Assets listing (if assets table exists)
export async function getAssets() {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function updateContentBlock(id: string, updates: Record<string, unknown>) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from('content_blocks')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteContentBlock(id: string) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
        .from('content_blocks')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function deleteContentBlocksByProject(projectId: string) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
        .from('content_blocks')
        .delete()
        .eq('project_id', projectId);

    if (error) throw error;
}

// Helper function to get project with content blocks
export async function getProjectWithBlocks(id: string) {
    const project = await getProject(id);
    if (!project) return null;

    const blocks = await getContentBlocks(id);

    // Transform database rows to match your TypeScript types
    const contentBlocks = blocks.map(block => {
        const baseBlock = {
            id: block.id,
            type: block.type,
            order: block.order
        };

        switch (block.type) {
            case 'text':
                return {
                    ...baseBlock,
                    content: block.content,
                    textAlign: block.text_align,
                    fontSize: block.font_size,
                    fontWeight: block.font_weight
                };
            case 'image':
                return {
                    ...baseBlock,
                    src: block.src,
                    alt: block.alt,
                    caption: block.caption,
                    aspectRatio: block.aspect_ratio,
                    alignment: block.alignment
                };
            case 'image-gallery':
                return {
                    ...baseBlock,
                    images: block.images || [],
                    layout: block.layout,
                    columns: block.columns
                };
            case 'quote':
                return {
                    ...baseBlock,
                    text: block.text,
                    author: block.author,
                    alignment: block.alignment,
                    style: block.style
                };
            case 'spacer':
                return {
                    ...baseBlock,
                    height: block.height
                };
            case 'title':
                return {
                    ...baseBlock,
                    text: block.text,
                    subtitle: block.subtitle,
                    fontSize: block.font_size,
                    alignment: block.alignment
                };
            case 'description':
                return {
                    ...baseBlock,
                    content: block.content,
                    lineHeight: block.line_height,
                    maxWidth: block.max_width
                };
            case 'story-image':
                return {
                    ...baseBlock,
                    src: block.src,
                    alt: block.alt,
                    size: normalizeSize(block.size),
                    aspectRatioLock: block.aspect_ratio_lock,
                    aspectRatio: block.aspect_ratio,
                    caption: block.caption || undefined,
                    captionPlacement: block.placement || undefined,
                    captionItalic: block.italic ?? undefined
                };
            case 'divider':
                return {
                    ...baseBlock,
                    spacingTop: block.spacing_top,
                    spacingBottom: block.spacing_bottom
                };
            case 'footer':
                return {
                    ...baseBlock,
                    text: block.text,
                    date: block.date,
                    credits: block.credits,
                    pageWidth: block.page_width
                };
            default:
                return baseBlock;
        }
    });

    return {
        ...project,
        featuredImage: project.featured_image,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        kind: project.kind ?? 'project',
        contentBlocks
    };
}

function normalizeSize(value: unknown): string | number | undefined {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        if (value === 'full-width' || value === 'narrow') return value;
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }
    return undefined;
}

export async function getProjectsUsingImage(imageUrl: string) {
    if (!imageUrl) {
        return [];
    }

    const supabase = getSupabaseServerClient();
    const projectIds = new Set<string>();
    const projectsMap = new Map<string, { id: string; title: string | null; slug: string | null }>();

    const [{ data: singleImageBlocks, error: singleImageError }, { data: galleryBlocks, error: galleryError }] = await Promise.all([
        supabase
            .from('content_blocks')
            .select('project_id')
            .eq('src', imageUrl),
        supabase
            .from('content_blocks')
            .select('project_id, images')
            .not('images', 'is', null)
    ]);

    if (singleImageError) throw singleImageError;
    if (galleryError) throw galleryError;

    singleImageBlocks?.forEach(block => {
        const id = typeof block.project_id === 'string' ? block.project_id : null;
        if (id) projectIds.add(id);
    });

    galleryBlocks?.forEach(block => {
        const id = typeof block.project_id === 'string' ? block.project_id : null;
        if (!id) return;

        let imagesData: unknown = block.images;
        if (typeof imagesData === 'string') {
            try {
                imagesData = JSON.parse(imagesData);
            } catch (error) {
                console.warn('Failed to parse images JSON for block', block.project_id, error);
                imagesData = null;
            }
        }
        if (Array.isArray(imagesData)) {
            const match = imagesData.some((img: unknown) => {
                if (typeof img === 'object' && img !== null && 'src' in img) {
                    const value = (img as { src?: unknown }).src;
                    return typeof value === 'string' && value === imageUrl;
                }
                return false;
            });
            if (match) {
                projectIds.add(id);
            }
        }
    });

    if (projectIds.size > 0) {
        const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('id, title, slug')
            .in('id', Array.from(projectIds));

        if (projectsError) throw projectsError;

        projectsData?.forEach(project => {
            if (typeof project.id === 'string') {
                projectsMap.set(project.id, {
                    id: project.id,
                    title: project.title ?? null,
                    slug: project.slug ?? null
                });
            }
        });
    }

    const { data: featuredProjects, error: featuredError } = await supabase
        .from('projects')
        .select('id, title, slug')
        .eq('featured_image', imageUrl);

    if (featuredError) throw featuredError;

    featuredProjects?.forEach(project => {
        if (typeof project.id === 'string') {
            projectsMap.set(project.id, {
                id: project.id,
                title: project.title ?? null,
                slug: project.slug ?? null
            });
        }
    });

    return Array.from(projectsMap.values());
}

