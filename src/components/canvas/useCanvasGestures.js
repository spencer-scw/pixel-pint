import { useState, useRef } from 'react';
import { getDistance, getMidpoint } from './canvasUtils';

export const useCanvasGestures = (checkerboardRef) => {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const touchState = useRef({
    initialDistance: 0,
    initialScale: 1,
    initialMidpoint: { x: 0, y: 0 },
    initialOffset: { x: 0, y: 0 },
    isZooming: false
  });

  const handleGestureStart = (e) => {
    if (e.touches.length === 2) {
      touchState.current.isZooming = true;
      const d = getDistance(e.touches[0], e.touches[1]);
      const m = getMidpoint(e.touches[0], e.touches[1]);
      touchState.current.initialDistance = d;
      touchState.current.initialScale = transform.scale;
      touchState.current.initialMidpoint = m;
      touchState.current.initialOffset = { x: transform.x, y: transform.y };
      return true;
    }
    return false;
  };

  const handleGestureMove = (e) => {
    if (e.touches.length === 2 && touchState.current.isZooming) {
      const d = getDistance(e.touches[0], e.touches[1]);
      const m = getMidpoint(e.touches[0], e.touches[1]);
      
      const sensitivity = 1.5;
      const ratio = d / touchState.current.initialDistance;
      const newScale = Math.max(1, touchState.current.initialScale * (1 + (ratio - 1) * sensitivity));
      
      const dx = (m.x - touchState.current.initialMidpoint.x);
      const dy = (m.y - touchState.current.initialMidpoint.y);
      
      let newX = touchState.current.initialOffset.x + dx;
      let newY = touchState.current.initialOffset.y + dy;

      const canvasContainer = checkerboardRef.current?.parentElement;
      if (canvasContainer) {
        const rect = canvasContainer.getBoundingClientRect();
        const maxOffsetX = (newScale - 1) * rect.width / 2;
        const maxOffsetY = (newScale - 1) * rect.height / 2;
        
        newX = Math.max(-maxOffsetX, Math.min(maxOffsetX, newX));
        newY = Math.max(-maxOffsetY, Math.min(maxOffsetY, newY));
      }
      
      setTransform({
        scale: newScale,
        x: newX,
        y: newY
      });
      return true;
    }
    return false;
  };

  const resetTransform = () => setTransform({ scale: 1, x: 0, y: 0 });

  return {
    transform,
    touchState,
    handleGestureStart,
    handleGestureMove,
    resetTransform
  };
};
