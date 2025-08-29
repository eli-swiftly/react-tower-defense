import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

export function useResponsiveCanvas(canvasRef: RefObject<HTMLCanvasElement | null>): void {
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const container = canvas.parentElement;
      if (!container) return;
      
      const { width, height } = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // Set actual canvas size accounting for device pixel ratio
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      // Scale canvas for HiDPI displays
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      
      // Set CSS size
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    
    // Initial size
    updateCanvasSize();
    
    // Handle resize
    window.addEventListener('resize', updateCanvasSize);
    
    // Handle orientation change on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(updateCanvasSize, 100);
    });
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('orientationchange', updateCanvasSize);
    };
  }, [canvasRef]);
}

export function useViewportSize(): { width: number; height: number } {
  const getSize = () => ({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [size, setSize] = useState(getSize);

  useEffect(() => {
    const handleResize = () => setSize(getSize());
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
