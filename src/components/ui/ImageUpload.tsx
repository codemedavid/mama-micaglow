'use client';

import { Image as ImageIcon, Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { uploadImage } from '@/lib/storage';

type ImageUploadProps = {
  onImageUploadedAction: (url: string) => void;
  onImageRemovedAction?: () => void;
  currentImageUrl?: string;
  bucket?: string;
  disabled?: boolean;
  className?: string;
};

export function ImageUpload({
  onImageUploadedAction,
  onImageRemovedAction,
  currentImageUrl,
  bucket = 'product_image',
  disabled = false,
  className = '',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const result = await uploadImage({
        file,
        bucket,
      });

      if (result.success && result.url) {
        setPreview(result.url);
        onImageUploadedAction(result.url);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemovedAction?.();
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {preview
        ? (
            <Card className="relative overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={preview}
                    alt="Preview"
                    width={400}
                    height={192}
                    className="h-48 w-full object-cover"
                  />
                  {!disabled && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        : (
            <Card
              className={`cursor-pointer border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400 ${
                disabled || isUploading ? 'cursor-not-allowed opacity-50' : ''
              }`}
              onClick={handleClick}
            >
              <CardContent className="flex flex-col items-center justify-center py-12">
                {isUploading
                  ? (
                      <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
                    )
                  : (
                      <Upload className="h-12 w-12 text-gray-400" />
                    )}
                <p className="mt-4 text-sm text-gray-600">
                  {isUploading ? 'Uploading...' : 'Click to upload an image'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, WEBP up to 5MB
                </p>
              </CardContent>
            </Card>
          )}

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!preview && !isUploading && (
        <Button
          variant="outline"
          onClick={handleClick}
          disabled={disabled}
          className="w-full"
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Choose Image
        </Button>
      )}
    </div>
  );
}
