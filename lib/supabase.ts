import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema creation
export async function initializeDatabase() {
    try {
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

        // Create content_blocks table
        const { error: blocksError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS content_blocks (
          id VARCHAR(255) PRIMARY KEY,
          project_id VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'image', 'image-gallery', 'quote', 'spacer')),
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
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
        });

        if (blocksError) {
            console.log('Content blocks table might already exist:', blocksError.message);
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
}) {
    const { data, error } = await supabase
        .from('projects')
        .insert({
            id: project.id,
            title: project.title,
            slug: project.slug,
            description: project.description || null,
            location: project.location || null,
            featured_image: project.featuredImage || null,
            published: project.published || false,
            tags: project.tags || []
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getProject(id: string) {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

export async function getAllProjects(publishedOnly: boolean = true) {
    let query = supabase.from('projects').select('*');

    if (publishedOnly) {
        query = query.eq('published', true);
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
}>) {
    const { data, error } = await supabase
        .from('projects')
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

export async function deleteProject(id: string) {
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
}) {
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
            height: block.height || null
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getContentBlocks(projectId: string) {
    const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('project_id', projectId)
        .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function updateContentBlock(id: string, updates: Record<string, unknown>) {
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
    const { error } = await supabase
        .from('content_blocks')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function deleteContentBlocksByProject(projectId: string) {
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
            default:
                return baseBlock;
        }
    });

    return {
        ...project,
        featuredImage: project.featured_image,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        contentBlocks
    };
}

