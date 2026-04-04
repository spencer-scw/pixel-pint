import React, { useCallback } from 'react';

const Palette = ({ colors, selectedColor, tempColor, shouldScroll, onSelectColor }) => {
  const row1 = colors.filter((_, i) => i % 2 === 0);
  const row2 = colors.filter((_, i) => i % 2 !== 0);

  const scrollRef = useCallback((node) => {
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedColor, tempColor]);

  const swatchProps = (color, key) => ({
    key,
    className: `color-swatch ${selectedColor === color ? 'active' : ''}`,
    style: { backgroundColor: color },
    onClick: () => onSelectColor(color),
    title: color,
    ...(shouldScroll && selectedColor === color ? { ref: scrollRef } : {})
  });

  return (
    <div className="palette-container">
      <div className="palette-row">
        {row1.map((color, i) => (
          <button {...swatchProps(color, `row1-${i}`)} />
        ))}
      </div>
      <div className="palette-row">
        {row2.map((color, i) => (
          <button {...swatchProps(color, `row2-${i}`)} />
        ))}
        {tempColor && (
          <button
            ref={shouldScroll ? scrollRef : undefined}
            className="color-swatch temp active"
            style={{ backgroundColor: tempColor }}
            onClick={() => onSelectColor(tempColor)}
            title={`${tempColor} (picked)`}
          />
        )}
      </div>
    </div>
  );
};

export default Palette;