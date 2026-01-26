import React from 'react';

const PalettePreview = ({ colors, maxColors = 32 }) => {
  if (!colors || colors.length === 0) return null;
  
  const displayColors = colors.slice(0, maxColors);
  
  return (
    <div className="palette-preview-strip">
      {displayColors.map((color, i) => (
        <div 
          key={i} 
          className="preview-color" 
          style={{ backgroundColor: color }}
        />
      ))}
      {colors.length > maxColors && <div className="preview-more">...</div>}
    </div>
  );
};

export default PalettePreview;
