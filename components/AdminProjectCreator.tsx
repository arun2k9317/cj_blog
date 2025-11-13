"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Anchor,
  Badge,
  Button,
  Container,
  Grid,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  IconArrowDown,
  IconArrowUp,
  IconListCheck,
  IconPhotoPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import type { Project } from "@/types/project";

type ProjectKind = "project" | "story";

interface GalleryImage {
  id?: string;
  url: string;
  path?: string;
  filename?: string;
}

interface SelectedImage extends GalleryImage {
  caption?: string;
  order: number;
}

interface AdminProjectCreatorProps {
  kind: ProjectKind;
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

export default function AdminProjectCreator({
  kind,
  initialProject,
}: AdminProjectCreatorProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const isEditing = Boolean(initialProject);

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
      setDescription(initialProject.description || "");
      setLocation(initialProject.location || "");
      setSelectedImages(() => {
        const galleryBlock = initialProject.contentBlocks.find(
          (block) => block.type === "image-gallery"
        );
        if (
          galleryBlock &&
          "images" in galleryBlock &&
          Array.isArray(galleryBlock.images)
        ) {
          return galleryBlock.images.map((image, index) => ({
            url: image.src,
            caption: image.caption || "",
            order: index,
          }));
        }
        const featured = initialProject.featuredImage;
        return featured
          ? [
              {
                url: featured,
                caption: initialProject.description || "",
                order: 0,
              },
            ]
          : [];
      });
    }
  }, [initialProject]);

  useEffect(() => {
    const fetchImages = async () => {
      setLoadingImages(true);
      try {
        const response = await fetch("/api/gallery-images");
        if (!response.ok) {
          throw new Error("Failed to load gallery images");
        }
        const data = (await response.json()) as { images: GalleryImage[] };
        setGalleryImages(data.images || []);
      } catch (error) {
        console.error(error);
        setErrorMessage(
          "Unable to load gallery images. Please refresh the page or try again later."
        );
      } finally {
        setLoadingImages(false);
      }
    };

    void fetchImages();
  }, []);

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    setSlug(slugify(value));
  };

  const toggleImageSelection = (image: GalleryImage) => {
    setSelectedImages((prev) => {
      const existingIndex = prev.findIndex((item) => item.url === image.url);
      if (existingIndex >= 0) {
        const updated = prev.filter((item) => item.url !== image.url);
        return updated.map((item, index) => ({
          ...item,
          order: index,
        }));
      }

      return [
        ...prev,
        {
          ...image,
          caption: "",
          order: prev.length,
        },
      ];
    });
  };

  const updateCaption = (index: number, caption: string) => {
    setSelectedImages((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              caption,
            }
          : item
      )
    );
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({
          ...item,
          order: idx,
        }))
    );
  };

  const moveSelectedImage = (index: number, direction: "up" | "down") => {
    setSelectedImages((prev) => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const updated = [...prev];
      const [movedItem] = updated.splice(index, 1);
      updated.splice(newIndex, 0, movedItem);
      return updated.map((item, idx) => ({
        ...item,
        order: idx,
      }));
    });
  };

  const selectedUrls = useMemo(
    () => new Set(selectedImages.map((image) => image.url)),
    [selectedImages]
  );

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
      setErrorMessage("Project title is required.");
      return false;
    }

    if (!slug.trim()) {
      setErrorMessage("Slug cannot be empty.");
      return false;
    }

    if (selectedImages.length === 0) {
      setErrorMessage("Select at least one image for the project.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedLocation = location.trim();
    const now = new Date().toISOString();
    const projectId =
      (isEditing && initialProject?.id) || slug || generateId("project");
    const existingGalleryBlock = initialProject?.contentBlocks.find(
      (block) => block.type === "image-gallery"
    );
    const galleryBlockId =
      (existingGalleryBlock && existingGalleryBlock.id) ||
      generateId("gallery");

    const payload: (Project & { kind?: ProjectKind }) = {
      id: projectId,
      title: trimmedTitle,
      slug,
      description: trimmedDescription || undefined,
      location: trimmedLocation || undefined,
      featuredImage: selectedImages[0]?.url,
      contentBlocks: [
        {
          id: galleryBlockId,
          type: "image-gallery",
          order: 0,
          images: selectedImages.map((image, index) => ({
            src: image.url,
            alt:
              image.caption?.trim() ||
              `${trimmedTitle} - Image ${index + 1}`,
            caption: image.caption?.trim() || undefined,
          })),
          layout: "grid",
          columns: Math.min(
            4,
            Math.max(
              1,
              selectedImages.length >= 3 ? 3 : selectedImages.length
            )
          ),
        },
      ],
      createdAt: initialProject?.createdAt || now,
      updatedAt: now,
      published: initialProject?.published ?? false,
      tags:
        initialProject?.tags ??
        (kind === "story" ? ["story"] : []),
    };

    payload.kind = initialProject?.kind ?? kind;

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
        throw new Error(
          data.error ||
            (isEditing
              ? "Failed to update project"
              : "Failed to create project")
        );
      }

      setSuccessMessage(
        isEditing
          ? "Project updated successfully. Redirecting…"
          : "Project created successfully. Redirecting…"
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
          ? "Failed to update project."
          : "Failed to create project."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container size="lg" py="md" px="sm">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2} size="1.5rem">
              {isEditing ? "Edit" : "New"}{" "}
              {kind === "story" ? "Story" : "Project"}
            </Title>
            <Text size="sm" c="dimmed">
              {isEditing
                ? `Update this ${kind} with new details or images.`
                : `Build a ${kind} using images already uploaded to the gallery.`}
            </Text>
          </div>
          <Group gap="xs">
            <Button
              variant="outline"
              size="xs"
              leftSection={<IconX size={16} />}
              onClick={() => router.push("/admin")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              color="dark"
              size="xs"
              leftSection={<IconListCheck size={16} />}
              onClick={handleSave}
              loading={saving}
            >
              {isEditing ? "Update" : "Save"}{" "}
              {kind === "story" ? "Story" : "Project"}
            </Button>
          </Group>
        </Group>

        {errorMessage && (
          <Paper withBorder shadow="xs" p="sm" radius="md" bg="red.0">
            <Group gap="xs" align="flex-start">
              <IconX size={18} color="var(--mantine-color-red-6)" />
              <Text size="sm" c="red.7">
                {errorMessage}
              </Text>
              <Button
                variant="subtle"
                size="compact-xs"
                onClick={() => setErrorMessage(null)}
              >
                Dismiss
              </Button>
            </Group>
          </Paper>
        )}

        {successMessage && (
          <Paper withBorder shadow="xs" p="sm" radius="md" bg="green.0">
            <Group gap="xs">
              <Badge color="green" variant="light">
                Success
              </Badge>
              <Text size="sm">{successMessage}</Text>
            </Group>
          </Paper>
        )}

        <Grid gutter="lg" align="stretch">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg">
              <Paper withBorder shadow="xs" p="lg" radius="md">
                <Stack gap="sm">
                  <div>
                    <Title order={4} size="1rem" mb={4}>
                      Project Details
                    </Title>
                    <Text size="xs" c="dimmed">
                      Set a title and basic information for this {kind}.
                    </Text>
                  </div>

                  <TextInput
                    label="Title"
                    placeholder="Project title"
                    value={title}
                    onChange={(event) => setTitle(event.currentTarget.value)}
                    required
                    size="sm"
                  />

                  <TextInput
                    label="Slug"
                    description="Used in URLs. Automatically generated from the title."
                    placeholder="project-slug"
                    value={slug}
                    onChange={(event) => handleSlugChange(event.currentTarget.value)}
                    size="sm"
                  />

                  <Textarea
                    label="Project Info"
                    description="Appears in the project header."
                    placeholder="Share a brief overview or story about this project."
                    minRows={4}
                    value={description}
                    onChange={(event) =>
                      setDescription(event.currentTarget.value)
                    }
                    size="sm"
                  />

                  <TextInput
                    label="Location (optional)"
                    placeholder="Add a location"
                    value={location}
                    onChange={(event) => setLocation(event.currentTarget.value)}
                    size="sm"
                  />

                  <Text size="xs" c="dimmed">
                    Need to upload more images? Head back to the{" "}
                    <Anchor href="/admin">admin dashboard</Anchor> to add them to
                    the gallery first.
                  </Text>
                </Stack>
              </Paper>

              <Paper withBorder shadow="xs" p="lg" radius="md">
                <Group justify="space-between" mb="sm">
                  <Title order={4} size="1rem">
                    Selected Images
                  </Title>
                  <Badge color="dark" variant="light">
                    {selectedImages.length} selected
                  </Badge>
                </Group>

                {selectedImages.length === 0 ? (
                  <Stack gap="xs" align="center" py="md">
                    <IconPhotoPlus size={36} stroke={1.5} color="var(--mantine-color-gray-5)" />
                    <Text size="sm" c="dimmed" ta="center">
                      Pick images from the gallery to include them in this {kind}.
                    </Text>
                  </Stack>
                ) : (
                  <Stack gap="sm">
                    {selectedImages.map((image, index) => (
                      <Paper
                        key={image.url}
                        withBorder
                        radius="md"
                        p="sm"
                        shadow="xs"
                      >
                        <Group align="flex-start" gap="sm">
                          <div
                            style={{
                              position: "relative",
                              width: 72,
                              height: 72,
                              borderRadius: "var(--mantine-radius-md)",
                              overflow: "hidden",
                              backgroundColor: "var(--mantine-color-gray-2)",
                            }}
                          >
                            <Image
                              src={image.url}
                              alt={image.filename || `Selected image ${index + 1}`}
                              fill
                              style={{ objectFit: "cover" }}
                              sizes="96px"
                            />
                          </div>
                          <Stack gap={6} style={{ flex: 1 }}>
                            <Group gap={6} justify="space-between">
                              <Badge variant="light" size="xs">
                                #{index + 1}
                              </Badge>
                              <Group gap={4}>
                                <Button
                                  variant="subtle"
                                  size="compact-xs"
                                  disabled={index === 0}
                                  onClick={() => moveSelectedImage(index, "up")}
                                  leftSection={<IconArrowUp size={14} />}
                                >
                                  Up
                                </Button>
                                <Button
                                  variant="subtle"
                                  size="compact-xs"
                                  disabled={index === selectedImages.length - 1}
                                  onClick={() => moveSelectedImage(index, "down")}
                                  leftSection={<IconArrowDown size={14} />}
                                >
                                  Down
                                </Button>
                                <Button
                                  variant="subtle"
                                  color="red"
                                  size="compact-xs"
                                  onClick={() => removeSelectedImage(index)}
                                  leftSection={<IconTrash size={14} />}
                                >
                                  Remove
                                </Button>
                              </Group>
                            </Group>

                            <Textarea
                              label="Image Description (optional)"
                              placeholder="Add a caption or notes for this image."
                              value={image.caption || ""}
                              onChange={(event) =>
                                updateCaption(index, event.currentTarget.value)
                              }
                              minRows={2}
                              size="xs"
                            />
                          </Stack>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper withBorder shadow="xs" p="lg" radius="md" style={{ height: "100%" }}>
              <Group justify="space-between" mb="md">
                <div>
                  <Title order={4} size="1rem">
                    Gallery Images
                  </Title>
                  <Text size="xs" c="dimmed">
                    Click to add or remove images from this {kind}.
                  </Text>
                </div>
                <Group gap="xs" align="center">
                  <TextInput
                    size="xs"
                    placeholder="Search images..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.currentTarget.value)}
                    style={{ minWidth: "200px" }}
                  />
                  <Badge variant="light">
                    {filteredGalleryImages.length} / {galleryImages.length}
                  </Badge>
                </Group>
              </Group>

              {loadingImages ? (
                <Stack align="center" justify="center" py="xl">
                  <Loader color="dark" />
                  <Text size="sm" c="dimmed">
                    Loading gallery images…
                  </Text>
                </Stack>
              ) : galleryImages.length === 0 ? (
                <Stack align="center" justify="center" py="xl">
                  <IconPhotoPlus
                    size={48}
                    stroke={1.3}
                    color="var(--mantine-color-gray-5)"
                  />
                  <Text size="sm" c="dimmed" ta="center">
                    No images in the gallery yet.
                  </Text>
                  <Button
                    component="a"
                    href="/admin"
                    variant="subtle"
                    size="xs"
                  >
                    Upload images in the dashboard
                  </Button>
                </Stack>
              ) : filteredGalleryImages.length === 0 ? (
                <Stack align="center" justify="center" py="xl">
                  <IconPhotoPlus
                    size={48}
                    stroke={1.3}
                    color="var(--mantine-color-gray-5)"
                  />
                  <Text size="sm" c="dimmed" ta="center">
                    No images match that search. Try a different name.
                  </Text>
                </Stack>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                    gap: "var(--mantine-spacing-sm)",
                  }}
                >
                  {filteredGalleryImages.map((image) => {
                    const isSelected = selectedUrls.has(image.url);
                    return (
                      <button
                        key={image.url}
                        type="button"
                        onClick={() => toggleImageSelection(image)}
                        className="gallery-image-button"
                        aria-pressed={isSelected}
                        style={{
                          position: "relative",
                          border: "1px solid var(--mantine-color-gray-3)",
                          borderRadius: "var(--mantine-radius-md)",
                          overflow: "hidden",
                          padding: 0,
                          cursor: "pointer",
                          outline: "none",
                          backgroundColor: isSelected
                            ? "var(--mantine-color-blue-1)"
                            : "var(--mantine-color-gray-0)",
                          transition: "border-color 120ms ease, transform 120ms ease",
                          transform: isSelected ? "scale(0.98)" : "scale(1)",
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            paddingBottom: "68%",
                            backgroundColor: "var(--mantine-color-gray-2)",
                          }}
                        >
                          <Image
                            src={image.url}
                            alt={image.filename || "Gallery image"}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="160px"
                          />
                          {isSelected && (
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background:
                                  "linear-gradient(180deg, rgba(17,17,17,0.05) 0%, rgba(17,17,17,0.4) 100%)",
                              }}
                            />
                          )}
                        </div>
                        <div
                          style={{
                            padding: "0.4rem 0.5rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "0.75rem",
                            color: "var(--mantine-color-gray-7)",
                          }}
                        >
                          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {image.filename || image.path || "Gallery image"}
                          </span>
                          {isSelected && (
                            <Badge size="xs" color="blue" variant="filled">
                              Added
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>

      <style jsx global>{`
        .gallery-image-button:hover {
          border-color: var(--mantine-color-blue-4);
        }

        .gallery-image-button:focus-visible {
          border-color: var(--mantine-color-blue-6);
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.35);
        }
      `}</style>
    </Container>
  );
}


