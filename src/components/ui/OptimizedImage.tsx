'use client';

import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type OptimizedImageProps = {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
  onErrorAction?: () => void;
  priority?: boolean;
};

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackIcon,
  onErrorAction,
  priority = false,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onErrorAction?.();
  };

  // If no src or error, show fallback
  if (!src || hasError) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className,
        )}
        style={{ width, height }}
      >
        {fallbackIcon || <ImageIcon className="h-8 w-8" />}
      </div>
    );
  }

  // If not in view yet, show placeholder
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'flex items-center justify-center bg-gray-100 animate-pulse',
          className,
        )}
        style={{ width, height }}
      >
        <ImageIcon className="h-8 w-8 text-gray-300" />
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {isLoading && (
        <div
          className="absolute inset-0 flex animate-pulse items-center justify-center bg-gray-100"
          style={{ width, height }}
        >
          <ImageIcon className="h-8 w-8 text-gray-300" />
        </div>
      )}

      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className,
        )}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}

// Specialized components for different use cases
export function ProductImage({
  src,
  alt,
  className = '',
  size = 'medium',
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20',
  };

  const iconSizes = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8',
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size === 'small' ? 48 : size === 'medium' ? 64 : 80}
      height={size === 'small' ? 48 : size === 'medium' ? 64 : 80}
      className={cn('object-cover rounded-lg flex-shrink-0', sizeClasses[size], className)}
      fallbackIcon={<ImageIcon className={cn('text-gray-300', iconSizes[size])} />}
      {...props}
    />
  );
}

export function CardImage({
  src,
  alt,
  className = '',
  size = 'medium',
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const iconSizes = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-6 w-6',
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size === 'small' ? 32 : size === 'medium' ? 48 : 64}
      height={size === 'small' ? 32 : size === 'medium' ? 48 : 64}
      className={cn('object-cover rounded-lg flex-shrink-0', sizeClasses[size], className)}
      fallbackIcon={<ImageIcon className={cn('text-gray-300', iconSizes[size])} />}
      {...props}
    />
  );
}

export function AvatarImage({
  src,
  alt,
  className = '',
  size = 'medium',
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10',
  };

  const iconSizes = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5',
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size === 'small' ? 24 : size === 'medium' ? 32 : 40}
      height={size === 'small' ? 24 : size === 'medium' ? 32 : 40}
      className={cn('rounded-full object-cover flex-shrink-0', sizeClasses[size], className)}
      fallbackIcon={<ImageIcon className={cn('text-gray-300', iconSizes[size])} />}
      {...props}
    />
  );
}

export function ThumbnailImage({
  src,
  alt,
  className = '',
  size = 'medium',
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-20 h-20',
    large: 'w-24 h-24',
  };

  const iconSizes = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6',
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size === 'small' ? 64 : size === 'medium' ? 80 : 96}
      height={size === 'small' ? 64 : size === 'medium' ? 80 : 96}
      className={cn('object-cover rounded flex-shrink-0', sizeClasses[size], className)}
      fallbackIcon={<ImageIcon className={cn('text-gray-300', iconSizes[size])} />}
      {...props}
    />
  );
}
