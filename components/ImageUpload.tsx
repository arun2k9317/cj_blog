"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { IconUpload, IconFolderPlus } from "@tabler/icons-react";
import {
  Button,
  Group,
  SimpleGrid,
  Text,
  Select,
  TextInput,
  Stack,
} from "@mantine/core";
import type { ButtonProps } from "@mantine/core";
import { useTheme } from "@/contexts/ThemeContext";

interface ImageUploadProps {
  projectId: string;
  onUploadComplete: (url: string, filename: string) => void;
  onUploadError?: (error: string) => void;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
  multiple?: boolean; // Allow multiple file selection
  maxFiles?: number; // Maximum number of files allowed
  onUploadButtonChange?: (config: UploadButtonConfig | null) => void;
  availableFolders?: string[]; // Available folders for gallery uploads
  onFoldersChange?: (folders: string[]) => void; // Callback when folders list changes
}

export interface UploadButtonConfig {
  disabled: boolean;
  variant: ButtonProps["variant"];
  loading: boolean;
  title: string;
  text: string;
  onClick: () => void;
}

interface UploadProgress {
  uploading: boolean;
  progress: number;
  fileName?: string;
  currentFile?: number;
  totalFiles?: number;
}

interface SelectedFile {
  file: File;
  preview: string;
}

const DEFAULT_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export default function ImageUpload({
  projectId,
  onUploadComplete,
  onUploadError,
  maxFileSize = 50,
  acceptedTypes: acceptedTypesProp,
  className = "",
  multiple = true,
  maxFiles = 20,
  onUploadButtonChange,
  availableFolders = [],
  onFoldersChange,
}: ImageUploadProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const acceptedTypes = useMemo<string[]>(() => {
    return acceptedTypesProp ?? [...DEFAULT_ACCEPTED_TYPES];
  }, [acceptedTypesProp]);
  const [uploadState, setUploadState] = useState<UploadProgress>({
    uploading: false,
    progress: 0,
  });
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFilesState] = useState<SelectedFile[]>([]);
  const selectedFilesRef = useRef<SelectedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Folder selection state (only for gallery uploads)
  const isGalleryUpload = projectId === "gallery";
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const setSelectedFiles = useCallback(
    (value: SelectedFile[] | ((prev: SelectedFile[]) => SelectedFile[])) => {
      setSelectedFilesState((prev) => {
        const next =
          typeof value === "function"
            ? (value as (prev: SelectedFile[]) => SelectedFile[])(prev)
            : value;
        selectedFilesRef.current = next;
        return next;
      });
    },
    []
  );

  useEffect(() => {
    selectedFilesRef.current = selectedFiles;
  }, [selectedFiles]);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return `File type not supported. Please use: ${acceptedTypes.join(
          ", "
        )}`;
      }

      if (file.size > maxFileSize * 1024 * 1024) {
        return `File size must be less than ${maxFileSize}MB`;
      }

      return null;
    },
    [acceptedTypes, maxFileSize]
  );

  const handleFileUpload = useCallback(
    async (selected: SelectedFile[]) => {
      if (selected.length === 0) return;

      const files = selected.map((item) => item.file);

      // Validate all files first
      const validationErrors: string[] = [];
      files.forEach((file, index) => {
        const error = validateFile(file);
        if (error) {
          validationErrors.push(`File ${index + 1} (${file.name}): ${error}`);
        }
      });

      if (validationErrors.length > 0) {
        onUploadError?.(validationErrors.join("\n"));
        return;
      }

      setUploadState({
        uploading: true,
        progress: 0,
        fileName: files.length === 1 ? files[0].name : `${files.length} files`,
        currentFile: 0,
        totalFiles: files.length,
      });

      const errors: string[] = [];

      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progress = ((i + 1) / files.length) * 100;

        setUploadState((prev) => ({
          ...prev,
          progress,
          currentFile: i + 1,
          fileName: file.name,
        }));

        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("projectId", projectId);

          const imageName = file.name
            .split(".")[0]
            .replace(/[^a-zA-Z0-9]/g, "-");
          formData.append("imageName", imageName);

          // Add folder parameter for gallery uploads
          if (isGalleryUpload && selectedFolder) {
            formData.append("folder", selectedFolder);
          }

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const result = await response.json();

          if (response.ok) {
            onUploadComplete(result.url, result.filename);
          } else {
            errors.push(`${file.name}: ${result.error || "Upload failed"}`);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Upload failed";
          errors.push(`${file.name}: ${errorMessage}`);
        }
      }

      // Clean up preview URLs
      selected.forEach(({ preview }) => {
        URL.revokeObjectURL(preview);
      });
      setSelectedFiles([]);

      if (errors.length > 0) {
        onUploadError?.(errors.join("\n"));
      }

      setTimeout(() => {
        setUploadState({ uploading: false, progress: 0 });
      }, 1000);
    },
    [
      onUploadComplete,
      onUploadError,
      projectId,
      validateFile,
      setSelectedFiles,
      isGalleryUpload,
      selectedFolder,
    ]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length === 0) {
      onUploadError?.("No image files found");
      return;
    }

    if (files.length > maxFiles) {
      onUploadError?.(
        `Maximum ${maxFiles} files allowed. You selected ${files.length} files.`
      );
      return;
    }

    const newFiles: SelectedFile[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedFiles((prev) => {
      const combined = [...prev, ...newFiles];
      if (combined.length > maxFiles) {
        // Clean up excess files
        combined.slice(maxFiles).forEach(({ preview }) => {
          URL.revokeObjectURL(preview);
        });
        return combined.slice(0, maxFiles);
      }
      return combined;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length === 0) {
      onUploadError?.("No image files selected");
      return;
    }

    if (files.length > maxFiles) {
      onUploadError?.(
        `Maximum ${maxFiles} files allowed. You selected ${files.length} files.`
      );
      return;
    }

    const newFiles: SelectedFile[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedFiles((prev) => {
      const combined = [...prev, ...newFiles];
      if (combined.length > maxFiles) {
        // Clean up excess files
        combined.slice(maxFiles).forEach(({ preview }) => {
          URL.revokeObjectURL(preview);
        });
        return combined.slice(0, maxFiles);
      }
      return combined;
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const clearAllFiles = () => {
    selectedFilesRef.current.forEach(({ preview }) => {
      URL.revokeObjectURL(preview);
    });
    setSelectedFiles([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleCreateFolder = useCallback(() => {
    if (!newFolderName.trim()) {
      onUploadError?.("Folder name cannot be empty");
      return;
    }

    const sanitized = newFolderName.trim().replace(/[^a-zA-Z0-9\s\-_]/g, "");
    if (sanitized.length === 0 || sanitized.length > 50) {
      onUploadError?.(
        "Folder name must be 1-50 characters and contain only letters, numbers, spaces, hyphens, and underscores"
      );
      return;
    }

    // Add to available folders if not already present
    if (!availableFolders.includes(sanitized)) {
      const updatedFolders = [...availableFolders, sanitized].sort();
      onFoldersChange?.(updatedFolders);
    }

    setSelectedFolder(sanitized);
    setNewFolderName("");
    setShowNewFolderInput(false);
  }, [newFolderName, availableFolders, onFoldersChange, onUploadError]);

  const handleUploadClick = useCallback(() => {
    const currentFiles = selectedFilesRef.current;
    if (currentFiles.length > 0) {
      void handleFileUpload(currentFiles);
    } else {
      openFileDialog();
    }
  }, [handleFileUpload, openFileDialog]);

  const hasSelectedFiles = selectedFiles.length > 0;
  const isUploading = uploadState.uploading;
  const buttonDisabled = isUploading || selectedFiles.length === 0;
  const buttonVariant = hasSelectedFiles ? "filled" : "outline";
  const uploadButtonTitle = isUploading
    ? "Uploading..."
    : hasSelectedFiles
    ? `Upload ${selectedFiles.length} ${
        selectedFiles.length === 1 ? "file" : "files"
      }`
    : "Select files first";
  const uploadButtonText = isUploading
    ? `Uploading… ${
        uploadState.currentFile && uploadState.totalFiles
          ? `(${uploadState.currentFile}/${uploadState.totalFiles})`
          : ""
      }`
    : hasSelectedFiles
    ? `Upload ${selectedFiles.length} ${
        selectedFiles.length === 1 ? "Image" : "Images"
      }`
    : "Select Files";

  const uploadButtonConfig = useMemo<UploadButtonConfig>(
    () => ({
      disabled: buttonDisabled,
      variant: buttonVariant,
      loading: isUploading,
      title: uploadButtonTitle,
      text: uploadButtonText,
      onClick: handleUploadClick,
    }),
    [
      buttonDisabled,
      buttonVariant,
      isUploading,
      uploadButtonTitle,
      uploadButtonText,
      handleUploadClick,
    ]
  );

  const prevConfigRef = useRef<UploadButtonConfig | null>(null);

  useEffect(() => {
    if (!onUploadButtonChange) return;

    const prevConfig = prevConfigRef.current;
    const cfg = uploadButtonConfig;

    const hasChanged =
      !prevConfig ||
      prevConfig.disabled !== cfg.disabled ||
      prevConfig.variant !== cfg.variant ||
      prevConfig.loading !== cfg.loading ||
      prevConfig.title !== cfg.title ||
      prevConfig.text !== cfg.text ||
      prevConfig.onClick !== cfg.onClick;

    if (hasChanged) {
      prevConfigRef.current = cfg;
      onUploadButtonChange(cfg);
    }
  }, [onUploadButtonChange, uploadButtonConfig]);

  useEffect(() => {
    return () => {
      prevConfigRef.current = null;
      if (onUploadButtonChange) {
        onUploadButtonChange(null);
      }
    };
  }, [onUploadButtonChange]);

  const uploadButtonElement = (
    <Button
      onClick={uploadButtonConfig.onClick}
      disabled={uploadButtonConfig.disabled}
      variant={uploadButtonConfig.variant}
      color="dark"
      loading={uploadButtonConfig.loading}
      title={uploadButtonConfig.title}
    >
      {uploadButtonConfig.text}
    </Button>
  );

  return (
    <div className={`image-upload-container ${className}`}>
      {/* Folder selection UI for gallery uploads */}
      {isGalleryUpload && (
        <Stack gap="xs" mb="sm">
          <Group gap="xs" align="flex-end" wrap="nowrap">
            <Select
              placeholder="Select folder"
              label="Folder"
              data={availableFolders.map((f) => ({ value: f, label: f }))}
              value={selectedFolder}
              onChange={(value) => setSelectedFolder(value)}
              style={{ flex: 1 }}
              size="xs"
              clearable
              searchable
              classNames={{
                input: "folder-select-input",
              }}
              styles={{
                label: {
                  color: isDark
                    ? "var(--mantine-color-gray-2)"
                    : "var(--mantine-color-dark-9)",
                },
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
            <Button
              variant="outline"
              size="xs"
              leftSection={<IconFolderPlus size={16} />}
              onClick={() => {
                setShowNewFolderInput(!showNewFolderInput);
                if (showNewFolderInput) {
                  setNewFolderName("");
                }
              }}
              color={isDark ? "blue" : "dark"}
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
              New Folder
            </Button>
          </Group>
          {showNewFolderInput && (
            <Group gap="xs" align="flex-end" wrap="nowrap">
              <TextInput
                placeholder="Enter folder name"
                label="Folder Name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateFolder();
                  }
                }}
                style={{ flex: 1 }}
                size="xs"
              />
              <Button
                size="xs"
                variant="filled"
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
              >
                Create
              </Button>
              <Button
                size="xs"
                variant="subtle"
                onClick={() => {
                  setShowNewFolderInput(false);
                  setNewFolderName("");
                }}
              >
                Cancel
              </Button>
            </Group>
          )}
        </Stack>
      )}
      <div className="upload-scrollable">
        <div
          className={`upload-area ${dragOver ? "drag-over" : ""} ${
            uploadState.uploading ? "uploading" : ""
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={selectedFiles.length === 0 ? openFileDialog : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(",")}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploadState.uploading}
            multiple={multiple}
          />

          {uploadState.uploading ? (
            <div className="upload-progress">
              <div className="upload-spinner"></div>
              <p className="upload-text">
                {uploadState.totalFiles && uploadState.totalFiles > 1
                  ? `Uploading ${uploadState.currentFile}/${uploadState.totalFiles}: ${uploadState.fileName}`
                  : `Uploading ${uploadState.fileName}...`}
              </p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadState.progress}%` }}
                ></div>
              </div>
            </div>
          ) : selectedFiles.length > 0 ? (
            <div className="upload-preview-multiple">
              <div className="preview-header">
                <Text size="xs" fw={500}>
                  {selectedFiles.length}{" "}
                  {selectedFiles.length === 1 ? "file" : "files"} selected
                </Text>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAllFiles();
                  }}
                >
                  Clear All
                </Button>
              </div>
              <div className="preview-scroll">
                <SimpleGrid
                  cols={{ base: 3, sm: 4 }}
                  spacing="xs"
                  className="preview-grid"
                >
                  {selectedFiles.map((selectedFile, index) => (
                    <div key={index} className="preview-item">
                      <div className="preview-image-wrapper">
                        <Image
                          src={selectedFile.preview}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="preview-image"
                          style={{ objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="preview-remove-btn"
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                      <p
                        className="preview-filename"
                        title={selectedFile.file.name}
                      >
                        {selectedFile.file.name.length > 14
                          ? `${selectedFile.file.name.substring(0, 14)}...`
                          : selectedFile.file.name}
                      </p>
                    </div>
                  ))}
                </SimpleGrid>
              </div>
            </div>
          ) : (
            <div className="upload-content">
              <div className="upload-icon">
                <IconUpload size={30} />
              </div>
              <p className="upload-text">
                {multiple
                  ? "Drag & drop images here or click to select multiple"
                  : "Drag & drop an image here or click to select"}
              </p>
              <Button
                variant="outline"
                size="sm"
                leftSection={<IconUpload size={18} />}
                onClick={(e) => {
                  e.stopPropagation();
                  openFileDialog();
                }}
                color={isDark ? "blue" : "dark"}
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
                Choose Files
              </Button>
              {/* <p className="upload-subtext">
                Supports: JPG, PNG, WebP (Max {maxFileSize}MB
                {multiple ? `, up to ${maxFiles} files` : ""})
              </p> */}
            </div>
          )}
        </div>
      </div>

      {/* Explicit upload button for clarity */}
      {!onUploadButtonChange && (
        <Group justify="center" mt="md" style={{ marginTop: "auto" }}>
          {uploadButtonElement}
        </Group>
      )}

      <style jsx>{`
        .image-upload-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .image-upload-container :global(.folder-select-input[data-placeholder]),
        .image-upload-container :global(.folder-select-input::placeholder) {
          color: ${isDark
            ? "var(--mantine-color-gray-3)"
            : "var(--mantine-color-gray-6)"} !important;
        }

        .image-upload-container :global([data-placeholder]) {
          color: ${isDark
            ? "var(--mantine-color-gray-3)"
            : "var(--mantine-color-gray-6)"} !important;
        }

        .image-upload-container :global(input.hidden),
        .image-upload-container input[type="file"] {
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          padding: 0 !important;
          margin: -1px !important;
          overflow: hidden !important;
          clip: rect(0, 0, 0, 0) !important;
          white-space: nowrap !important;
          border: 0 !important;
          opacity: 0 !important;
        }

        .upload-scrollable {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding-bottom: 0.5rem;
          width: 100%;
          box-sizing: border-box;
        }

        .upload-area {
          border: 2px dashed
            ${isDark ? "var(--mantine-color-dark-4)" : "#d1d5db"};
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: ${isDark
            ? "var(--mantine-color-dark-5)"
            : "#f9fafb"};
          min-height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          flex: 1;
          gap: 0.75rem;
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }

        .upload-area:hover {
          border-color: ${isDark ? "var(--mantine-color-blue-6)" : "#3b82f6"};
          background-color: ${isDark
            ? "var(--mantine-color-dark-4)"
            : "#eff6ff"};
        }

        .upload-area.drag-over {
          border-color: ${isDark ? "var(--mantine-color-blue-6)" : "#3b82f6"};
          background-color: ${isDark
            ? "var(--mantine-color-dark-3)"
            : "#dbeafe"};
          transform: scale(1.01);
          box-shadow: 0 4px 12px
            ${isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.15)"};
        }

        .upload-area.uploading {
          border-color: ${isDark ? "var(--mantine-color-blue-6)" : "#3b82f6"};
          background-color: ${isDark
            ? "var(--mantine-color-dark-4)"
            : "#eff6ff"};
          cursor: not-allowed;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .upload-icon {
          color: ${isDark ? "var(--mantine-color-gray-4)" : "#6b7280"};
        }

        .upload-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: ${isDark ? "var(--mantine-color-gray-0)" : "#111827"};
          margin: 0;
        }

        .upload-subtext {
          font-size: 0.75rem;
          color: ${isDark ? "var(--mantine-color-gray-4)" : "#6b7280"};
          margin: 0;
        }

        .upload-progress {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        .upload-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .progress-bar {
          width: 240px;
          height: 6px;
          background-color: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background-color: #3b82f6;
          transition: width 0.3s ease;
        }

        .upload-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .preview-image {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .preview-text {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .upload-preview-multiple {
          width: 100%;
          max-width: 100%;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .preview-scroll {
          max-height: 240px;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 0.25rem;
          width: 100%;
          box-sizing: border-box;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          width: 100%;
          box-sizing: border-box;
        }

        .preview-count {
          font-size: 0.875rem;
          font-weight: 500;
          color: ${isDark ? "var(--mantine-color-gray-0)" : "#111827"};
          margin: 0;
        }

        .preview-grid {
          padding: 0.25rem;
          width: 100%;
          box-sizing: border-box;
        }

        .preview-item {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .preview-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid
            ${isDark ? "var(--mantine-color-dark-4)" : "#e5e7eb"};
          background: ${isDark ? "var(--mantine-color-dark-4)" : "#f9fafb"};
        }

        .preview-image-wrapper .preview-image {
          border-radius: 8px;
        }

        .preview-remove-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 24px;
          height: 24px;
          background-color: rgba(220, 38, 38, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .preview-image-wrapper:hover .preview-remove-btn {
          opacity: 1;
        }

        .preview-filename {
          font-size: 0.7rem;
          color: ${isDark ? "var(--mantine-color-gray-4)" : "#6b7280"};
          margin: 0;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
