import React, { useRef, useState, useEffect } from "react";
import { Label } from "@/components/ui/label";

interface FileUploadProps {
  id?: string;
  label?: string;
  accept?: string;
  onChange: (files: File[]) => void;
  value?: File[];
  required?: boolean;
  error?: string;
  multiple?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  id = "file-upload",
  label,
  accept = "image/*",
  onChange,
  value = [],
  required = false,
  error,
  multiple = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const previousFilesRef = useRef<File[]>([]);

  // Generate preview URLs when value changes
  useEffect(() => {
    // Check if files actually changed (by comparing file objects)
    const filesChanged =
      value.length !== previousFilesRef.current.length ||
      value.some((file, index) => file !== previousFilesRef.current[index]);

    if (!filesChanged) {
      return;
    }

    // Revoke old URLs to prevent memory leaks
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    // Create new preview URLs
    const newUrls = value.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newUrls);
    previousFilesRef.current = value;

    // Cleanup function
    return () => {
      newUrls.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      onChange(fileArray);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      onChange(fileArray);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();
    const newFiles = value.filter((_, index) => index !== indexToRemove);
    onChange(newFiles);

    // Reset input if no files left
    if (newFiles.length === 0 && inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemoveAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const hasFiles = value.length > 0;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label} {required && "*"}
        </Label>
      )}

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 cursor-pointer
          transition-all duration-200 ease-in-out
          ${
            isDragging
              ? "border-[#746650] bg-[#f5f0e8]"
              : error
                ? "border-red-300 bg-red-50 hover:border-red-400"
                : "border-[#e5d8c2] bg-white hover:border-[#746650] hover:bg-[#faf8f5]"
          }
        `}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          required={required}
          multiple={multiple}
        />

        {hasFiles ? (
          <div className="space-y-4">
            {/* Multiple Images Preview */}
            {multiple && value.length > 1 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {value.map((file, index) => (
                    <div
                      key={index}
                      className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={previewUrls[index]}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => handleRemove(e, index)}
                        className="absolute top-1 right-1 bg-white/90 hover:bg-white text-red-600 rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
                        type="button"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18 6L6 18M6 6L18 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* File Count and Clear All */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#746650] font-medium">
                    {value.length} file{value.length !== 1 ? "s" : ""} selected
                  </span>
                  <button
                    onClick={handleRemoveAll}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                    type="button"
                  >
                    Clear all
                  </button>
                </div>
              </>
            ) : (
              /* Single Image Preview */
              <>
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                  <img src={previewUrls[0]} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => handleRemove(e, 0)}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                    type="button"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* File Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#746650] font-medium truncate">{value[0].name}</span>
                  <span className="text-[#8b7a5f] ml-2">
                    {(value[0].size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </>
            )}

            <p className="text-xs text-center text-[#8b7a5f]">
              Click or drag to {multiple ? "replace images" : "replace image"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Upload Icon */}
            <div className="w-16 h-16 rounded-full bg-[#f5f0e8] flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#746650]"
              >
                <path
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 8L12 3L7 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 3V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Upload Text */}
            <div className="text-center">
              <p className="text-[#746650] font-medium mb-1">Click to upload or drag and drop</p>
              <p className="text-sm text-[#8b7a5f]">
                {multiple
                  ? "PNG, JPG, GIF, WebP or SVG (max. 5MB each)"
                  : "PNG, JPG, GIF, WebP or SVG (max. 5MB)"}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
