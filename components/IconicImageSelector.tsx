"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
    Modal, 
    SimpleGrid, 
    Box, 
    Button, 
    Group, 
    Text, 
    LoadingOverlay,
    ActionIcon,
    Badge
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useTheme } from "@/contexts/ThemeContext";
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors, 
    DragEndEvent 
} from '@dnd-kit/core';
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    horizontalListSortingStrategy, 
    useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface IconicImageSelectorProps {
    opened: boolean;
    onClose: () => void;
    galleryAssets?: { url: string }[]; // Optional now, since we fetch internally
}

function SortableImage({ url, onRemove }: { url: string, onRemove: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: url });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'grab',
        position: 'relative' as const,
        touchAction: 'none' // Required for pointer sensor
    };

    return (
        <Box 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            w={100}
            h={100}
            pos="relative"
        >
            <Box 
                style={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: '100%', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    border: '1px solid var(--mantine-color-gray-3)'
                }}
            >
                <Image 
                    src={url} 
                    alt="Selected" 
                    fill 
                    style={{ objectFit: 'cover' }} 
                    sizes="100px"
                    unoptimized
                />
                <ActionIcon 
                    color="red" 
                    variant="filled" 
                    size="xs"
                    radius="xl"
                    onClick={(e) => {
                        e.stopPropagation(); 
                        // Prevent drag start? onRemove is handled by parent click or separate button?
                        // Actually dnd-kit might capture the click. 
                        // We need the pointer down to not be on this button for drag, but usually dnd handles it if it's a child.
                        // Let's rely on listeners being on the parent box.
                        onRemove();
                    }}
                    style={{ position: 'absolute', top: 4, right: 4, zIndex: 10 }}
                >
                    <IconX size={12} />
                </ActionIcon>
            </Box>
        </Box>
    );
}

interface GalleryImage {
    url: string;
    filename?: string;
    path?: string;
}

export default function IconicImageSelector({ opened, onClose }: IconicImageSelectorProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [selectedUrls, setSelectedUrls] = useState<string[]>([]); // Array for order
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [loadingImages, setLoadingImages] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Fetch current iconic images when opened
    useEffect(() => {
        if (opened) {
            fetchCurrentIconicImages();
            fetchGalleryImages();
        }
    }, [opened]);

    const fetchGalleryImages = async () => {
        setLoadingImages(true);
        try {
            const res = await fetch("/api/gallery-images");
            if (res.ok) {
                const data = await res.json();
                if (data.images && Array.isArray(data.images)) {
                    setGalleryImages(data.images);
                }
            }
        } catch (error) {
            console.error("Failed to fetch gallery images", error);
        } finally {
            setLoadingImages(false);
        }
    };

    const fetchCurrentIconicImages = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/iconic-images");
            if (res.ok) {
                const data = await res.json();
                // Ensure we get the ordered list
                if (data.images && Array.isArray(data.images)) {
                    const urls = data.images.map((img: { url: string }) => img.url);
                    setSelectedUrls(urls);
                }
            }
        } catch (error) {
            console.error("Failed to fetch iconic images", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (url: string) => {
        setSelectedUrls(prev => {
            if (prev.includes(url)) {
                return prev.filter(u => u !== url);
            } else {
                return [...prev, url];
            }
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSelectedUrls((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const removeSelection = (url: string) => {
        setSelectedUrls(prev => prev.filter(u => u !== url));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const urls = selectedUrls; // Already an ordered array
            const res = await fetch("/api/iconic-images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ urls })
            });
            if (res.ok) {
                onClose();
                // Optionally reload or notify success
            } else {
                alert("Failed to save selection.");
            }
        } catch (error) {
            console.error("Error saving iconic images:", error);
            alert("Error saving selection.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal 
            opened={opened} 
            onClose={onClose} 
            title="Select Iconic Images" 
            size="xl"
            styles={{
                header: { backgroundColor: isDark ? "var(--mantine-color-dark-7)" : "white" },
                content: { backgroundColor: isDark ? "var(--mantine-color-dark-7)" : "white" }
            }}
        >
            <Box pos="relative" mih={400} px="xs">
                <LoadingOverlay visible={loading || loadingImages} />
                
                <Text size="sm" mb="xs" fw={500}>Selected Images (Drag to Reorder)</Text>
                {selectedUrls.length === 0 ? (
                    <Text size="sm" c="dimmed" mb="md" fs="italic">No images selected. Click images below to select.</Text>
                ) : (
                    <Box mb="xl" py="xs" style={{ overflowX: 'auto' }}>
                        <DndContext 
                            sensors={sensors} 
                            collisionDetection={closestCenter} 
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext 
                                items={selectedUrls} 
                                strategy={horizontalListSortingStrategy}
                            >
                                <Group gap="sm" wrap="nowrap">
                                    {selectedUrls.map((url) => (
                                        <SortableImage 
                                            key={url} 
                                            url={url} 
                                            onRemove={() => removeSelection(url)} 
                                        />
                                    ))}
                                </Group>
                            </SortableContext>
                        </DndContext>
                    </Box>
                )}

                <Text size="sm" mb="xs" fw={500} mt="lg">Gallery Images</Text>
                
                <Box style={{ maxHeight: '50vh', overflowY: 'auto', minHeight: '300px' }}>
                     {galleryImages.length === 0 && !loadingImages ? (
                        <Text ta="center" c="dimmed" mt="xl">No images found in gallery.</Text>
                    ) : (
                        <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="xs">
                            {galleryImages.map((asset, index) => {
                                const isSelected = selectedUrls.includes(asset.url);
                                return (
                                    <Box 
                                        key={index} 
                                        onClick={() => toggleSelection(asset.url)}
                                        style={{ 
                                            position: 'relative', 
                                            aspectRatio: '1/1', 
                                            cursor: 'pointer', 
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            border: isSelected 
                                                ? "3px solid var(--mantine-color-blue-6)" 
                                                : "1px solid transparent",
                                            opacity: isSelected ? 0.6 : 1
                                        }}
                                    >
                                        <Image 
                                            src={asset.url} 
                                            alt="Gallery Image" 
                                            fill 
                                            style={{ objectFit: 'cover' }} 
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                            unoptimized
                                        />
                                        {isSelected && (
                                            <Box 
                                                style={{ 
                                                    position: 'absolute', 
                                                    top: 4, 
                                                    right: 4, 
                                                    backgroundColor: 'var(--mantine-color-blue-6)', 
                                                    borderRadius: '50%', 
                                                    width: 24, 
                                                    height: 24, 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center' 
                                                }}
                                            >
                                                <IconCheck size={16} color="white" />
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })}
                        </SimpleGrid>
                    )}
                </Box>

                <Group justify="space-between" mt="md">
                    <Text size="sm">
                        {selectedUrls.length} selected
                    </Text>
                    <Group>
                        <Button variant="default" onClick={onClose} disabled={saving}>Cancel</Button>
                        <Button onClick={handleSave} loading={saving}>Save Selection</Button>
                    </Group>
                </Group>
            </Box>
        </Modal>
    );
}
