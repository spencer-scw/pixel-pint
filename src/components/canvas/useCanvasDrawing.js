import { useRef } from 'react';
import { getPixel, colorsMatch, hexToRgba, rgbaToHex } from './canvasUtils';

export const useCanvasDrawing = (width, height, activeTool, activeLayer, selectedColor, onCanvasChange, onColorPick, pixelPerfect = false) => {
  const isDrawing = useRef(false);

  // Per-stroke state — reset on endStroke
  const strokeOrigin = useRef(null);    // { x, y } first pixel of the current stroke (for line/shape tools)
  const lastDrawnPixel = useRef(null);  // { x, y } most recently committed pixel (for pixel-perfect mode)
  const waitingPixel = useRef(null);    // { x, y } deferred pixel candidate (for pixel-perfect mode)
  const activeCanvasRef = useRef(null); // the canvas being drawn on during the stroke

  const getActiveCanvas = (backgroundRef, foregroundRef) =>
    activeLayer === 'background' ? backgroundRef.current : foregroundRef.current;

  const getPixelCoords = (clientX, clientY, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left) * (width / rect.width));
    const y = Math.floor((clientY - rect.top) * (height / rect.height));
    return { x, y };
  };

  const applyDrawAction = (ctx, x, y) => {
    if (activeTool === 'erase') {
      ctx.clearRect(x, y, 1, 1);
    } else if (activeTool === 'draw') {
      ctx.fillStyle = selectedColor;
      ctx.fillRect(x, y, 1, 1);
    }
    if (onCanvasChange) onCanvasChange();
  };

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

  // Called on pointer down for stroke-based tools (draw, erase).
  // Seeds per-stroke state and draws the first pixel.
  const startStroke = (clientX, clientY, backgroundRef, foregroundRef) => {
    const canvas = getActiveCanvas(backgroundRef, foregroundRef);
    if (!canvas) return;

    const { x, y } = getPixelCoords(clientX, clientY, canvas);
    if (x < 0 || x >= width || y < 0 || y >= height) return;

    isDrawing.current = true;
    activeCanvasRef.current = canvas;
    strokeOrigin.current = { x, y };
    lastDrawnPixel.current = { x, y };
    waitingPixel.current = { x, y };

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    applyDrawAction(ctx, x, y);
  };

  // Called on pointer move for stroke-based tools.
  // In pixel-perfect mode: defers the current pixel until the stroke moves away from
  // the last drawn pixel, eliminating isolated corner pixels on diagonal lines.
  const continueStroke = (clientX, clientY, backgroundRef, foregroundRef) => {
    if (!isDrawing.current) return;

    const canvas = getActiveCanvas(backgroundRef, foregroundRef);
    if (!canvas) return;

    const { x, y } = getPixelCoords(clientX, clientY, canvas);
    if (x < 0 || x >= width || y < 0 || y >= height) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (pixelPerfect && lastDrawnPixel.current) {
      const last = lastDrawnPixel.current;
      const isAdjacent = Math.abs(x - last.x) <= 1 && Math.abs(y - last.y) <= 1;

      if (isAdjacent) {
        // Still adjacent to last drawn pixel — hold this pixel as the candidate
        waitingPixel.current = { x, y };
      } else {
        // Moved beyond adjacency — commit the waiting pixel and advance
        const waiting = waitingPixel.current;
        if (waiting) applyDrawAction(ctx, waiting.x, waiting.y);
        lastDrawnPixel.current = waiting ? { ...waiting } : { x, y };
        waitingPixel.current = { x, y };
      }
    } else {
      applyDrawAction(ctx, x, y);
      lastDrawnPixel.current = { x, y };
      waitingPixel.current = { x, y };
    }
  };

  // Called on pointer up/leave. Flushes the waiting pixel in pixel-perfect mode,
  // then clears all per-stroke state.
  const endStroke = () => {
    if (pixelPerfect && waitingPixel.current && isDrawing.current && activeCanvasRef.current) {
      const { x, y } = waitingPixel.current;
      const ctx = activeCanvasRef.current.getContext('2d', { willReadFrequently: true });
      applyDrawAction(ctx, x, y);
    }

    isDrawing.current = false;
    activeCanvasRef.current = null;
    strokeOrigin.current = null;
    lastDrawnPixel.current = null;
    waitingPixel.current = null;
  };

  // Called for single-click tools (fill, eyedropper) that have no stroke continuation.
  const handleClickAction = (clientX, clientY, backgroundRef, foregroundRef) => {
    const canvas = getActiveCanvas(backgroundRef, foregroundRef);
    if (!canvas) return;

    const { x, y } = getPixelCoords(clientX, clientY, canvas);
    if (x < 0 || x >= width || y < 0 || y >= height) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (activeTool === 'eyedropper') {
      const imgData = ctx.getImageData(0, 0, width, height);
      const [r, g, b, a] = getPixel(imgData, x, y, width);
      if (a > 0 && onColorPick) onColorPick(rgbaToHex(r, g, b));
    } else if (activeTool === 'fill') {
      floodFill(ctx, x, y, selectedColor);
    }
  };

  return {
    isDrawing,
    strokeOrigin,
    lastDrawnPixel,
    waitingPixel,
    startStroke,
    continueStroke,
    endStroke,
    handleClickAction,
  };
};
