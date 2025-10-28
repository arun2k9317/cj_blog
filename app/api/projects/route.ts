import { NextRequest, NextResponse } from 'next/server';
import { Project, ContentBlock } from '@/types/project';
import {
  initializeDatabase,
  getAllProjects,
  createProject,
  createContentBlock
} from '@/lib/supabase';

// Sample photography projects with blob storage images
const sampleProjects = [
  {
    id: 'nature-wildlife-series',
    title: 'Nature & Wildlife Series',
    slug: 'nature-wildlife-series',
    description: 'A collection of wildlife photography capturing the beauty and behavior of animals in their natural habitats.',
    location: 'Various National Parks',
    featuredImage: 'https://blob.vercel-storage.com/nature-wildlife-series/featured-image.jpg',
    contentBlocks: [
      {
        id: '5',
        type: 'image',
        order: 0,
        src: 'https://blob.vercel-storage.com/nature-wildlife-series/eagle-portrait.jpg',
        alt: 'Majestic eagle portrait',
        alignment: 'center',
        aspectRatio: 'landscape'
      },
      {
        id: '6',
        type: 'image-gallery',
        order: 1,
        images: [
          {
            src: 'https://blob.vercel-storage.com/nature-wildlife-series/deer-forest.jpg',
            alt: 'Deer in misty forest',
            caption: 'Whitetail deer in morning mist'
          },
          {
            src: 'https://blob.vercel-storage.com/nature-wildlife-series/bear-fishing.jpg',
            alt: 'Bear fishing in stream',
            caption: 'Brown bear fishing for salmon'
          },
          {
            src: 'https://blob.vercel-storage.com/nature-wildlife-series/wolf-pack.jpg',
            alt: 'Wolf pack in snow',
            caption: 'Gray wolf pack in winter landscape'
          },
          {
            src: 'https://blob.vercel-storage.com/nature-wildlife-series/owl-night.jpg',
            alt: 'Owl in moonlight',
            caption: 'Great horned owl under moonlight'
          }
        ],
        layout: 'grid',
        columns: 2
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: true,
    tags: ['wildlife', 'nature', 'animals', 'photography']
  },
  {
    id: 'urban-life-documentary',
    title: 'Urban Life Documentary',
    slug: 'urban-life-documentary',
    description: 'A documentary series exploring the daily lives, struggles, and triumphs of people in urban environments.',
    location: 'Downtown Metro Area',
    featuredImage: 'https://blob.vercel-storage.com/urban-life-documentary/featured-image.jpg',
    contentBlocks: [
      {
        id: '11',
        type: 'image',
        order: 0,
        src: 'https://blob.vercel-storage.com/urban-life-documentary/street-vendor.jpg',
        alt: 'Street vendor at work',
        alignment: 'center',
        aspectRatio: 'portrait'
      },
      {
        id: '12',
        type: 'quote',
        order: 1,
        text: 'In the city, every face tells a story.',
        author: 'Urban Photographer',
        alignment: 'center',
        style: 'highlighted'
      },
      {
        id: '13',
        type: 'image-gallery',
        order: 2,
        images: [
          {
            src: 'https://blob.vercel-storage.com/urban-life-documentary/commuter-rush.jpg',
            alt: 'Morning commuter rush',
            caption: 'The daily rush hour'
          },
          {
            src: 'https://blob.vercel-storage.com/urban-life-documentary/street-artist.jpg',
            alt: 'Street artist performing',
            caption: 'Busker sharing their art'
          },
          {
            src: 'https://blob.vercel-storage.com/urban-life-documentary/food-truck.jpg',
            alt: 'Food truck scene',
            caption: 'Late night food truck gathering'
          },
          {
            src: 'https://blob.vercel-storage.com/urban-life-documentary/rooftop-view.jpg',
            alt: 'City skyline from rooftop',
            caption: 'Urban landscape from above'
          }
        ],
        layout: 'masonry',
        columns: 2
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: true,
    tags: ['urban', 'documentary', 'people', 'city-life']
  },
  {
    id: 'cultural-heritage-monuments',
    title: 'Cultural Heritage & Monuments',
    slug: 'cultural-heritage-monuments',
    description: 'Preserving the stories of ancient monuments and traditional art forms through photography.',
    location: 'Historical Sites',
    featuredImage: 'https://blob.vercel-storage.com/cultural-heritage-monuments/featured-image.jpg',
    contentBlocks: [
      {
        id: '18',
        type: 'image',
        order: 0,
        src: 'https://blob.vercel-storage.com/cultural-heritage-monuments/ancient-temple.jpg',
        alt: 'Ancient temple architecture',
        alignment: 'center',
        aspectRatio: 'landscape'
      },
      {
        id: '19',
        type: 'image-gallery',
        order: 1,
        images: [
          {
            src: 'https://blob.vercel-storage.com/cultural-heritage-monuments/traditional-craftsman.jpg',
            alt: 'Traditional craftsman at work',
            caption: 'Master craftsman creating traditional pottery'
          },
          {
            src: 'https://blob.vercel-storage.com/cultural-heritage-monuments/historical-monument.jpg',
            alt: 'Historical monument detail',
            caption: 'Intricate stone carvings on ancient monument'
          },
          {
            src: 'https://blob.vercel-storage.com/cultural-heritage-monuments/festival-dance.jpg',
            alt: 'Traditional festival dance',
            caption: 'Cultural festival performance'
          },
          {
            src: 'https://blob.vercel-storage.com/cultural-heritage-monuments/textile-art.jpg',
            alt: 'Traditional textile art',
            caption: 'Handwoven traditional textiles'
          },
          {
            src: 'https://blob.vercel-storage.com/cultural-heritage-monuments/ceremonial-mask.jpg',
            alt: 'Ceremonial mask',
            caption: 'Traditional ceremonial mask'
          },
          {
            src: 'https://blob.vercel-storage.com/cultural-heritage-monuments/ancient-script.jpg',
            alt: 'Ancient script inscription',
            caption: 'Preserved ancient inscriptions'
          }
        ],
        layout: 'grid',
        columns: 3
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: true,
    tags: ['heritage', 'monuments', 'culture', 'traditional-art']
  }
];

// GET /api/projects - Get all projects
export async function GET() {
  try {
    // Initialize database if needed
    await initializeDatabase();

    const projects = await getAllProjects(true); // published only

    // If no projects exist, create sample projects
    if (projects.length === 0) {
      console.log('No projects found, creating sample projects...');

      for (const projectData of sampleProjects) {
        // Create the project
        const newProject = await createProject({
          id: projectData.id,
          title: projectData.title,
          slug: projectData.slug,
          description: projectData.description,
          location: projectData.location,
          featuredImage: projectData.featuredImage,
          published: projectData.published,
          tags: projectData.tags
        });

        // Create content blocks
        for (const block of projectData.contentBlocks) {
          await createContentBlock({
            id: block.id,
            projectId: newProject.id,
            type: block.type,
            order: block.order,
            content: 'content' in block ? (block as any).content : undefined,
            textAlign: 'textAlign' in block ? (block as any).textAlign : undefined,
            fontSize: 'fontSize' in block ? (block as any).fontSize : undefined,
            fontWeight: 'fontWeight' in block ? (block as any).fontWeight : undefined,
            src: 'src' in block ? (block as any).src : undefined,
            alt: 'alt' in block ? (block as any).alt : undefined,
            caption: 'caption' in block ? (block as any).caption : undefined,
            aspectRatio: 'aspectRatio' in block ? (block as any).aspectRatio : undefined,
            alignment: 'alignment' in block ? (block as any).alignment : undefined,
            images: 'images' in block ? (block as any).images : undefined,
            layout: 'layout' in block ? (block as any).layout : undefined,
            columns: 'columns' in block ? (block as any).columns : undefined,
            text: 'text' in block ? (block as any).text : undefined,
            author: 'author' in block ? (block as any).author : undefined,
            style: 'style' in block ? (block as any).style : undefined,
            height: 'height' in block ? (block as any).height : undefined
          });
        }
      }

      // Return the newly created projects
      const newProjects = await getAllProjects(true);
      return NextResponse.json({
        success: true,
        projects: newProjects
      });
    }

    return NextResponse.json({
      success: true,
      projects
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
    const projectData: Project = await request.json();

    // Initialize database if needed
    await initializeDatabase();

    // Validate required fields
    if (!projectData.title || !projectData.slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    // Create the project
    const newProject = await createProject({
      id: projectData.id || projectData.slug,
      title: projectData.title,
      slug: projectData.slug,
      description: projectData.description,
      location: projectData.location,
      featuredImage: projectData.featuredImage,
      published: projectData.published || false,
      tags: projectData.tags
    });

    // Create content blocks if provided
    if (projectData.contentBlocks && projectData.contentBlocks.length > 0) {
      for (const block of projectData.contentBlocks) {
        await createContentBlock({
          id: block.id,
          projectId: newProject.id,
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