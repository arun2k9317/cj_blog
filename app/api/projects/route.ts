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

// GET /api/projects - Get all projects
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      projects: projects.filter(p => p.published)
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    
    // Validate required fields
    if (!projectData.title || !projectData.slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingProject = projects.find(p => p.slug === projectData.slug);
    if (existingProject) {
      return NextResponse.json(
        { error: 'A project with this slug already exists' },
        { status: 400 }
      );
    }

    const newProject: Project = {
      ...projectData,
      id: projectData.slug, // Use slug as ID for simplicity
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    projects.push(newProject);

    return NextResponse.json({
      success: true,
      project: newProject
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
