import React from 'react';
import { sortColorsByHue, sortColorsByLuminance } from '../utils/colorSort';

const PalettePreview = ({ colors, maxColors = 32, sortedPreview = 'none', twoRows = false }) => {
  if (!colors || colors.length === 0) return null;

  let displayColors = colors.slice(0, maxColors);

  // Apply sorting if requested
  if (sortedPreview === 'hue') {
    displayColors = sortColorsByHue(displayColors);
  } else if (sortedPreview === 'luminance') {
    displayColors = sortColorsByLuminance(displayColors);
  }

  // For 2-row layout, split into rows and interleave (same as the app)
  if (twoRows) {
    const row1 = displayColors.filter((_, i) => i % 2 === 0);
    const row2 = displayColors.filter((_, i) => i % 2 !== 0);

    // Add placeholder if rows are uneven (odd number of colors)
    const hasPlaceholder = row1.length > row2.length;

    const rowStyle = {
      display: 'flex',
      flexDirection: 'row',
      height: '12px',
      overflow: 'hidden',
      width: '100%',
    };

    const topRowStyle = {
      ...rowStyle,
      borderRadius: '2px 2px 0 0',
      border: '1px solid rgba(0,0,0,0.1)',
      borderBottom: 'none',
    };

    const bottomRowStyle = {
      ...rowStyle,
      borderRadius: '0 0 2px 2px',
      border: '1px solid rgba(0,0,0,0.1)',
      borderTop: 'none',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0', width: '100%' }}>
        <div style={topRowStyle}>
          {row1.map((color, i) => (
            <div
              key={`row1-${i}`}
              className="preview-color"
              style={{ backgroundColor: color }}
            />
          ))}
          {colors.length > maxColors && row2.length === 0 && <div className="preview-more">...</div>}
        </div>
        <div style={bottomRowStyle}>
          {row2.map((color, i) => (
            <div
              key={`row2-${i}`}
              className="preview-color"
              style={{ backgroundColor: color }}
            />
          ))}
          {hasPlaceholder && (
            <div
              className="preview-color"
              style={{ backgroundColor: 'transparent' }}
            />
          )}
          {colors.length > maxColors && row2.length === 0 && <div className="preview-more">...</div>}
        </div>
      </div>
    );
  }

  // Original strip layout
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
