"use client";
import React, { useEffect, useState, useRef } from "react";
import ImagePlaceholder from "../../assets/placeholder.svg";
import { store } from "@/redux/store";

const imageCache = new Map();

const CustomImageTag = ({
  src,
  alt,
  className,
  loadingBuilder,
  errorBuilder,
  fadeInDuration = 300,
  cacheKey,
  maxCacheSize = 100,
  retryCount = 2,
}) => {
  const settings = store.getState().settingsData?.settings?.web_settings;
  const placeholderLogo = settings?.web_half_logo || ImagePlaceholder;

  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retries, setRetries] = useState(0);

  const imgRef = useRef(null);
  const actualSrc = typeof src === "object" && src?.src ? src.src : src;
  const key = cacheKey || actualSrc;

  // Manage cache
  const updateCache = (key, url) => {
    if (imageCache.size >= maxCacheSize && !imageCache.has(key)) {
      const oldestKey = imageCache.keys().next().value;
      imageCache.delete(oldestKey);
    }
    imageCache.set(key, url);
  };

  const validateImageUrl = async (url) => {
    // ✅ Fixed: Skip validation for blob URLs and data URLs
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      return true;
    }

    try {
      const response = await fetch(url, { method: "HEAD" });
      if (!response.ok || response.status >= 400) {
        throw new Error("Invalid image URL");
      }
      return true;
    } catch (err) {
      console.warn('Image validation failed for:', url, err);
      return false;
    }
  };

  const loadImage = async () => {
    setIsLoading(true);
    setHasError(false);

    if (!actualSrc || actualSrc === "") {
      setImageSrc(placeholderLogo);
      setHasError(true);
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    if (imageCache.has(key)) {
      const cachedSrc = imageCache.get(key);
      setImageSrc(cachedSrc);
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    // ✅ Fixed: Skip validation for blob URLs and data URLs
    if (actualSrc.startsWith('blob:') || actualSrc.startsWith('data:')) {
      // For blob URLs, directly load the image without validation
      const img = new Image();
      img.onload = () => {
        updateCache(key, actualSrc);
        setImageSrc(actualSrc);
        setIsLoaded(true);
        setIsLoading(false);
      };

      img.onerror = () => {
        if (retries < retryCount) {
          setRetries(prev => prev + 1);
          setTimeout(() => loadImage(), 1000);
        } else {
          setHasError(true);
          setImageSrc(placeholderLogo);
          setIsLoaded(true);
          setIsLoading(false);
        }
      };

      img.src = actualSrc;
      return;
    }

    // Validate URL with HEAD request only for HTTP/HTTPS URLs
    const isValid = await validateImageUrl(actualSrc);
    if (!isValid) {
      setHasError(true);
      setImageSrc(placeholderLogo);
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.onload = () => {
      updateCache(key, actualSrc);
      setImageSrc(actualSrc);
      setIsLoaded(true);
      setIsLoading(false);
    };

    img.onerror = () => {
      if (retries < retryCount) {
        setRetries(prev => prev + 1);
        setTimeout(() => loadImage(), 1000);
      } else {
        setHasError(true);
        setImageSrc(placeholderLogo);
        setIsLoaded(true);
        setIsLoading(false);
      }
    };

    img.src = actualSrc;
  };

  useEffect(() => {
    setRetries(0);
    loadImage();
  }, [actualSrc, settings]);

  const fadeInStyle = {
    opacity: isLoaded ? 1 : 0,
    transition: `opacity ${fadeInDuration}ms ease-in-out`,
  };

  return (
    <div className={`relative ${className}`}>
      {/* Show loading placeholder with animation */}
      {isLoading && !hasError && (
        loadingBuilder ? loadingBuilder() : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-50 bg-opacity-80 z-10">
            <img
              src={placeholderLogo}
              alt="loading"
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
        )
      )}

      {/* If error, show placeholder directly */}
      {hasError ? (
        <img
          src={placeholderLogo}
          alt="placeholder"
          className="w-full h-full object-contain bg-gray-50 dark:bg-gray-900"
        />
      ) : (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={`${isLoaded ? 'block' : 'hidden'} w-full h-full ${className}`}
          style={fadeInStyle}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default CustomImageTag;
