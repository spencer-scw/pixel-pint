import React from 'react';

const Palette = ({ colors, selectedColor, onSelectColor }) => {
  return (
    <div className="palette-bar">
      {colors.map((color) => (
        <button
          key={color}
          className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => onSelectColor(color)}
        />
      ))}
    </div>
  );
};

export default Palette;
