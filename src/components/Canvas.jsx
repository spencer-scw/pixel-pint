import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import './Canvas.css';

const Canvas = forwardRef(({ width = 16, height = 16, activeTool = 'draw', activeLayer = 'foreground', selectedColor = '#000000', initialData = null }, ref) => {
  const checkerboardRef = useRef(null);
  const backgroundRef = useRef(null);
  const foregroundRef = useRef(null);
  const isDrawing = useRef(false);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    save: () => {
      return {
        background: backgroundRef.current ? backgroundRef.current.toDataURL() : null,
        foreground: foregroundRef.current ? foregroundRef.current.toDataURL() : null
      };
    },
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
      
      // Disable smoothing for pixel art
      tempCtx.imageSmoothingEnabled = false;
      
      if (backgroundRef.current) tempCtx.drawImage(backgroundRef.current, 0, 0, width * scale, height * scale);
      if (foregroundRef.current) tempCtx.drawImage(foregroundRef.current, 0, 0, width * scale, height * scale);
      
      return tempCanvas.toDataURL('image/png');
    }
  }));

  // Helper to load image into canvas
  const loadImage = (ctx, dataUrl) => {
    if (!dataUrl) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  };

  // Initial Load of Data
  useEffect(() => {
    if (initialData) {
      if (initialData.background && backgroundRef.current) {
        loadImage(backgroundRef.current.getContext('2d'), initialData.background);
      }
      if (initialData.foreground && foregroundRef.current) {
        loadImage(foregroundRef.current.getContext('2d'), initialData.foreground);
      }
    } else {
       // Clear if no data (new project)
       [backgroundRef.current, foregroundRef.current].forEach(canvas => {
         if(canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, width, height);
         }
       })
    }
  }, [initialData, width, height]); // Only re-run if these change (loading a new project)


  // Draw Checkerboard
  useEffect(() => {
    const canvas = checkerboardRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      
      const lightColor = '#ffffff';
      const darkColor = '#efefef'; 

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          ctx.fillStyle = (x + y) % 2 === 0 ? lightColor : darkColor;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }, [width, height]);

  const drawPixel = (clientX, clientY) => {
    const canvas = activeLayer === 'background' ? backgroundRef.current : foregroundRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left) * (width / rect.width));
    const y = Math.floor((clientY - rect.top) * (height / rect.height));

    if (x >= 0 && x < width && y >= 0 && y < height) {
      const ctx = canvas.getContext('2d');
      if (activeTool === 'erase') {
        ctx.clearRect(x, y, 1, 1);
      } else {
        ctx.fillStyle = selectedColor;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  };

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    drawPixel(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    drawPixel(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleTouchStart = (e) => {
    isDrawing.current = true;
    const touch = e.touches[0];
    drawPixel(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDrawing.current) return;
    const touch = e.touches[0];
    drawPixel(touch.clientX, touch.clientY);
  };

  return (
    <div className="canvas-container">
      <canvas 
        ref={checkerboardRef} 
        width={width} 
        height={height} 
        className="canvas-layer checkerboard" 
      />
      <canvas 
        ref={backgroundRef} 
        width={width} 
        height={height} 
        className="canvas-layer background" 
      />
      <canvas 
        ref={foregroundRef} 
        width={width} 
        height={height} 
        className="canvas-layer foreground" 
      />
      <div 
        className="interaction-layer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      />
    </div>
  );
});

export default Canvas;