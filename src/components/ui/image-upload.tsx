'use client';

import { Image as ImageIcon, Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ImageUploadProps = {
  value?: string;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  className?: string;
};

export function ImageUpload({ value, onChange, disabled, className }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) {
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64 for now (in production, you'd upload to a service like Cloudinary, AWS S3, etc.)
      const base64 = await convertToBase64(file);
      onChange(base64);
    } catch {
      // Handle error if needed
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) {
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0]) {
      handleFileUpload(files[0] as File);
    }
  }, [handleFileUpload, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0] as File);
    }
  };

  const handleRemoveImage = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {value
        ? (
            <div className="group relative">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src={value}
                      alt="Product preview"
                      className="h-48 w-full object-cover"
                      width={192}
                      height={192}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleClick}
                          disabled={disabled || isUploading}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Replace
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleRemoveImage}
                          disabled={disabled || isUploading}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        : (
            <Card
              className={cn(
                'border-2 border-dashed transition-colors cursor-pointer',
                isDragOver
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-gray-400',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClick}
            >
              <CardContent className="flex flex-col items-center justify-center py-12">
                {isUploading
                  ? (
                      <>
                        <Loader2 className="mb-4 h-12 w-12 animate-spin text-purple-600" />
                        <p className="text-sm text-gray-600">Uploading image...</p>
                      </>
                    )
                  : (
                      <>
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                          <ImageIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="text-center">
                          <p className="mb-1 text-sm font-medium text-gray-900">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      </>
                    )}
              </CardContent>
            </Card>
          )}
    </div>
  );
}
