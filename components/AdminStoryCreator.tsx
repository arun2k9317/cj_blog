"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Container,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  NumberInput,
  Switch,
  ActionIcon,
  Loader,
} from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  IconArrowDown,
  IconArrowUp,
  IconTrash,
  IconX,
  IconGripVertical,
} from "@tabler/icons-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { Project, ContentBlock } from "@/types/project";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface GalleryImage {
  id?: string;
  url: string;
  path?: string;
  filename?: string;
  folder?: string;
}

interface AdminStoryCreatorProps {
  initialProject?: Project | null;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const generateId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 11)}`;

export default function AdminStoryCreator({
  initialProject,
}: AdminStoryCreatorProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showGallery, setShowGallery] = useState(false);
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(
    null
  );
  const [selectedBlockType, setSelectedBlockType] = useState<string | null>(
    null
  );
  const isEditing = Boolean(initialProject);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update order property
        return newItems.map((block, idx) => ({ ...block, order: idx }));
      });
    }
  };

  useEffect(() => {
    if (!slugEdited && !isEditing) {
      setSlug(slugify(title));
    }
  }, [title, slugEdited, isEditing]);

  useEffect(() => {
    if (initialProject) {
      setTitle(initialProject.title || "");
      setSlug(initialProject.slug || "");
      setSlugEdited(true);
      setBlocks(initialProject.contentBlocks || []);
    }
  }, [initialProject]);

  // Fetch gallery images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoadingImages(true);
        const folderParam = selectedFolder
          ? `?folder=${encodeURIComponent(selectedFolder)}`
          : "";
        const response = await fetch(`/api/gallery-images${folderParam}`);
        if (!response.ok) throw new Error("Failed to fetch images");
        const data = (await response.json()) as {
          images: GalleryImage[];
          folders?: string[];
        };

        // Sort by timestamp (newest first)
        const sortedImages = data.images.sort((a, b) => {
          const getTimestamp = (img: GalleryImage): number => {
            const filename = img.filename || img.path || img.url;
            const match = filename.match(/-(\d+)\./);
            return match ? parseInt(match[1], 10) : 0;
          };
          return getTimestamp(b) - getTimestamp(a);
        });

        setGalleryImages(sortedImages);
        if (data.folders) {
          setFolders(data.folders);
        }
      } catch (error) {
        console.error("Error fetching gallery images:", error);
      } finally {
        setLoadingImages(false);
      }
    };

    void fetchImages();
  }, [selectedFolder]);

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    setSlug(slugify(value));
  };

  const addBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: generateId(type),
      type,
      order: blocks.length,
    } as ContentBlock;

    // Initialize block with default values based on type
    switch (type) {
      case "title":
        (newBlock as any).text = "";
        (newBlock as any).fontSize = "large";
        (newBlock as any).alignment = "left";
        break;
      case "description":
        (newBlock as any).content = "";
        (newBlock as any).lineHeight = 1.6;
        (newBlock as any).maxWidth = 800;
        break;
      case "story-image":
        (newBlock as any).src = "";
        (newBlock as any).alt = "";
        (newBlock as any).size = "full-width";
        (newBlock as any).aspectRatioLock = false;
        break;
      case "image-label":
        (newBlock as any).text = "";
        (newBlock as any).placement = "below";
        (newBlock as any).italic = false;
        break;
      case "quote":
        (newBlock as any).text = "";
        (newBlock as any).alignment = "center";
        break;
      case "divider":
        (newBlock as any).spacingTop = 20;
        (newBlock as any).spacingBottom = 20;
        break;
      case "footer":
        (newBlock as any).pageWidth = "medium";
        break;
    }

    setBlocks([...blocks, newBlock]);
    setEditingBlockIndex(blocks.length);
    setSelectedBlockType(null); // Reset the dropdown
  };

  const updateBlock = (index: number, updates: Partial<ContentBlock>) => {
    setBlocks((prev) =>
      prev.map((block, idx) =>
        idx === index ? { ...block, ...updates } : block
      )
    );
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      return updated.map((block, idx) => ({ ...block, order: idx }));
    });
    if (editingBlockIndex === index) {
      setEditingBlockIndex(null);
    } else if (editingBlockIndex !== null && editingBlockIndex > index) {
      setEditingBlockIndex(editingBlockIndex - 1);
    }
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    setBlocks((prev) => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const updated = [...prev];
      const [movedBlock] = updated.splice(index, 1);
      updated.splice(newIndex, 0, movedBlock);
      return updated.map((block, idx) => ({ ...block, order: idx }));
    });
  };

  const selectImageFromGallery = (image: GalleryImage) => {
    if (editingBlockIndex !== null) {
      const block = blocks[editingBlockIndex];
      if (block.type === "story-image") {
        updateBlock(editingBlockIndex, {
          ...block,
          src: image.url,
          alt: image.filename || image.path || "Image",
        } as any);
        setShowGallery(false);
      }
    }
  };

  const filteredGalleryImages = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return galleryImages;
    }
    return galleryImages.filter((image) => {
      const filename = image.filename || image.path || image.url;
      return filename.toLowerCase().includes(query);
    });
  }, [galleryImages, searchTerm]);

  const validateForm = () => {
    if (!title.trim()) {
      setErrorMessage("Story title is required.");
      return false;
    }
    if (!slug.trim()) {
      setErrorMessage("Slug cannot be empty.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    const now = new Date().toISOString();
    const projectId =
      (isEditing && initialProject?.id) || slug || generateId("story");

    const payload: Project = {
      id: projectId,
      title: title.trim(),
      slug,
      description: undefined,
      location: undefined,
      featuredImage:
        blocks.find((b) => b.type === "story-image")?.src || undefined,
      contentBlocks: blocks,
      createdAt: initialProject?.createdAt || now,
      updatedAt: now,
      published: initialProject?.published ?? false,
      tags: initialProject?.tags ?? ["story"],
      kind: "story",
    };

    try {
      setSaving(true);
      const url = isEditing
        ? `/api/projects/${encodeURIComponent(projectId)}`
        : "/api/projects";
      const method = isEditing ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        const errorMessage =
          data.error ||
          (isEditing ? "Failed to update story" : "Failed to create story");

        // If it's a duplicate key error, suggest changing the slug
        if (
          response.status === 409 ||
          errorMessage.includes("already exists")
        ) {
          throw new Error(
            `${errorMessage} Try changing the slug to something unique.`
          );
        }

        throw new Error(errorMessage);
      }

      setSuccessMessage(
        isEditing
          ? "Story updated successfully. Redirecting…"
          : "Story created successfully. Redirecting…"
      );
      setTimeout(() => {
        router.refresh();
        router.push("/admin");
      }, 1200);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : isEditing
          ? "Failed to update story."
          : "Failed to create story."
      );
    } finally {
      setSaving(false);
    }
  };

  // Sortable block wrapper component
  const SortableBlock = ({
    block,
    index,
    children,
  }: {
    block: ContentBlock;
    index: number;
    children: React.ReactNode;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: block.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div ref={setNodeRef} style={style}>
        <Paper
          p="md"
          withBorder
          style={{
            backgroundColor: isDark
              ? "var(--mantine-color-dark-5)"
              : "var(--mantine-color-white)",
            borderColor: isDark
              ? "var(--mantine-color-dark-4)"
              : "var(--mantine-color-gray-3)",
            position: "relative",
          }}
        >
          <Group
            gap="xs"
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              zIndex: 10,
            }}
          >
            <ActionIcon
              size="sm"
              variant="subtle"
              {...attributes}
              {...listeners}
              style={{ cursor: "grab" }}
              title="Drag to reorder"
            >
              <IconGripVertical size={16} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={() => moveBlock(index, "up")}
              disabled={index === 0}
            >
              <IconArrowUp size={16} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={() => moveBlock(index, "down")}
              disabled={index === blocks.length - 1}
            >
              <IconArrowDown size={16} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="red"
              onClick={() => removeBlock(index)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
          {children}
        </Paper>
      </div>
    );
  };

  const renderBlockEditor = (block: ContentBlock, index: number) => {
    const isEditing = editingBlockIndex === index;

    switch (block.type) {
      case "title":
        const titleBlock = block as any;
        return (
          <Stack gap="sm" style={{ paddingTop: "40px" }}>
            <Text size="sm" fw={500} c={isDark ? "gray.0" : "dark.9"}>
              Title Block
            </Text>
            <TextInput
              label="Title"
              value={titleBlock.text || ""}
              onChange={(e) =>
                updateBlock(index, { ...block, text: e.target.value } as any)
              }
              placeholder="Enter title"
            />
            <TextInput
              label="Subtitle (optional)"
              value={titleBlock.subtitle || ""}
              onChange={(e) =>
                updateBlock(index, {
                  ...block,
                  subtitle: e.target.value,
                } as any)
              }
              placeholder="Enter subtitle"
            />
            <Group>
              <Select
                label="Font Size"
                value={titleBlock.fontSize || "large"}
                onChange={(value) =>
                  updateBlock(index, { ...block, fontSize: value } as any)
                }
                data={[
                  { value: "small", label: "Small" },
                  { value: "medium", label: "Medium" },
                  { value: "large", label: "Large" },
                  { value: "xl", label: "Extra Large" },
                  { value: "2xl", label: "2X Large" },
                  { value: "3xl", label: "3X Large" },
                ]}
                styles={{
                  input: {
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-5)"
                      : "var(--mantine-color-white)",
                  },
                  dropdown: {
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-6)"
                      : "var(--mantine-color-white)",
                  },
                  option: {
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-6)"
                      : "var(--mantine-color-white)",
                    "&:hover": {
                      backgroundColor: isDark
                        ? "var(--mantine-color-dark-5)"
                        : "var(--mantine-color-gray-1)",
                    },
                  },
                }}
              />
              <Select
                label="Alignment"
                value={titleBlock.alignment || "left"}
                onChange={(value) =>
                  updateBlock(index, { ...block, alignment: value } as any)
                }
                data={[
                  { value: "left", label: "Left" },
                  { value: "center", label: "Center" },
                  { value: "right", label: "Right" },
                ]}
                styles={{
                  input: {
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-5)"
                      : "var(--mantine-color-white)",
                  },
                  dropdown: {
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-6)"
                      : "var(--mantine-color-white)",
                  },
                  option: {
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-6)"
                      : "var(--mantine-color-white)",
                    "&:hover": {
                      backgroundColor: isDark
                        ? "var(--mantine-color-dark-5)"
                        : "var(--mantine-color-gray-1)",
                    },
                  },
                }}
              />
            </Group>
          </Stack>
        );

      case "description":
        const descBlock = block as any;
        return (
          <Stack gap="sm" style={{ paddingTop: "40px" }}>
            <Text size="sm" fw={500} c={isDark ? "gray.0" : "dark.9"}>
              Description Block
            </Text>
            <Textarea
              label="Content (supports basic HTML formatting)"
              value={descBlock.content || ""}
              onChange={(e) =>
                updateBlock(index, {
                  ...block,
                  content: e.target.value,
                } as any)
              }
              placeholder="Enter description text..."
              minRows={4}
            />
            <Group>
              <NumberInput
                label="Line Height"
                value={descBlock.lineHeight || 1.6}
                onChange={(value) =>
                  updateBlock(index, {
                    ...block,
                    lineHeight: Number(value),
                  } as any)
                }
                min={1}
                max={3}
                step={0.1}
                style={{ flex: 1 }}
              />
              <NumberInput
                label="Max Width (px)"
                value={descBlock.maxWidth || 800}
                onChange={(value) =>
                  updateBlock(index, {
                    ...block,
                    maxWidth: Number(value),
                  } as any)
                }
                min={200}
                max={1200}
                style={{ flex: 1 }}
              />
            </Group>
          </Stack>
        );

      case "story-image":
        const imageBlock = block as any;
        return (
          <Stack gap="sm" style={{ paddingTop: "40px" }}>
            <Text size="sm" fw={500} c={isDark ? "gray.0" : "dark.9"}>
              Image Block
            </Text>
            {imageBlock.src && (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "200px",
                  borderRadius: "var(--mantine-radius-md)",
                  overflow: "hidden",
                  backgroundColor: isDark
                    ? "var(--mantine-color-dark-4)"
                    : "var(--mantine-color-gray-1)",
                }}
              >
                <Image
                  src={imageBlock.src}
                  alt={imageBlock.alt || "Preview"}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setEditingBlockIndex(index);
                setShowGallery(true);
              }}
            >
              {imageBlock.src ? "Change Image" : "Select Image from Gallery"}
            </Button>
            <TextInput
              label="Alt Text"
              value={imageBlock.alt || ""}
              onChange={(e) =>
                updateBlock(index, { ...block, alt: e.target.value } as any)
              }
              placeholder="Enter alt text"
            />
            <Group>
              <Select
                label="Size"
                value={
                  typeof imageBlock.size === "number"
                    ? "custom"
                    : imageBlock.size || "full-width"
                }
                onChange={(value) => {
                  if (value === "custom") {
                    updateBlock(index, { ...block, size: 600 } as any);
                  } else {
                    updateBlock(index, { ...block, size: value } as any);
                  }
                }}
                data={[
                  { value: "full-width", label: "Full Width" },
                  { value: "narrow", label: "Narrow" },
                  { value: "custom", label: "Custom (px)" },
                ]}
                styles={{
                  input: {
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-5)"
                      : "var(--mantine-color-white)",
                  },
                  dropdown: {
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-6)"
                      : "var(--mantine-color-white)",
                  },
                  option: {
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-6)"
                      : "var(--mantine-color-white)",
                    "&:hover": {
                      backgroundColor: isDark
                        ? "var(--mantine-color-dark-5)"
                        : "var(--mantine-color-gray-1)",
                    },
                  },
                }}
              />
              {typeof imageBlock.size === "number" && (
                <NumberInput
                  label="Custom Width (px)"
                  value={imageBlock.size}
                  onChange={(value) =>
                    updateBlock(index, {
                      ...block,
                      size: Number(value),
                    } as any)
                  }
                  min={200}
                  max={1200}
                  style={{ flex: 1 }}
                />
              )}
            </Group>
            <Group>
              <Switch
                label="Lock Aspect Ratio"
                checked={imageBlock.aspectRatioLock || false}
                onChange={(e) =>
                  updateBlock(index, {
                    ...block,
                    aspectRatioLock: e.currentTarget.checked,
                  } as any)
                }
              />
              {imageBlock.aspectRatioLock && (
                <Select
                  label="Aspect Ratio"
                  value={imageBlock.aspectRatio || "auto"}
                  onChange={(value) =>
                    updateBlock(index, {
                      ...block,
                      aspectRatio: value,
                    } as any)
                  }
                  data={[
                    { value: "auto", label: "Auto" },
                    { value: "square", label: "Square" },
                    { value: "landscape", label: "Landscape" },
                    { value: "portrait", label: "Portrait" },
                    { value: "wide", label: "Wide" },
                    { value: "tall", label: "Tall" },
                  ]}
                  styles={{
                    input: {
                      color: isDark
                        ? "var(--mantine-color-gray-0)"
                        : "var(--mantine-color-dark-9)",
                      backgroundColor: isDark
                        ? "var(--mantine-color-dark-5)"
                        : "var(--mantine-color-white)",
                    },
                    dropdown: {
                      backgroundColor: isDark
                        ? "var(--mantine-color-dark-6)"
                        : "var(--mantine-color-white)",
                    },
                    option: {
                      color: isDark
                        ? "var(--mantine-color-gray-0)"
                        : "var(--mantine-color-dark-9)",
                      backgroundColor: isDark
                        ? "var(--mantine-color-dark-6)"
                        : "var(--mantine-color-white)",
                      "&:hover": {
                        backgroundColor: isDark
                          ? "var(--mantine-color-dark-5)"
                          : "var(--mantine-color-gray-1)",
                      },
                    },
                  }}
                />
              )}
            </Group>
          </Stack>
        );

      case "image-label":
        const labelBlock = block as any;
        return (
          <Stack gap="sm" style={{ paddingTop: "40px" }}>
            <Text size="sm" fw={500} c={isDark ? "gray.0" : "dark.9"}>
              Image Label Block (tied to previous image)
            </Text>
            <TextInput
              label="Label Text"
              value={labelBlock.text || ""}
              onChange={(e) =>
                updateBlock(index, { ...block, text: e.target.value } as any)
              }
              placeholder="Enter image label/caption"
            />
            <Group>
              <Select
                label="Placement"
                value={labelBlock.placement || "below"}
                onChange={(value) =>
                  updateBlock(index, { ...block, placement: value } as any)
                }
                data={[
                  { value: "below", label: "Below Image" },
                  { value: "overlay", label: "Overlay on Image" },
                ]}
                styles={{
                  input: {
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-5)"
                      : "var(--mantine-color-white)",
                  },
                  dropdown: {
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-6)"
                      : "var(--mantine-color-white)",
                  },
                  option: {
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-6)"
                      : "var(--mantine-color-white)",
                    "&:hover": {
                      backgroundColor: isDark
                        ? "var(--mantine-color-dark-5)"
                        : "var(--mantine-color-gray-1)",
                    },
                  },
                }}
              />
              <Switch
                label="Italic"
                checked={labelBlock.italic || false}
                onChange={(e) =>
                  updateBlock(index, {
                    ...block,
                    italic: e.currentTarget.checked,
                  } as any)
                }
              />
            </Group>
          </Stack>
        );

      case "quote":
        const quoteBlock = block as any;
        return (
          <Stack gap="sm" style={{ paddingTop: "40px" }}>
            <Text size="sm" fw={500} c={isDark ? "gray.0" : "dark.9"}>
              Quote Block
            </Text>
            <Textarea
              label="Quote Text"
              value={quoteBlock.text || ""}
              onChange={(e) =>
                updateBlock(index, { ...block, text: e.target.value } as any)
              }
              placeholder="Enter quote text..."
              minRows={3}
            />
            <TextInput
              label="Author (optional)"
              value={quoteBlock.author || ""}
              onChange={(e) =>
                updateBlock(index, {
                  ...block,
                  author: e.target.value,
                } as any)
              }
              placeholder="Enter author name"
            />
            <Select
              label="Alignment"
              value={quoteBlock.alignment || "center"}
              onChange={(value) =>
                updateBlock(index, { ...block, alignment: value } as any)
              }
              data={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
              styles={{
                input: {
                  color: isDark
                    ? "var(--mantine-color-gray-0)"
                    : "var(--mantine-color-dark-9)",
                  backgroundColor: isDark
                    ? "var(--mantine-color-dark-5)"
                    : "var(--mantine-color-white)",
                },
                dropdown: {
                  backgroundColor: isDark
                    ? "var(--mantine-color-dark-6)"
                    : "var(--mantine-color-white)",
                },
                option: {
                  color: isDark
                    ? "var(--mantine-color-gray-0)"
                    : "var(--mantine-color-dark-9)",
                  backgroundColor: isDark
                    ? "var(--mantine-color-dark-6)"
                    : "var(--mantine-color-white)",
                  "&:hover": {
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-5)"
                      : "var(--mantine-color-gray-1)",
                  },
                },
              }}
            />
          </Stack>
        );

      case "divider":
        const dividerBlock = block as any;
        return (
          <Stack gap="sm" style={{ paddingTop: "40px" }}>
            <Text size="sm" fw={500} c={isDark ? "gray.0" : "dark.9"}>
              Divider Block
            </Text>
            <Group>
              <NumberInput
                label="Spacing Top (px)"
                value={dividerBlock.spacingTop || 20}
                onChange={(value) =>
                  updateBlock(index, {
                    ...block,
                    spacingTop: Number(value),
                  } as any)
                }
                min={0}
                max={200}
                style={{ flex: 1 }}
              />
              <NumberInput
                label="Spacing Bottom (px)"
                value={dividerBlock.spacingBottom || 20}
                onChange={(value) =>
                  updateBlock(index, {
                    ...block,
                    spacingBottom: Number(value),
                  } as any)
                }
                min={0}
                max={200}
                style={{ flex: 1 }}
              />
            </Group>
          </Stack>
        );

      case "footer":
        const footerBlock = block as any;
        return (
          <Stack gap="sm" style={{ paddingTop: "40px" }}>
            <Text size="sm" fw={500} c={isDark ? "gray.0" : "dark.9"}>
              Footer Block
            </Text>
            <TextInput
              label="Text (optional)"
              value={footerBlock.text || ""}
              onChange={(e) =>
                updateBlock(index, { ...block, text: e.target.value } as any)
              }
              placeholder="Enter footer text"
            />
            <TextInput
              label="Date (optional)"
              value={footerBlock.date || ""}
              onChange={(e) =>
                updateBlock(index, { ...block, date: e.target.value } as any)
              }
              placeholder="Enter date"
            />
            <TextInput
              label="Credits (optional)"
              value={footerBlock.credits || ""}
              onChange={(e) =>
                updateBlock(index, {
                  ...block,
                  credits: e.target.value,
                } as any)
              }
              placeholder="Enter credits"
            />
            <Select
              label="Page Width"
              value={footerBlock.pageWidth || "medium"}
              onChange={(value) =>
                updateBlock(index, { ...block, pageWidth: value } as any)
              }
              data={[
                { value: "full", label: "Full Width" },
                { value: "medium", label: "Medium" },
                { value: "narrow", label: "Narrow" },
              ]}
              styles={{
                input: {
                  color: isDark
                    ? "var(--mantine-color-gray-0)"
                    : "var(--mantine-color-dark-9)",
                  backgroundColor: isDark
                    ? "var(--mantine-color-dark-5)"
                    : "var(--mantine-color-white)",
                },
                dropdown: {
                  backgroundColor: isDark
                    ? "var(--mantine-color-dark-6)"
                    : "var(--mantine-color-white)",
                },
                option: {
                  color: isDark
                    ? "var(--mantine-color-gray-0)"
                    : "var(--mantine-color-dark-9)",
                  backgroundColor: isDark
                    ? "var(--mantine-color-dark-6)"
                    : "var(--mantine-color-white)",
                  "&:hover": {
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-5)"
                      : "var(--mantine-color-gray-1)",
                  },
                },
              }}
            />
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Container
      size="lg"
      py="md"
      px="sm"
      style={{
        backgroundColor: isDark
          ? "var(--mantine-color-dark-7)"
          : "var(--mantine-color-gray-0)",
        minHeight: "100vh",
        borderRadius: "var(--mantine-radius-lg)",
      }}
    >
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title
              order={2}
              size="1.5rem"
              c={
                isDark
                  ? "var(--mantine-color-gray-0)"
                  : "var(--mantine-color-dark-9)"
              }
            >
              {isEditing ? "Edit" : "New"} Story
            </Title>
            <Text size="sm" c="dimmed">
              {isEditing
                ? "Update this story with new content blocks."
                : "Build a story using content blocks and images from the gallery."}
            </Text>
          </div>
          <Group gap="xs">
            <Button
              variant="outline"
              size="xs"
              color={isDark ? "gray" : "dark"}
              leftSection={<IconX size={16} />}
              onClick={() => router.push("/admin")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              size="xs"
              color={isDark ? "gray" : "dark"}
              onClick={handleSave}
              loading={saving}
              disabled={saving}
            >
              {isEditing ? "Update Story" : "Create Story"}
            </Button>
          </Group>
        </Group>

        {errorMessage && (
          <Paper
            p="sm"
            withBorder
            style={{ backgroundColor: "var(--mantine-color-red-1)" }}
          >
            <Text size="sm" c="red">
              {errorMessage}
            </Text>
          </Paper>
        )}

        {successMessage && (
          <Paper
            p="sm"
            withBorder
            style={{ backgroundColor: "var(--mantine-color-green-1)" }}
          >
            <Text size="sm" c="green">
              {successMessage}
            </Text>
          </Paper>
        )}

        <Paper
          p="md"
          withBorder
          style={{
            backgroundColor: isDark
              ? "var(--mantine-color-dark-6)"
              : "var(--mantine-color-white)",
            borderColor: isDark
              ? "var(--mantine-color-dark-4)"
              : "var(--mantine-color-gray-3)",
          }}
        >
          <Stack gap="md">
            <TextInput
              label="Story Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter story title"
              required
            />
            <TextInput
              label="Slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="story-slug"
              required
            />
          </Stack>
        </Paper>

        <Paper
          p="md"
          withBorder
          style={{
            backgroundColor: isDark
              ? "var(--mantine-color-dark-6)"
              : "var(--mantine-color-white)",
            borderColor: isDark
              ? "var(--mantine-color-dark-4)"
              : "var(--mantine-color-gray-3)",
          }}
        >
          <Stack gap="md">
            <Text size="sm" fw={500} c={isDark ? "gray.0" : "dark.9"}>
              Content Blocks
            </Text>

            {blocks.length === 0 && (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                No content blocks yet. Add a block to get started.
              </Text>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <Stack gap="md">
                  {blocks.map((block, index) => (
                    <SortableBlock key={block.id} block={block} index={index}>
                      {renderBlockEditor(block, index)}
                    </SortableBlock>
                  ))}
                </Stack>
              </SortableContext>
            </DndContext>

            {/* Add Block button at the bottom */}
            <Paper
              p="md"
              withBorder
              mt="md"
              style={{
                backgroundColor: isDark
                  ? "var(--mantine-color-dark-5)"
                  : "var(--mantine-color-white)",
                borderColor: isDark
                  ? "var(--mantine-color-dark-4)"
                  : "var(--mantine-color-gray-3)",
              }}
            >
              <Select
                placeholder="Add Block"
                value={selectedBlockType}
                data={[
                  { value: "title", label: "Title" },
                  { value: "description", label: "Description" },
                  { value: "story-image", label: "Image" },
                  { value: "image-label", label: "Image Label" },
                  { value: "quote", label: "Quote" },
                  { value: "divider", label: "Divider" },
                  { value: "footer", label: "Footer" },
                ]}
                onChange={(value) => {
                  if (value) {
                    addBlock(value as ContentBlock["type"]);
                  }
                }}
                searchable
                clearable
                styles={{
                  input: {
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-5)"
                      : "var(--mantine-color-white)",
                  },
                  dropdown: {
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-6)"
                      : "var(--mantine-color-white)",
                  },
                  option: {
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-6)"
                      : "var(--mantine-color-white)",
                    "&:hover": {
                      backgroundColor: isDark
                        ? "var(--mantine-color-dark-5)"
                        : "var(--mantine-color-gray-1)",
                    },
                  },
                }}
              />
            </Paper>
          </Stack>
        </Paper>

        {showGallery && (
          <Paper
            p="md"
            withBorder
            style={{
              backgroundColor: isDark
                ? "var(--mantine-color-dark-6)"
                : "var(--mantine-color-white)",
              borderColor: isDark
                ? "var(--mantine-color-dark-4)"
                : "var(--mantine-color-gray-3)",
            }}
          >
            <Stack gap="md">
              <Group justify="space-between">
                <Text size="sm" fw={500} c={isDark ? "gray.0" : "dark.9"}>
                  Select Image from Gallery
                </Text>
                <ActionIcon
                  variant="subtle"
                  onClick={() => {
                    setShowGallery(false);
                    setEditingBlockIndex(null);
                  }}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
              <Group>
                <Select
                  placeholder="All folders"
                  data={[
                    { value: "", label: "All folders" },
                    ...folders.map((f) => ({ value: f, label: f })),
                  ]}
                  value={selectedFolder || ""}
                  onChange={(value) => setSelectedFolder(value || null)}
                  style={{ minWidth: "150px" }}
                  size="xs"
                  clearable
                  styles={{
                    input: {
                      color: isDark
                        ? "var(--mantine-color-gray-0)"
                        : "var(--mantine-color-dark-9)",
                      backgroundColor: isDark
                        ? "var(--mantine-color-dark-5)"
                        : "var(--mantine-color-white)",
                    },
                    dropdown: {
                      backgroundColor: isDark
                        ? "var(--mantine-color-dark-6)"
                        : "var(--mantine-color-white)",
                    },
                    option: {
                      color: isDark
                        ? "var(--mantine-color-gray-0)"
                        : "var(--mantine-color-dark-9)",
                      backgroundColor: isDark
                        ? "var(--mantine-color-dark-6)"
                        : "var(--mantine-color-white)",
                      "&:hover": {
                        backgroundColor: isDark
                          ? "var(--mantine-color-dark-5)"
                          : "var(--mantine-color-gray-1)",
                      },
                    },
                  }}
                />
                <TextInput
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ flex: 1 }}
                  size="xs"
                />
              </Group>
              {loadingImages ? (
                <Loader size="sm" />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: "var(--mantine-spacing-sm)",
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}
                >
                  {filteredGalleryImages.map((image) => (
                    <div
                      key={image.url}
                      onClick={() => selectImageFromGallery(image)}
                      style={{
                        position: "relative",
                        aspectRatio: "1",
                        borderRadius: "var(--mantine-radius-md)",
                        overflow: "hidden",
                        cursor: "pointer",
                        border: "2px solid transparent",
                        transition: "border-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor =
                          "var(--mantine-color-blue-5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                    >
                      <Image
                        src={image.url}
                        alt={image.filename || "Gallery image"}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="150px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
