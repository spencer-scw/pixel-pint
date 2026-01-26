import React, { useRef, useEffect } from 'react';

const Palette = ({ colors, selectedColor, onSelectColor }) => {
  const row1 = colors.filter((_, i) => i % 2 === 0);
  const row2 = colors.filter((_, i) => i % 2 !== 0);

  return (
    <div className="palette-container">
      <div className="palette-row">
        {row1.map((color, i) => (
          <button
            key={`row1-${i}`}
            className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onSelectColor(color)}
            title={color}
          />
        ))}
      </div>
      <div className="palette-row">
        {row2.map((color, i) => (
          <button
            key={`row2-${i}`}
            className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onSelectColor(color)}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};

export default Palette;