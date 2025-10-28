# Supabase Database Setup Guide

## Overview

Your photography blog now uses **Supabase** (PostgreSQL) with raw SQL for storing project data and content blocks. Images are stored in **Vercel Blob Storage**.

## Architecture

- **Projects Table**: Stores photography project metadata (title, slug, description, location, etc.)
- **Content Blocks Table**: Stores individual content blocks (text, images, galleries, quotes, spacers)
- **Vercel Blob**: Stores uploaded images
- **Supabase**: PostgreSQL database with real-time capabilities

## Setup Steps

### 1. Environment Variables

From your Vercel dashboard, copy these environment variables to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
SUPABASE_URL=your_supabase_url

# Vercel Blob Storage (if not already set)
BLOB_READ_WRITE_TOKEN=your_blob_token
```

### 2. Initialize Database Schema

Run the initialization script to create tables:

```bash
npm run init-db
```

This creates:

- `projects` table for project metadata
- `content_blocks` table for content blocks
- Proper indexes for performance
- Foreign key relationships

### 3. Upload Sample Images (Optional)

If you want to test with sample photography projects, upload images to blob storage:

```bash
npm run upload-sample-images
```

**Manual Upload Instructions:**
Create these folders and upload images with these exact names:

```
sample-images/
├── nature-wildlife-series/
│   ├── featured-image.jpg
│   ├── eagle-portrait.jpg
│   ├── deer-forest.jpg
│   ├── bear-fishing.jpg
│   ├── wolf-pack.jpg
│   └── owl-night.jpg
├── urban-life-documentary/
│   ├── featured-image.jpg
│   ├── street-vendor.jpg
│   ├── commuter-rush.jpg
│   ├── street-artist.jpg
│   ├── food-truck.jpg
│   └── rooftop-view.jpg
└── cultural-heritage-monuments/
    ├── featured-image.jpg
    ├── ancient-temple.jpg
    ├── traditional-craftsman.jpg
    ├── historical-monument.jpg
    ├── festival-dance.jpg
    ├── textile-art.jpg
    ├── ceremonial-mask.jpg
    └── ancient-script.jpg
```

## Database Schema

### Projects Table

```sql
CREATE TABLE projects (
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
);
```

### Content Blocks Table

```sql
CREATE TABLE content_blocks (
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
);
```

## Sample Photography Projects

The system includes three sample photography projects:

### 1. Nature & Wildlife Series

- **Focus**: Wildlife photography in natural habitats
- **Images**: Eagle portraits, deer in forest, bear fishing, wolf pack, owl at night
- **Tags**: wildlife, nature, animals, photography

### 2. Urban Life Documentary

- **Focus**: Daily life in urban environments
- **Images**: Street vendors, commuter rush, street artists, food trucks, rooftop views
- **Tags**: urban, documentary, people, city-life

### 3. Cultural Heritage & Monuments

- **Focus**: Traditional art forms and ancient monuments
- **Images**: Ancient temples, traditional craftsmen, historical monuments, festival dances, textile art, ceremonial masks, ancient scripts
- **Tags**: heritage, monuments, culture, traditional-art

## API Endpoints

### GET /api/projects

- Returns all published projects
- Automatically creates sample projects if none exist
- Uses Supabase for data persistence

### POST /api/projects

- Creates a new project with content blocks
- Validates required fields (title, slug)
- Handles content block creation

### GET /api/projects/[id]

- Returns specific project with all content blocks
- Transforms database data to match TypeScript types

### PUT /api/projects/[id]

- Updates project metadata and content blocks
- Replaces all content blocks (deletes old, creates new)

### DELETE /api/projects/[id]

- Deletes project and all associated content blocks
- Handles foreign key constraints properly

## Supabase Functions

The `lib/supabase.ts` file provides these functions:

### Project Operations

- `createProject()`: Create new project
- `getProject()`: Get project by ID
- `getAllProjects()`: Get all projects (with published filter)
- `updateProject()`: Update project metadata
- `deleteProject()`: Delete project
- `getProjectWithBlocks()`: Get project with content blocks

### Content Block Operations

- `createContentBlock()`: Create content block
- `getContentBlocks()`: Get blocks for project
- `updateContentBlock()`: Update specific block
- `deleteContentBlock()`: Delete specific block
- `deleteContentBlocksByProject()`: Delete all blocks for project

## Testing

### 1. Test Database Connection

```bash
npm run init-db
```

### 2. Test Admin Dashboard

1. Start development server: `npm run dev`
2. Go to `/admin`
3. Try creating a new project
4. Verify data persists after page refresh

### 3. Test API Endpoints

```bash
# Get all projects (will create sample projects if none exist)
curl http://localhost:3000/api/projects

# Create a project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Project","slug":"test-project","description":"Test description"}'
```

## Benefits of Supabase Setup

1. **Real-time**: Built-in real-time subscriptions
2. **Authentication**: Ready-to-use auth system
3. **API**: Auto-generated REST and GraphQL APIs
4. **Dashboard**: Web-based database management
5. **Scalability**: Handles scaling automatically
6. **PostgreSQL**: Full SQL capabilities with extensions

## Troubleshooting

### Database Connection Issues

- Verify environment variables are set correctly
- Check Supabase project is active
- Ensure database URL is correct

### Schema Issues

- Run `npm run init-db` to recreate schema
- Check Supabase dashboard for database logs
- Verify RLS (Row Level Security) policies if enabled

### API Errors

- Check server logs in Vercel dashboard
- Verify environment variables are set
- Test database connection manually

## Next Steps

1. **Set up environment variables** (copy from Vercel dashboard)
2. **Run database initialization**: `npm run init-db`
3. **Upload sample images** (optional): `npm run upload-sample-images`
4. **Test the admin dashboard** with real database
5. **Deploy to production** and verify everything works

Your photography blog now has a robust, scalable database backend with Supabase! 📸✨

