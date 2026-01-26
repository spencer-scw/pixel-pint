import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import './Canvas.css';
import { drawCheckerboard } from './canvasUtils';
import { useCanvasDrawing } from './useCanvasDrawing';
import { useCanvasGestures } from './useCanvasGestures';

const Canvas = forwardRef(({
  width = 16,
  height = 16,
  activeTool = 'draw',
  activeLayer = 'foreground',
  selectedColor = '#000000',
  initialData = null,
  onCanvasChange,
  onHistoryChange
}, ref) => {
  const checkerboardRef = useRef(null);
  const backgroundRef = useRef(null);
  const foregroundRef = useRef(null);

  // History State
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const MAX_HISTORY = 50;

  const { isDrawing, handleAction } = useCanvasDrawing(
    width, height, activeTool, activeLayer, selectedColor, onCanvasChange
  );

  const {
    transform,
    touchState,
    handleGestureStart,
    handleGestureMove,
    resetTransform
  } = useCanvasGestures(checkerboardRef);

  const saveStateToUndo = () => {
    const state = {
      background: backgroundRef.current?.toDataURL() || null,
      foreground: foregroundRef.current?.toDataURL() || null
    };
    undoStack.current.push(state);
    if (undoStack.current.length > MAX_HISTORY) {
      undoStack.current.shift();
    }
    redoStack.current = [];
    updateHistoryStatus();
  };

  const updateHistoryStatus = () => {
    if (onHistoryChange) {
      onHistoryChange({
        canUndo: undoStack.current.length > 0,
        canRedo: redoStack.current.length > 0
      });
    }
  };

  const applyState = (state) => {
    const loadImage = (ctx, dataUrl) => {
      if (!dataUrl) {
        ctx.clearRect(0, 0, width, height);
        return;
      }
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = dataUrl;
    };

    if (backgroundRef.current) loadImage(backgroundRef.current.getContext('2d'), state.background);
    if (foregroundRef.current) loadImage(foregroundRef.current.getContext('2d'), state.foreground);
    if (onCanvasChange) onCanvasChange();
  };

  useImperativeHandle(ref, () => ({
    save: () => ({
      background: backgroundRef.current?.toDataURL() || null,
      foreground: foregroundRef.current?.toDataURL() || null
    }),
    getThumbnail: () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');
      if (backgroundRef.current) tempCtx.drawImage(backgroundRef.current, 0, 0);
      if (foregroundRef.current) tempCtx.drawImage(foregroundRef.current, 0, 0);
      return tempCanvas.toDataURL();
    },
    exportImage: (scale = 1) => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width * scale;
      tempCanvas.height = height * scale;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.imageSmoothingEnabled = false;
      if (backgroundRef.current) tempCtx.drawImage(backgroundRef.current, 0, 0, width * scale, height * scale);
      if (foregroundRef.current) tempCtx.drawImage(foregroundRef.current, 0, 0, width * scale, height * scale);
      return tempCanvas.toDataURL('image/png');
    },
    clear: () => {
      saveStateToUndo();
      [backgroundRef.current, foregroundRef.current].forEach(canvas => {
        if (canvas) canvas.getContext('2d').clearRect(0, 0, width, height);
      });
    },
    undo: () => {
      if (undoStack.current.length === 0) return;
      
      const currentState = {
        background: backgroundRef.current?.toDataURL() || null,
        foreground: foregroundRef.current?.toDataURL() || null
      };
      redoStack.current.push(currentState);
      
      const previousState = undoStack.current.pop();
      applyState(previousState);
      updateHistoryStatus();
    },
    redo: () => {
      if (redoStack.current.length === 0) return;
      
      const currentState = {
        background: backgroundRef.current?.toDataURL() || null,
        foreground: foregroundRef.current?.toDataURL() || null
      };
      undoStack.current.push(currentState);
      
      const nextState = redoStack.current.pop();
      applyState(nextState);
      updateHistoryStatus();
    }
  }));

  useEffect(() => {
    const loadImage = (ctx, dataUrl) => {
      if (!dataUrl) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = dataUrl;
    };

    if (initialData) {
      if (initialData.background && backgroundRef.current) loadImage(backgroundRef.current.getContext('2d'), initialData.background);
      if (initialData.foreground && foregroundRef.current) loadImage(foregroundRef.current.getContext('2d'), initialData.foreground);
    } else {
      [backgroundRef.current, foregroundRef.current].forEach(canvas => {
        if (canvas) canvas.getContext('2d').clearRect(0, 0, width, height);
      });
    }
    // Reset history when loading a new project
    undoStack.current = [];
    redoStack.current = [];
    updateHistoryStatus();
  }, [initialData, width, height]);

  useEffect(() => {
    drawCheckerboard(checkerboardRef.current, width, height);
  }, [width, height]);

  const onMouseDown = (e) => {
    if (activeTool !== 'fill') isDrawing.current = true;
    saveStateToUndo();
    handleAction(e.clientX, e.clientY, backgroundRef, foregroundRef);
  };

  const onMouseMove = (e) => {
    if (isDrawing.current) handleAction(e.clientX, e.clientY, backgroundRef, foregroundRef, true);
  };

  const onMouseUp = () => isDrawing.current = false;

  const onTouchStart = (e) => {
    if (!handleGestureStart(e)) {
      if (activeTool !== 'fill') isDrawing.current = true;
      saveStateToUndo();
      handleAction(e.touches[0].clientX, e.touches[0].clientY, backgroundRef, foregroundRef);
    }
  };

  const onTouchMove = (e) => {
    if (!handleGestureMove(e) && isDrawing.current) {
      handleAction(e.touches[0].clientX, e.touches[0].clientY, backgroundRef, foregroundRef, true);
    }
  };

  const onTouchEnd = (e) => {
    if (e.touches.length < 2) touchState.current.isZooming = false;
    isDrawing.current = false;
  };

  return (
    <div 
      className="canvas-wrapper" 
      style={{ 
        aspectRatio: `${width} / ${height}`,
        '--canvas-width': width,
        '--canvas-height': height
      }}
    >
      <div className="canvas-container"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, cursor: isDrawing.current ? 'crosshair' : (touchState.current.isZooming ? 'move' : 'crosshair') }}
      >
        <canvas ref={checkerboardRef} width={width} height={height} className="canvas-layer checkerboard" />
        <canvas ref={backgroundRef} width={width} height={height} className="canvas-layer background" />
        <canvas ref={foregroundRef} width={width} height={height} className={`canvas-layer foreground ${activeLayer === 'background' ? 'outlined' : ''}`} />
        <div 
          className="interaction-layer"
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        />
      </div>
      {transform.scale > 1 && (
        <div className="zoom-indicator" onClick={resetTransform}>
          {Math.round(transform.scale * 100)}% (tap to reset)
        </div>
      )}
    </div>
  );
});

export default Canvas;