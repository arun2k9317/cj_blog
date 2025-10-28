# Database Setup Guide

## Overview

Your blog now uses **Vercel Postgres** with raw SQL for storing project data and content blocks. Images are still stored in **Vercel Blob Storage**.

## Architecture

- **Projects Table**: Stores project metadata (title, slug, description, etc.)
- **Content Blocks Table**: Stores individual content blocks (text, images, galleries, etc.)
- **Vercel Blob**: Stores uploaded images
- **Raw SQL**: Direct database queries using `@vercel/postgres`

## Setup Steps

### 1. Create Vercel Postgres Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Choose **Postgres**
5. Select region and pricing plan
6. Give it a name (e.g., "cj-blog-db")
7. Click **Create**

### 2. Connect Database to Project

1. In your Vercel project dashboard
2. Go to **Storage** tab
3. Find your PostgreSQL database
4. Click **Connect**
5. This automatically sets the `DATABASE_URL` environment variable

### 3. Initialize Database Schema

Run the initialization script to create tables:

```bash
npm run init-db
```

This creates:

- `projects` table for project metadata
- `content_blocks` table for content blocks
- Proper indexes for performance
- Foreign key relationships

### 4. Environment Variables

The following environment variable is automatically set by Vercel:

- `DATABASE_URL`: PostgreSQL connection string

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

## API Endpoints

### GET /api/projects

- Returns all published projects
- Automatically initializes database if needed

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

## Database Functions

The `lib/database.ts` file provides these functions:

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
# Get all projects
curl http://localhost:3000/api/projects

# Create a project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Project","slug":"test-project","description":"Test description"}'
```

## Benefits of This Setup

1. **Persistence**: Data survives server restarts and deployments
2. **Scalability**: Vercel Postgres handles scaling automatically
3. **Performance**: Proper indexes and foreign keys
4. **Reliability**: ACID transactions and data integrity
5. **Flexibility**: Raw SQL gives you full control
6. **Cost-effective**: Pay only for what you use

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is set in Vercel dashboard
- Check if database is in the same region as your deployment
- Ensure database is not paused (free tier limitation)

### Schema Issues

- Run `npm run init-db` to recreate schema
- Check Vercel dashboard for database logs

### API Errors

- Check server logs in Vercel dashboard
- Verify environment variables are set
- Test database connection manually

## Next Steps

1. **Set up Vercel Postgres database** (follow steps above)
2. **Run database initialization**: `npm run init-db`
3. **Test the admin dashboard** with real database
4. **Deploy to production** and verify everything works

Your blog now has a robust, scalable database backend ready for production use!
