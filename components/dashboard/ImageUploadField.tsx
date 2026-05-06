"use client";

import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadFieldProps {
  label?: string;
  currentUrl?: string | null;
  onFileSelect: (file: File | null) => void;
  maxSizeMB?: number;
  helpText?: string;
  aspectHint?: string;
}

export default function ImageUploadField({
  label,
  currentUrl,
  onFileSelect,
  maxSizeMB = 5,
  helpText,
  aspectHint,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("File must be an image.");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image must be under ${maxSizeMB}MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    onFileSelect(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayUrl = preview || currentUrl;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}

      {displayUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <div className="relative w-full h-48">
            <Image
              src={displayUrl}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-1.5 bg-white rounded-lg shadow text-gray-600 hover:text-primary transition-colors"
              title="Change image"
            >
              <Upload size={14} />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 bg-white rounded-lg shadow text-gray-600 hover:text-red-500 transition-colors"
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-40 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <ImageIcon size={20} className="text-gray-400" />
          </div>
          <span className="text-sm text-muted">Click to upload image</span>
          {aspectHint && (
            <span className="text-xs text-muted/70">{aspectHint}</span>
          )}
          <span className="text-xs text-muted/50">Max {maxSizeMB}MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {helpText && !error && (
        <p className="mt-1 text-xs text-muted">{helpText}</p>
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
