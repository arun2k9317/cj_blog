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
import { IconCheck } from "@tabler/icons-react";
import { useTheme } from "@/contexts/ThemeContext";

interface IconicImageSelectorProps {
    opened: boolean;
    onClose: () => void;
    galleryAssets?: { url: string }[]; // Optional now, since we fetch internally
}

interface GalleryImage {
    url: string;
    filename?: string;
    path?: string;
}

export default function IconicImageSelector({ opened, onClose }: IconicImageSelectorProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [loadingImages, setLoadingImages] = useState(true);

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
                const urls = data.images.map((img: { url: string }) => img.url);
                setSelectedUrls(new Set(urls));
            }
        } catch (error) {
            console.error("Failed to fetch iconic images", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (url: string) => {
        setSelectedUrls(prev => {
            const newSet = new Set(prev);
            if (newSet.has(url)) {
                newSet.delete(url);
            } else {
                newSet.add(url);
            }
            return newSet;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const urls = Array.from(selectedUrls);
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
            <Box pos="relative" mih={400}>
                <LoadingOverlay visible={loading || loadingImages} />
                <Text size="sm" mb="md" c="dimmed">
                    Select one or more images to be displayed on the homepage. If multiple images are selected, they will be shown as a slideshow.
                </Text>
                
                <Box style={{ maxHeight: '60vh', overflowY: 'auto', minHeight: '300px' }}>
                     {galleryImages.length === 0 && !loadingImages ? (
                        <Text ta="center" c="dimmed" mt="xl">No images found in gallery.</Text>
                    ) : (
                        <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="xs">
                            {galleryImages.map((asset, index) => {
                                const isSelected = selectedUrls.has(asset.url);
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
                                                : "1px solid transparent"
                                        }}
                                    >
                                        <Image 
                                            src={asset.url} 
                                            alt="Gallery Image" 
                                            fill 
                                            style={{ objectFit: 'cover' }} 
                                            sizes="(max-width: 768px) 50vw, 25vw"
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
                        {selectedUrls.size} selected
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
