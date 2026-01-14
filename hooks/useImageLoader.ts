import { useEffect } from 'react';

/**
 * Custom hook to handle image fade-in on load.
 * Watches for images with 'lazy-load' class and adds 'loaded' class when fully loaded.
 * 
 * @param deps Dependency array to re-run the effect (e.g. content changes)
 */
export const useImageLoader = (deps: any[] = []) => {
  useEffect(() => {
    const images = document.querySelectorAll('img.lazy-load');

    const handleLoad = (event: Event) => {
      const img = event.target as HTMLImageElement;
      img.classList.add('loaded');
    };

    images.forEach((img) => {
      const imageElement = img as HTMLImageElement;
      if (imageElement.complete) {
        imageElement.classList.add('loaded');
      } else {
        imageElement.addEventListener('load', handleLoad);
      }
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener('load', handleLoad);
      });
    };
  }, deps);
};
