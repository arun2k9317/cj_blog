import { NextRequest, NextResponse } from 'next/server';
import { Project } from '@/types/project';

// In-memory storage for demo purposes
// In production, you'd use a database like PostgreSQL, MongoDB, etc.
let projects: Project[] = [
  {
    id: 'carla-ridge-residence',
    title: 'Carla Ridge Residence',
    slug: 'carla-ridge-residence',
    description: 'Modern hillside residence with extensive outdoor living spaces and panoramic city views.',
    location: 'Los Angeles, CA',
    architect: 'Walker Workshop',
    contentBlocks: [
      {
        id: '1',
        type: 'text',
        order: 0,
        content: 'Carla Ridge Residence',
        textAlign: 'center',
        fontSize: 'xlarge',
        fontWeight: 'bold'
      },
      {
        id: '2',
        type: 'text',
        order: 1,
        content: 'Los Angeles, CA • Walker Workshop',
        textAlign: 'center',
        fontSize: 'medium',
        fontWeight: 'normal'
      },
      {
        id: '3',
        type: 'spacer',
        order: 2,
        height: 2
      },
      {
        id: '4',
        type: 'text',
        order: 3,
        content: 'Modern hillside residence with extensive outdoor living spaces and panoramic city views.',
        textAlign: 'left',
        fontSize: 'medium',
        fontWeight: 'normal'
      },
      {
        id: '5',
        type: 'image',
        order: 4,
        src: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        alt: 'Carla Ridge Residence exterior view',
        alignment: 'center',
        aspectRatio: 'landscape'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: true
  }
];

// GET /api/projects/[id] - Get a specific project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = projects.find(p => p.id === params.id);
    
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
    
    const projectIndex = projects.findIndex(p => p.id === params.id);
    
    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update the project
    projects[projectIndex] = {
      ...projects[projectIndex],
      ...projectData,
      id: params.id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      project: projects[projectIndex]
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
    const projectIndex = projects.findIndex(p => p.id === params.id);
    
    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    projects.splice(projectIndex, 1);

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
