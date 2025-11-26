"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
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
  Modal,
} from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  IconArrowDown,
  IconArrowUp,
  IconTrash,
  IconX,
  IconHeading,
  IconAlignLeft,
  IconPhoto,
  IconQuote,
  IconMinus,
  IconLayoutBottombarInactive,
} from "@tabler/icons-react";
import { useTheme } from "@/contexts/ThemeContext";
import StoryPreview from "@/components/StoryPreview";
import type {
  Project,
  ContentBlock,
  TitleBlock,
  DescriptionBlock,
  StoryImageBlock,
  QuoteBlock,
  DividerBlock,
  FooterBlock,
} from "@/types/project";

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

const BLOCK_STACK_STYLE = { paddingTop: "40px" };

interface BlockShellProps {
  children: ReactNode;
  isDark: boolean;
  index: number;
  total: number;
  blockId: string;
  label: string;
  onMove: (index: number, direction: "up" | "down") => void;
  onRemove: (blockId: string) => void;
}

const BlockShell = ({
  children,
  isDark,
  index,
  total,
  blockId,
  label,
  onMove,
  onRemove,
}: BlockShellProps) => (
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
    }}
  >
    <Group justify="space-between" align="center" mb="xs" gap="xs">
      <Text
        size="sm"
        fw={600}
        c={
          isDark ? "var(--mantine-color-gray-0)" : "var(--mantine-color-dark-9)"
        }
      >
        {label}
      </Text>
      <Group gap="xs">
        <ActionIcon
          size="sm"
          variant="subtle"
          color={isDark ? "gray" : "dark"}
          onClick={() => onMove(index, "up")}
          disabled={index === 0}
        >
          <IconArrowUp
            size={16}
            color={
              index === 0
                ? "var(--mantine-color-gray-5)"
                : isDark
                ? "var(--mantine-color-gray-2)"
                : "var(--mantine-color-dark-6)"
            }
          />
        </ActionIcon>
        <ActionIcon
          size="sm"
          variant="subtle"
          color={isDark ? "gray" : "dark"}
          onClick={() => onMove(index, "down")}
          disabled={index === total - 1}
        >
          <IconArrowDown
            size={16}
            color={
              index === total - 1
                ? "var(--mantine-color-gray-5)"
                : isDark
                ? "var(--mantine-color-gray-2)"
                : "var(--mantine-color-dark-6)"
            }
          />
        </ActionIcon>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="red"
          onClick={() => onRemove(blockId)}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </Group>
    {children}
  </Paper>
);

const getFieldStyles = (isDark: boolean) => ({
  input: {
    color: isDark
      ? "var(--mantine-color-gray-0)"
      : "var(--mantine-color-dark-9)",
    backgroundColor: isDark
      ? "var(--mantine-color-dark-5)"
      : "var(--mantine-color-white)",
  },
  label: {
    color: isDark
      ? "var(--mantine-color-gray-2)"
      : "var(--mantine-color-dark-7)",
  },
});

const getSelectStyles = (isDark: boolean) => ({
  ...getFieldStyles(isDark),
  dropdown: {
    backgroundColor: isDark
      ? "var(--mantine-color-dark-6)"
      : "var(--mantine-color-white)",
    borderColor: isDark
      ? "var(--mantine-color-dark-4)"
      : "var(--mantine-color-gray-3)",
  },
  option: {
    color: isDark
      ? "var(--mantine-color-gray-0)"
      : "var(--mantine-color-dark-9)",
    backgroundColor: isDark
      ? "var(--mantine-color-dark-6)"
      : "var(--mantine-color-white)",
    "&[dataHovered]": {
      backgroundColor: isDark
        ? "var(--mantine-color-dark-5)"
        : "var(--mantine-color-gray-1)",
    },
    "&[dataSelected]": {
      backgroundColor: isDark
        ? "var(--mantine-color-dark-4)"
        : "var(--mantine-color-gray-2)",
    },
  },
});

const getOutlineButtonStyles = (isDark: boolean) => ({
  root: {
    color: isDark
      ? "var(--mantine-color-gray-0)"
      : "var(--mantine-color-dark-7)",
    borderColor: isDark
      ? "var(--mantine-color-dark-3)"
      : "var(--mantine-color-gray-4)",
    backgroundColor: isDark
      ? "var(--mantine-color-dark-6)"
      : "var(--mantine-color-gray-0)",
  },
});

const createBlockTemplate = (
  type: ContentBlock["type"],
  order: number,
  overrides?: Partial<ContentBlock>
): ContentBlock => {
  let base: ContentBlock;

  switch (type) {
    case "title":
      base = {
        id: generateId(type),
        type: "title",
        order,
        text: "",
        fontSize: "large",
        alignment: "left",
      };
      break;
    case "description":
      base = {
        id: generateId(type),
        type: "description",
        order,
        content: "",
        lineHeight: 1.6,
        maxWidth: 800,
      };
      break;
    case "story-image":
      base = {
        id: generateId(type),
        type: "story-image",
        order,
        src: "",
        alt: "",
        size: "full-width",
        aspectRatioLock: false,
      };
      break;
    case "quote":
      base = {
        id: generateId(type),
        type: "quote",
        order,
        text: "",
        alignment: "center",
      };
      break;
    case "divider":
      base = {
        id: generateId(type),
        type: "divider",
        order,
        spacingTop: 20,
        spacingBottom: 20,
      };
      break;
    case "footer":
      base = {
        id: generateId(type),
        type: "footer",
        order,
        pageWidth: "medium",
      };
      break;
    default:
      base = {
        id: generateId(type),
        type,
        order,
      } as ContentBlock;
  }

  return overrides ? ({ ...base, ...overrides } as ContentBlock) : base;
};

const BLOCK_TYPE_OPTIONS: { value: ContentBlock["type"]; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "description", label: "Description" },
  { value: "story-image", label: "Image" },
  { value: "quote", label: "Quote" },
  { value: "divider", label: "Divider" },
  { value: "footer", label: "Footer" },
];

interface TitleBlockEditorProps {
  block: TitleBlock;
  isDark: boolean;
  onChange: (updates: Partial<TitleBlock>) => void;
}

const TitleBlockEditor = ({
  block,
  isDark,
  onChange,
}: TitleBlockEditorProps) => (
  <Stack gap="sm" style={BLOCK_STACK_STYLE}>
    <Text size="sm" fw={500} c={isDark ? "gray.0" : "dark.9"}>
      Title Block
    </Text>
    <TextInput
      label="Title"
      value={block.text || ""}
      onChange={(e) => onChange({ text: e.target.value })}
      placeholder="Enter title"
      styles={{
        input: {
          color: isDark
            ? "var(--mantine-color-gray-0)"
            : "var(--mantine-color-dark-9)",
          backgroundColor: isDark
            ? "var(--mantine-color-dark-5)"
            : "var(--mantine-color-white)",
          "&::placeholder": {
            color: isDark
              ? "var(--mantine-color-gray-3)"
              : "var(--mantine-color-gray-6)",
          },
        },
        label: {
          color: isDark
            ? "var(--mantine-color-gray-2)"
            : "var(--mantine-color-dark-9)",
        },
      }}
    />
    <TextInput
      label="Subtitle (optional)"
      value={block.subtitle || ""}
      onChange={(e) => onChange({ subtitle: e.target.value })}
      placeholder="Enter subtitle"
      styles={{
        input: {
          color: isDark
            ? "var(--mantine-color-gray-0)"
            : "var(--mantine-color-dark-9)",
          backgroundColor: isDark
            ? "var(--mantine-color-dark-5)"
            : "var(--mantine-color-white)",
          "&::placeholder": {
            color: isDark
              ? "var(--mantine-color-gray-4)"
              : "var(--mantine-color-gray-6)",
          },
        },
        label: {
          color: isDark
            ? "var(--mantine-color-gray-2)"
            : "var(--mantine-color-dark-9)",
        },
      }}
    />
    <Group>
      <Select
        label="Font Size"
        value={block.fontSize || "large"}
        onChange={(value) =>
          onChange({
            fontSize: (value || "large") as
              | "small"
              | "medium"
              | "large"
              | "xl"
              | "2xl"
              | "3xl",
          })
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
        value={block.alignment || "left"}
        onChange={(value) =>
          onChange({
            alignment: (value || "left") as "left" | "center" | "right",
          })
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

interface DescriptionBlockEditorProps {
  block: DescriptionBlock;
  isDark: boolean;
  onChange: (updates: Partial<DescriptionBlock>) => void;
}

const DescriptionBlockEditor = ({
  block,
  isDark,
  onChange,
}: DescriptionBlockEditorProps) => (
  <Stack gap="sm" style={BLOCK_STACK_STYLE}>
    <Text size="sm" fw={500} c={isDark ? "gray.0" : "dark.9"}>
      Description Block
    </Text>
    <Textarea
      label="Content (supports basic HTML formatting)"
      value={block.content || ""}
      onChange={(e) => onChange({ content: e.target.value })}
      placeholder="Enter description text..."
      minRows={4}
    />
    <Group>
      <NumberInput
        label="Line Height"
        value={block.lineHeight || 1.6}
        onChange={(value) => onChange({ lineHeight: Number(value) })}
        min={1}
        max={3}
        step={0.1}
        style={{ flex: 1 }}
      />
      <NumberInput
        label="Max Width (px)"
        value={block.maxWidth || 800}
        onChange={(value) => onChange({ maxWidth: Number(value) })}
        min={200}
        max={1200}
        style={{ flex: 1 }}
      />
    </Group>
  </Stack>
);

interface StoryImageBlockEditorProps {
  block: StoryImageBlock;
  isDark: boolean;
  onChange: (updates: Partial<StoryImageBlock>) => void;
  onOpenGallery: () => void;
}

const StoryImageBlockEditor = ({
  block,
  isDark,
  onChange,
  onOpenGallery,
}: StoryImageBlockEditorProps) => (
  <Stack gap="sm" style={BLOCK_STACK_STYLE}>
    <Text size="sm" fw={500} c={isDark ? "gray.0" : "dark.9"}>
      Image Block
    </Text>
    {block.src && (
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
          src={block.src}
          alt={block.alt || "Preview"}
          fill
          style={{ objectFit: "contain" }}
        />
      </div>
    )}
    <Button variant="outline" onClick={onOpenGallery}>
      {block.src ? "Change Image" : "Select Image from Gallery"}
    </Button>
    <TextInput
      label="Alt Text"
      value={block.alt || ""}
      onChange={(e) => onChange({ alt: e.target.value })}
      placeholder="Enter alt text"
    />
    <Group>
      <Select
        label="Size"
        value={
          typeof block.size === "number" ? "custom" : block.size || "full-width"
        }
        onChange={(value) => {
          if (value === "custom") {
            onChange({ size: 600 });
          } else {
            onChange({ size: value as StoryImageBlock["size"] });
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
      {typeof block.size === "number" && (
        <NumberInput
          label="Custom Width (px)"
          value={block.size}
          onChange={(value) => onChange({ size: Number(value) })}
          min={200}
          max={1200}
          style={{ flex: 1 }}
        />
      )}
    </Group>
    <Group>
      <Switch
        label="Lock Aspect Ratio"
        checked={block.aspectRatioLock || false}
        onChange={(e) => onChange({ aspectRatioLock: e.currentTarget.checked })}
      />
      {block.aspectRatioLock && (
        <Select
          label="Aspect Ratio"
          value={block.aspectRatio || "auto"}
          onChange={(value) =>
            onChange({
              aspectRatio: (value || "auto") as
                | "auto"
                | "square"
                | "landscape"
                | "portrait"
                | "wide"
                | "tall",
            })
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
    <Switch
      label="Include Caption"
      checked={Boolean(block.caption)}
      onChange={(e) => {
        if (e.currentTarget.checked) {
          onChange({
            caption: block.caption || "",
            captionPlacement: block.captionPlacement || "below",
            captionItalic: block.captionItalic ?? false,
          });
        } else {
          onChange({
            caption: undefined,
            captionPlacement: undefined,
            captionItalic: undefined,
          });
        }
      }}
    />
    {typeof block.caption === "string" && (
      <Stack gap="sm">
        <TextInput
          label="Caption Text"
          value={block.caption}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="Enter caption"
        />
        <Group>
          <Select
            label="Caption Placement"
            value={block.captionPlacement || "below"}
            onChange={(value) =>
              onChange({
                captionPlacement: (value || "below") as "below" | "overlay",
              })
            }
            data={[
              { value: "below", label: "Below image" },
              { value: "overlay", label: "Overlay" },
            ]}
          />
          <Switch
            label="Italic Caption"
            checked={block.captionItalic || false}
            onChange={(e) =>
              onChange({ captionItalic: e.currentTarget.checked })
            }
          />
        </Group>
      </Stack>
    )}
  </Stack>
);

interface QuoteBlockEditorProps {
  block: QuoteBlock;
  isDark: boolean;
  onChange: (updates: Partial<QuoteBlock>) => void;
}

const QuoteBlockEditor = ({
  block,
  isDark,
  onChange,
}: QuoteBlockEditorProps) => (
  <Stack gap="sm" style={BLOCK_STACK_STYLE}>
    <Text size="sm" fw={500} c={isDark ? "gray.0" : "dark.9"}>
      Quote Block
    </Text>
    <Textarea
      label="Quote Text"
      value={block.text || ""}
      onChange={(e) => onChange({ text: e.target.value })}
      placeholder="Enter quote text..."
      minRows={3}
    />
    <TextInput
      label="Author (optional)"
      value={block.author || ""}
      onChange={(e) => onChange({ author: e.target.value })}
      placeholder="Enter author name"
    />
    <Select
      label="Alignment"
      value={block.alignment || "center"}
      onChange={(value) =>
        onChange({
          alignment: (value || "center") as "left" | "center" | "right",
        })
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

interface DividerBlockEditorProps {
  block: DividerBlock;
  isDark: boolean;
  onChange: (updates: Partial<DividerBlock>) => void;
}

const DividerBlockEditor = ({
  block,
  isDark,
  onChange,
}: DividerBlockEditorProps) => (
  <Stack gap="sm" style={BLOCK_STACK_STYLE}>
    <Text size="sm" fw={500} c={isDark ? "gray.0" : "dark.9"}>
      Divider Block
    </Text>
    <Group>
      <NumberInput
        label="Spacing Top (px)"
        value={block.spacingTop || 20}
        onChange={(value) => onChange({ spacingTop: Number(value) })}
        min={0}
        max={200}
        style={{ flex: 1 }}
      />
      <NumberInput
        label="Spacing Bottom (px)"
        value={block.spacingBottom || 20}
        onChange={(value) => onChange({ spacingBottom: Number(value) })}
        min={0}
        max={200}
        style={{ flex: 1 }}
      />
    </Group>
  </Stack>
);

interface FooterBlockEditorProps {
  block: FooterBlock;
  isDark: boolean;
  onChange: (updates: Partial<FooterBlock>) => void;
}

const FooterBlockEditor = ({
  block,
  isDark,
  onChange,
}: FooterBlockEditorProps) => (
  <Stack gap="sm" style={BLOCK_STACK_STYLE}>
    <Text size="sm" fw={500} c={isDark ? "gray.0" : "dark.9"}>
      Footer Block
    </Text>
    <TextInput
      label="Text (optional)"
      value={block.text || ""}
      onChange={(e) => onChange({ text: e.target.value })}
      placeholder="Enter footer text"
    />
    <TextInput
      label="Date (optional)"
      value={block.date || ""}
      onChange={(e) => onChange({ date: e.target.value })}
      placeholder="Enter date"
    />
    <TextInput
      label="Credits (optional)"
      value={block.credits || ""}
      onChange={(e) => onChange({ credits: e.target.value })}
      placeholder="Enter credits"
    />
    <Select
      label="Page Width"
      value={block.pageWidth || "medium"}
      onChange={(value) =>
        onChange({
          pageWidth: (value || "medium") as "full" | "medium" | "narrow",
        })
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

export default function AdminStoryCreator({
  initialProject,
}: AdminStoryCreatorProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [projectMeta, setProjectMeta] = useState<Project | null>(
    initialProject ?? null
  );
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const fieldStyles = useMemo(() => getFieldStyles(isDark), [isDark]);
  const selectStyles = useMemo(() => getSelectStyles(isDark), [isDark]);
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
  const [activeImageBlockId, setActiveImageBlockId] = useState<string | null>(
    null
  );
  const [galleryTarget, setGalleryTarget] = useState<"blocks" | "draft" | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [draftBlock, setDraftBlock] = useState<ContentBlock | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewStoryId, setPreviewStoryId] = useState<string | null>(
    initialProject?.id ?? null
  );
  const isEditing = Boolean(projectMeta);

  useEffect(() => {
    if (!slugEdited && !isEditing) {
      setSlug(slugify(title));
    }
  }, [title, slugEdited, isEditing]);

  useEffect(() => {
    if (initialProject) {
      setProjectMeta(initialProject);
    }
  }, [initialProject]);

  useEffect(() => {
    if (projectMeta) {
      setTitle(projectMeta.title || "");
      setSlug(projectMeta.slug || "");
      setSlugEdited(true);
      setBlocks(projectMeta.contentBlocks || []);
    }
  }, [projectMeta]);

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

  const updateBlock = useCallback(
    (blockId: string, updates: Partial<ContentBlock>) => {
      console.log("[AdminStoryCreator] updateBlock", blockId, updates);
      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== blockId) {
            return block;
          }
          const updatedBlock = { ...block, ...updates } as ContentBlock;
          console.log("[AdminStoryCreator] block updated", updatedBlock);
          return updatedBlock;
        })
      );
    },
    []
  );

  const removeBlock = useCallback(
    (blockId: string) => {
      console.log("[AdminStoryCreator] removeBlock", blockId);
      setBlocks((prev) =>
        prev
          .filter((block) => block.id !== blockId)
          .map((block, idx) => ({ ...block, order: idx }))
      );
      if (blockId === activeImageBlockId) {
        setActiveImageBlockId(null);
        setShowGallery(false);
      }
    },
    [activeImageBlockId, setShowGallery]
  );

  const moveBlock = useCallback((index: number, direction: "up" | "down") => {
    console.log("[AdminStoryCreator] moveBlock", { index, direction });
    setBlocks((prev) => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const updated = [...prev];
      const [movedBlock] = updated.splice(index, 1);
      updated.splice(newIndex, 0, movedBlock);
      console.log("[AdminStoryCreator] blocks after move", updated);
      return updated.map((block, idx) => ({ ...block, order: idx }));
    });
  }, []);

  const closeGallery = useCallback(() => {
    setShowGallery(false);
    setActiveImageBlockId(null);
    setGalleryTarget(null);
  }, []);

  const selectImageFromGallery = useCallback(
    (image: GalleryImage) => {
      if (!activeImageBlockId || !galleryTarget) return;
      console.log("[AdminStoryCreator] selectImageFromGallery", {
        blockId: activeImageBlockId,
        target: galleryTarget,
        image,
      });

      if (galleryTarget === "draft") {
        setDraftBlock((prev) =>
          prev && prev.id === activeImageBlockId
            ? ({
                ...prev,
                src: image.url,
                alt: image.filename || image.path || "Image",
              } as ContentBlock)
            : prev
        );
      } else {
        updateBlock(activeImageBlockId, {
          src: image.url,
          alt: image.filename || image.path || "Image",
        });
      }

      closeGallery();
    },
    [activeImageBlockId, galleryTarget, updateBlock, closeGallery]
  );

  const openCreateModal = () => {
    setModalMode("create");
    setDraftBlock(null);
    setModalOpen(true);
  };

  const openCreateModalWithType = (type: ContentBlock["type"]) => {
    setModalMode("create");
    const order = blocks.length;
    const template = createBlockTemplate(type, order);
    setDraftBlock(template);
    setModalOpen(true);
  };

  const openEditModal = (block: ContentBlock) => {
    setModalMode("edit");
    setDraftBlock({ ...block });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setDraftBlock(null);
    closeGallery();
  };

  const handleDraftTypeChange = (type: ContentBlock["type"]) => {
    const order =
      modalMode === "edit" && draftBlock ? draftBlock.order : blocks.length;
    const overrides =
      modalMode === "edit" && draftBlock ? { id: draftBlock.id } : undefined;
    const template = createBlockTemplate(type, order, overrides);
    setDraftBlock(template);
  };

  const updateDraftBlock = (updates: Partial<ContentBlock>) => {
    setDraftBlock((prev) =>
      prev ? ({ ...prev, ...updates } as ContentBlock) : prev
    );
  };

  const handleModalSave = () => {
    if (!draftBlock) return;
    if (modalMode === "create") {
      const newBlock = { ...draftBlock, order: blocks.length };
      setBlocks((prev) => [...prev, newBlock]);
    } else {
      setBlocks((prev) =>
        prev
          .map((block) => (block.id === draftBlock.id ? draftBlock : block))
          .map((block, idx) => ({ ...block, order: idx }))
      );
    }
    closeModal();
  };

  const getBlockLabel = (block: ContentBlock) => {
    switch (block.type) {
      case "title":
        return "Title";
      case "description":
        return "Description";
      case "story-image":
        return "Image";
      case "quote":
        return "Quote";
      case "divider":
        return "Divider";
      case "footer":
        return "Footer";
      default:
        return block.type;
    }
  };

  const getBlockSummary = (block: ContentBlock) => {
    switch (block.type) {
      case "title":
        return (block as TitleBlock).text || "No title yet";
      case "description":
        return ((block as DescriptionBlock).content || "No description").slice(
          0,
          120
        );
      case "story-image":
        const imageBlock = block as StoryImageBlock;
        if (!imageBlock.src) return "No image selected";
        if (imageBlock.caption && typeof imageBlock.caption === "string") {
          return imageBlock.caption.trim() || "No caption";
        }
        return "";
      case "quote":
        return (block as QuoteBlock).text || "No quote text";
      case "divider":
        return `Spacing: ${(block as DividerBlock).spacingTop ?? 20}px / ${
          (block as DividerBlock).spacingBottom ?? 20
        }px`;
      case "footer":
        return (block as FooterBlock).text || "No footer text";
      default:
        return "No content";
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

  const buildPayload = (): Project | null => {
    if (!validateForm()) return null;

    const now = new Date().toISOString();
    const projectId = projectMeta?.id || slug || generateId("story");

    return {
      id: projectId,
      title: title.trim(),
      slug,
      description: undefined,
      location: undefined,
      featuredImage:
        blocks.find((b) => b.type === "story-image")?.src || undefined,
      contentBlocks: blocks,
      createdAt: projectMeta?.createdAt || now,
      updatedAt: now,
      published: projectMeta?.published ?? false,
      tags: projectMeta?.tags ?? ["story"],
      kind: "story",
    };
  };

  const persistStory = async (options?: { showSuccess?: boolean }) => {
    const showSuccess = options?.showSuccess ?? true;
    const payload = buildPayload();
    if (!payload) return null;

    setErrorMessage(null);
    if (!showSuccess) {
      setSuccessMessage(null);
    }

    const url = projectMeta
      ? `/api/projects/${encodeURIComponent(payload.id)}`
      : "/api/projects";
    const method = projectMeta ? "PUT" : "POST";

    try {
      setSaving(true);
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        project?: Project;
        error?: string;
      };

      if (!response.ok || !data.project) {
        const message =
          data.error ||
          (projectMeta ? "Failed to update story." : "Failed to create story.");
        throw new Error(message);
      }

      setProjectMeta(data.project);
      setPreviewStoryId(data.project.id);
      if (showSuccess) {
        setSuccessMessage(
          projectMeta
            ? "Story updated successfully."
            : "Story saved successfully."
        );
      }

      return data.project;
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save story."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const saved = await persistStory({ showSuccess: true });
    if (saved) {
      router.refresh();
    }
  };

  const handlePreview = async () => {
    setPreviewing(true);
    const saved = await persistStory({ showSuccess: false });
    if (saved) {
      setPreviewModalOpen(true);
    }
    setPreviewing(false);
  };

  const renderDraftEditor = (block: ContentBlock) => {
    console.log("[AdminStoryCreator] renderBlockEditor", {
      id: block.id,
      type: block.type,
    });
    switch (block.type) {
      case "title":
        return (
          <TitleBlockEditor
            block={block as TitleBlock}
            isDark={isDark}
            onChange={(updates) => updateDraftBlock(updates)}
          />
        );
      case "description":
        return (
          <DescriptionBlockEditor
            block={block as DescriptionBlock}
            isDark={isDark}
            onChange={(updates) => updateDraftBlock(updates)}
          />
        );
      case "story-image":
        return (
          <StoryImageBlockEditor
            block={block as StoryImageBlock}
            isDark={isDark}
            onChange={(updates) => updateDraftBlock(updates)}
            onOpenGallery={() => {
              setGalleryTarget("draft");
              setActiveImageBlockId(block.id);
              setShowGallery(true);
            }}
          />
        );
      case "quote":
        return (
          <QuoteBlockEditor
            block={block as QuoteBlock}
            isDark={isDark}
            onChange={(updates) => updateDraftBlock(updates)}
          />
        );
      case "divider":
        return (
          <DividerBlockEditor
            block={block as DividerBlock}
            isDark={isDark}
            onChange={(updates) => updateDraftBlock(updates)}
          />
        );
      case "footer":
        return (
          <FooterBlockEditor
            block={block as FooterBlock}
            isDark={isDark}
            onChange={(updates) => updateDraftBlock(updates)}
          />
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
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title
              order={2}
              size="15px"
              c={
                isDark
                  ? "var(--mantine-color-gray-0)"
                  : "var(--mantine-color-dark-9)"
              }
            >
              {isEditing ? "Edit" : "New"} Story
            </Title>
            <Text
              size="sm"
              c={isDark ? "var(--mantine-color-gray-3)" : "dimmed"}
              style={{
                color: isDark ? "var(--mantine-color-gray-3)" : undefined,
              }}
            >
              {isEditing
                ? "Update this story with new content blocks."
                : "Build a story using content blocks and images from the gallery."}
            </Text>
          </div>
          <Group gap="xs">
            <Button
              variant="light"
              size="xs"
              color="blue"
              onClick={handlePreview}
              disabled={saving || previewing}
              loading={previewing}
            >
              Preview
            </Button>
            <Button
              variant="outline"
              size="xs"
              color={isDark ? "blue" : "dark"}
              leftSection={<IconX size={16} />}
              onClick={() => router.push("/admin")}
              disabled={saving}
              styles={{
                root: {
                  borderColor: isDark
                    ? "var(--mantine-color-blue-6)"
                    : undefined,
                  color: isDark ? "var(--mantine-color-gray-0)" : undefined,
                  "&:hover": {
                    backgroundColor: isDark
                      ? "var(--mantine-color-blue-9)"
                      : undefined,
                    borderColor: isDark
                      ? "var(--mantine-color-blue-5)"
                      : undefined,
                  },
                },
              }}
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
              {isEditing ? "Update Story" : "Save Story"}
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
            maxWidth: "800px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <Stack gap="md">
            <TextInput
              label="Story Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter story title"
              required
              styles={fieldStyles}
            />
            <TextInput
              label="Slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="story-slug"
              required
              styles={fieldStyles}
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
            maxWidth: "800px",
            width: "100%",
            margin: "0 auto",
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

            <Stack gap="md">
              {blocks.map((block, index) => (
                <BlockShell
                  key={block.id}
                  isDark={isDark}
                  index={index}
                  total={blocks.length}
                  blockId={block.id}
                  label={getBlockLabel(block)}
                  onMove={moveBlock}
                  onRemove={removeBlock}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => openEditModal(block)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openEditModal(block);
                      }
                    }}
                    style={{
                      cursor: "pointer",
                      color: isDark
                        ? "var(--mantine-color-gray-0)"
                        : "var(--mantine-color-dark-9)",
                    }}
                  >
                    {block.type === "story-image" &&
                    (block as StoryImageBlock).src ? (
                      <Group gap="xs" mt="xs" align="flex-start">
                        <div
                          style={{
                            position: "relative",
                            width: "60px",
                            height: "60px",
                            borderRadius: "var(--mantine-radius-sm)",
                            overflow: "hidden",
                            flexShrink: 0,
                            backgroundColor: isDark
                              ? "var(--mantine-color-dark-4)"
                              : "var(--mantine-color-gray-2)",
                          }}
                        >
                          <Image
                            src={(block as StoryImageBlock).src}
                            alt="Image preview"
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="60px"
                          />
                        </div>
                        <Text
                          size="xs"
                          c={isDark ? "var(--mantine-color-gray-3)" : "dimmed"}
                          style={{ flex: 1, wordBreak: "break-word" }}
                        >
                          {getBlockSummary(block)}
                        </Text>
                      </Group>
                    ) : (
                      <Text
                        size="xs"
                        c={isDark ? "var(--mantine-color-gray-3)" : "dimmed"}
                      >
                        {getBlockSummary(block)}
                      </Text>
                    )}
                  </div>
                </BlockShell>
              ))}
            </Stack>

            <Group gap="sm" mt="md" wrap="wrap" justify="center">
              <ActionIcon
                variant="outline"
                size="lg"
                onClick={() => openCreateModalWithType("title")}
                title="Add Title Block"
                styles={{
                  root: {
                    borderColor: isDark
                      ? "var(--mantine-color-blue-6)"
                      : "var(--mantine-color-gray-4)",
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    "&:hover": {
                      backgroundColor: isDark
                        ? "var(--mantine-color-blue-9)"
                        : "var(--mantine-color-gray-1)",
                    },
                  },
                }}
              >
                <IconHeading size={20} />
              </ActionIcon>
              <ActionIcon
                variant="outline"
                size="lg"
                onClick={() => openCreateModalWithType("description")}
                title="Add Description Block"
                styles={{
                  root: {
                    borderColor: isDark
                      ? "var(--mantine-color-blue-6)"
                      : "var(--mantine-color-gray-4)",
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    "&:hover": {
                      backgroundColor: isDark
                        ? "var(--mantine-color-blue-9)"
                        : "var(--mantine-color-gray-1)",
                    },
                  },
                }}
              >
                <IconAlignLeft size={20} />
              </ActionIcon>
              <ActionIcon
                variant="outline"
                size="lg"
                onClick={() => openCreateModalWithType("story-image")}
                title="Add Image Block"
                styles={{
                  root: {
                    borderColor: isDark
                      ? "var(--mantine-color-blue-6)"
                      : "var(--mantine-color-gray-4)",
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    "&:hover": {
                      backgroundColor: isDark
                        ? "var(--mantine-color-blue-9)"
                        : "var(--mantine-color-gray-1)",
                    },
                  },
                }}
              >
                <IconPhoto size={20} />
              </ActionIcon>
              <ActionIcon
                variant="outline"
                size="lg"
                onClick={() => openCreateModalWithType("quote")}
                title="Add Quote Block"
                styles={{
                  root: {
                    borderColor: isDark
                      ? "var(--mantine-color-blue-6)"
                      : "var(--mantine-color-gray-4)",
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    "&:hover": {
                      backgroundColor: isDark
                        ? "var(--mantine-color-blue-9)"
                        : "var(--mantine-color-gray-1)",
                    },
                  },
                }}
              >
                <IconQuote size={20} />
              </ActionIcon>
              <ActionIcon
                variant="outline"
                size="lg"
                onClick={() => openCreateModalWithType("divider")}
                title="Add Divider Block"
                styles={{
                  root: {
                    borderColor: isDark
                      ? "var(--mantine-color-blue-6)"
                      : "var(--mantine-color-gray-4)",
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    "&:hover": {
                      backgroundColor: isDark
                        ? "var(--mantine-color-blue-9)"
                        : "var(--mantine-color-gray-1)",
                    },
                  },
                }}
              >
                <IconMinus size={20} />
              </ActionIcon>
              <ActionIcon
                variant="outline"
                size="lg"
                onClick={() => openCreateModalWithType("footer")}
                title="Add Footer Block"
                styles={{
                  root: {
                    borderColor: isDark
                      ? "var(--mantine-color-blue-6)"
                      : "var(--mantine-color-gray-4)",
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    "&:hover": {
                      backgroundColor: isDark
                        ? "var(--mantine-color-blue-9)"
                        : "var(--mantine-color-gray-1)",
                    },
                  },
                }}
              >
                <IconLayoutBottombarInactive size={20} />
              </ActionIcon>
            </Group>
          </Stack>
        </Paper>

        <Modal
          opened={showGallery}
          onClose={closeGallery}
          title="Select Image from Gallery"
          size="xl"
          yOffset="5vh"
          withinPortal
          zIndex={2100}
        >
          <Stack gap="md">
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
              <Group justify="center" py="xl">
                <Loader size="sm" />
              </Group>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "var(--mantine-spacing-sm)",
                  maxHeight: "60vh",
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
        </Modal>
      </Stack>

      <Modal
        opened={modalOpen}
        onClose={closeModal}
        title={
          modalMode === "create" ? "Add Content Block" : "Edit Content Block"
        }
        size="lg"
        classNames={{
          content: isDark
            ? "story-block-modal-dark"
            : "story-block-modal-light",
        }}
        styles={{
          header: {
            backgroundColor: isDark
              ? "var(--mantine-color-dark-6)"
              : "var(--mantine-color-gray-0)",
            color: isDark
              ? "var(--mantine-color-gray-0)"
              : "var(--mantine-color-dark-7)",
          },
          title: {
            color: isDark
              ? "var(--mantine-color-gray-0)"
              : "var(--mantine-color-dark-7)",
          },
          close: {
            color: isDark
              ? "var(--mantine-color-gray-2)"
              : "var(--mantine-color-dark-6)",
          },
        }}
      >
        <Stack gap="md">
          {draftBlock && modalMode === "create" ? null : (
            <Select
              label="Block Type"
              placeholder="Select a block type"
              data={BLOCK_TYPE_OPTIONS}
              value={draftBlock?.type ?? null}
              disabled={modalMode === "edit"}
              onChange={(value) => {
                if (value) {
                  handleDraftTypeChange(value as ContentBlock["type"]);
                } else {
                  setDraftBlock(null);
                }
              }}
              required
              styles={selectStyles}
            />
          )}

          {draftBlock ? (
            renderDraftEditor(draftBlock)
          ) : (
            <Text size="sm" c="dimmed">
              Choose a block type to begin configuring the content.
            </Text>
          )}

          <Group justify="flex-end">
            <Button
              variant="subtle"
              color={isDark ? "blue" : "dark"}
              onClick={closeModal}
              styles={{
                root: {
                  color: isDark ? "var(--mantine-color-gray-0)" : undefined,
                  "&:hover": {
                    backgroundColor: isDark
                      ? "var(--mantine-color-blue-9)"
                      : undefined,
                  },
                },
              }}
            >
              Cancel
            </Button>
            <Button
              color={isDark ? "gray" : "dark"}
              onClick={handleModalSave}
              disabled={!draftBlock}
            >
              {modalMode === "create" ? "Add Block" : "Save Changes"}
            </Button>
          </Group>
        </Stack>
      </Modal>
      {previewStoryId && (
        <StoryPreview
          storyId={previewStoryId}
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
        />
      )}
      <style jsx global>{`
        .story-block-modal-dark {
          background-color: var(--mantine-color-dark-6);
          color: var(--mantine-color-gray-0);
        }
        .story-block-modal-dark .mantine-Input-input,
        .story-block-modal-dark .mantine-Textarea-input,
        .story-block-modal-dark .mantine-Select-input,
        .story-block-modal-dark .mantine-NumberInput-input {
          background-color: var(--mantine-color-dark-5);
          color: var(--mantine-color-gray-0);
        }
        .story-block-modal-dark .mantine-InputWrapper-label {
          color: var(--mantine-color-gray-2);
        }
        .story-block-modal-light .mantine-InputWrapper-label {
          color: var(--mantine-color-dark-7);
        }
      `}</style>
    </Container>
  );
}
