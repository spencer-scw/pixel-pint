import { useRef } from 'react';
import { getPixel, colorsMatch, hexToRgba } from './canvasUtils';

export const useCanvasDrawing = (width, height, activeTool, activeLayer, selectedColor, onCanvasChange) => {
  const isDrawing = useRef(false);

  const floodFill = (ctx, startX, startY, fillColor) => {
    const imgData = ctx.getImageData(0, 0, width, height);
    const targetColor = getPixel(imgData, startX, startY, width);
    const fillRGBA = hexToRgba(fillColor);

    if (colorsMatch(targetColor, fillRGBA)) return;

    const pixelsToCheck = [[startX, startY]];
    while (pixelsToCheck.length > 0) {
      const [x, y] = pixelsToCheck.pop();
      const currentColor = getPixel(imgData, x, y, width);

      if (colorsMatch(currentColor, targetColor)) {
        const i = (y * width + x) * 4;
        imgData.data[i] = fillRGBA[0];
        imgData.data[i + 1] = fillRGBA[1];
        imgData.data[i + 2] = fillRGBA[2];
        imgData.data[i + 3] = fillRGBA[3];

        if (x > 0) pixelsToCheck.push([x - 1, y]);
        if (x < width - 1) pixelsToCheck.push([x + 1, y]);
        if (y > 0) pixelsToCheck.push([x, y - 1]);
        if (y < height - 1) pixelsToCheck.push([x, y + 1]);
      }
    }
    ctx.putImageData(imgData, 0, 0);
    if (onCanvasChange) onCanvasChange();
  };

  const handleAction = (clientX, clientY, backgroundRef, foregroundRef, forceDraw = false, isZooming = false) => {
    if (isZooming) return;

    const canvas = activeLayer === 'background' ? backgroundRef.current : foregroundRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const localX = (clientX - rect.left);
    const localY = (clientY - rect.top);

    const x = Math.floor(localX * (width / rect.width));
    const y = Math.floor(localY * (height / rect.height));

    if (x >= 0 && x < width && y >= 0 && y < height) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (activeTool === 'fill' && !forceDraw) {
        floodFill(ctx, x, y, selectedColor);
      } else if (activeTool === 'erase') {
        ctx.clearRect(x, y, 1, 1);
        if (onCanvasChange) onCanvasChange();
      } else if (activeTool === 'draw') {
        ctx.fillStyle = selectedColor;
        ctx.fillRect(x, y, 1, 1);
        if (onCanvasChange) onCanvasChange();
      }
    }
  };

  return {
    isDrawing,
    handleAction
  };
};
