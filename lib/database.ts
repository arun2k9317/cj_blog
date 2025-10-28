import { sql } from '@vercel/postgres';

// Database schema creation
export async function initializeDatabase() {
    try {
        // Create projects table
        await sql`
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
    `;

        // Create content_blocks table
        await sql`
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
    `;

        // Create indexes for better performance
        await sql`CREATE INDEX IF NOT EXISTS idx_content_blocks_project_id ON content_blocks(project_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_content_blocks_order ON content_blocks(project_id, "order")`;
        await sql`CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published)`;

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
    const result = await sql`
    INSERT INTO projects (id, title, slug, description, location, featured_image, published, tags)
    VALUES (${project.id}, ${project.title}, ${project.slug}, ${project.description || null}, 
            ${project.location || null}, ${project.featuredImage || null}, 
            ${project.published || false}, ${JSON.stringify(project.tags || [])})
    RETURNING *
  `;
    return result.rows[0];
}

export async function getProject(id: string) {
    const result = await sql`
    SELECT * FROM projects WHERE id = ${id}
  `;
    return result.rows[0];
}

export async function getAllProjects(publishedOnly: boolean = true) {
    const query = publishedOnly
        ? sql`SELECT * FROM projects WHERE published = true ORDER BY created_at DESC`
        : sql`SELECT * FROM projects ORDER BY created_at DESC`;

    const result = await query;
    return result.rows;
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
    const setClause = Object.keys(updates)
        .map(key => `${key} = $${Object.keys(updates).indexOf(key) + 1}`)
        .join(', ');

    const values = Object.values(updates);
    const query = `
    UPDATE projects 
    SET ${setClause}, updated_at = NOW() 
    WHERE id = $${values.length + 1}
    RETURNING *
  `;

    const result = await sql.query(query, [...values, id]);
    return result.rows[0];
}

export async function deleteProject(id: string) {
    await sql`DELETE FROM projects WHERE id = ${id}`;
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
    const result = await sql`
    INSERT INTO content_blocks (
      id, project_id, type, "order", content, text_align, font_size, font_weight,
      src, alt, caption, aspect_ratio, alignment, images, layout, columns,
      text, author, style, height
    )
    VALUES (
      ${block.id}, ${block.projectId}, ${block.type}, ${block.order},
      ${block.content || null}, ${block.textAlign || null}, ${block.fontSize || null}, ${block.fontWeight || null},
      ${block.src || null}, ${block.alt || null}, ${block.caption || null}, ${block.aspectRatio || null}, ${block.alignment || null},
      ${block.images ? JSON.stringify(block.images) : null}, ${block.layout || null}, ${block.columns || null},
      ${block.text || null}, ${block.author || null}, ${block.style || null}, ${block.height || null}
    )
    RETURNING *
  `;
    return result.rows[0];
}

export async function getContentBlocks(projectId: string) {
    const result = await sql`
    SELECT * FROM content_blocks 
    WHERE project_id = ${projectId} 
    ORDER BY "order" ASC
  `;
    return result.rows;
}

export async function updateContentBlock(id: string, updates: Record<string, unknown>) {
    const setClause = Object.keys(updates)
        .map(key => `${key} = $${Object.keys(updates).indexOf(key) + 1}`)
        .join(', ');

    const values = Object.values(updates);
    const query = `
    UPDATE content_blocks 
    SET ${setClause}, updated_at = NOW() 
    WHERE id = $${values.length + 1}
    RETURNING *
  `;

    const result = await sql.query(query, [...values, id]);
    return result.rows[0];
}

export async function deleteContentBlock(id: string) {
    await sql`DELETE FROM content_blocks WHERE id = ${id}`;
}

export async function deleteContentBlocksByProject(projectId: string) {
    await sql`DELETE FROM content_blocks WHERE project_id = ${projectId}`;
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
