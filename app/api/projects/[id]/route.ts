import { NextRequest, NextResponse } from 'next/server';
import { Project } from '@/types/project';
import {
  initializeDatabase,
  getProjectWithBlocks,
  updateProject,
  deleteProject,
  deleteContentBlocksByProject,
  createContentBlock
} from '@/lib/supabase';

// GET /api/projects/[id] - Get a specific project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeDatabase();

    const project = await getProjectWithBlocks(params.id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectData: Partial<Project> = await request.json();

    await initializeDatabase();

    // Update project metadata
    const updatedProject = await updateProject(params.id, {
      title: projectData.title,
      slug: projectData.slug,
      description: projectData.description,
      location: projectData.location,
      featuredImage: projectData.featuredImage,
      published: projectData.published,
      tags: projectData.tags
    });

    // Update content blocks if provided
    if (projectData.contentBlocks) {
      // Delete existing blocks
      await deleteContentBlocksByProject(params.id);

      // Create new blocks
      for (const block of projectData.contentBlocks) {
        await createContentBlock({
          id: block.id,
          projectId: params.id,
          type: block.type,
          order: block.order,
          content: 'content' in block ? block.content : undefined,
          textAlign: 'textAlign' in block ? block.textAlign : undefined,
          fontSize: 'fontSize' in block ? block.fontSize : undefined,
          fontWeight: 'fontWeight' in block ? block.fontWeight : undefined,
          src: 'src' in block ? block.src : undefined,
          alt: 'alt' in block ? block.alt : undefined,
          caption: 'caption' in block ? block.caption : undefined,
          aspectRatio: 'aspectRatio' in block ? block.aspectRatio : undefined,
          alignment: 'alignment' in block ? block.alignment : undefined,
          images: 'images' in block ? block.images : undefined,
          layout: 'layout' in block ? block.layout : undefined,
          columns: 'columns' in block ? block.columns : undefined,
          text: 'text' in block ? block.text : undefined,
          author: 'author' in block ? block.author : undefined,
          style: 'style' in block ? block.style : undefined,
          height: 'height' in block ? block.height : undefined
        });
      }
    }

    // Get the updated project with blocks
    const projectWithBlocks = await getProjectWithBlocks(params.id);

    return NextResponse.json({
      success: true,
      project: projectWithBlocks
    });

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeDatabase();

    // Delete content blocks first (due to foreign key constraint)
    await deleteContentBlocksByProject(params.id);

    // Delete the project
    await deleteProject(params.id);

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
