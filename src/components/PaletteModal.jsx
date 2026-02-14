import React, { useState } from 'react';
import PaletteSelector from './PaletteSelector';
import { sortColorsByHue, sortColorsByLuminance } from '../utils/colorSort';

const PaletteModal = ({ isOpen, onClose, onSave, currentPalette, currentPaletteName }) => {
  const [selectedColors, setSelectedColors] = useState(currentPalette);
  const [selectedPaletteName, setSelectedPaletteName] = useState(currentPaletteName || null);
  const [sortMethod, setSortMethod] = useState('none');

  if (!isOpen) return null;

  const handleConfirm = () => {
    let finalColors = selectedColors;
    if (sortMethod === 'hue') {
      finalColors = sortColorsByHue(selectedColors);
    } else if (sortMethod === 'luminance') {
      finalColors = sortColorsByLuminance(selectedColors);
    }
    onSave(finalColors, selectedPaletteName);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Change Palette</h3>
        <p className="modal-description">This will update the project's color palette.</p>

        <PaletteSelector
          onPaletteSelect={setSelectedColors}
          onPaletteNameSelect={setSelectedPaletteName}
          currentPaletteColors={currentPalette}
          currentPaletteName={currentPaletteName}
          sortPreview={sortMethod}
        />

        <div className="input-group" style={{ marginTop: '1rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>Sort colors by...</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="sortMethod"
                value="none"
                checked={sortMethod === 'none'}
                onChange={(e) => setSortMethod(e.target.value)}
                style={{ cursor: 'pointer', width: '14px', height: '14px' }}
              />
              <span style={{ fontSize: '0.9rem' }}>None</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="sortMethod"
                value="hue"
                checked={sortMethod === 'hue'}
                onChange={(e) => setSortMethod(e.target.value)}
                style={{ cursor: 'pointer', width: '14px', height: '14px' }}
              />
              <span style={{ fontSize: '0.9rem' }}>Hue</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="sortMethod"
                value="luminance"
                checked={sortMethod === 'luminance'}
                onChange={(e) => setSortMethod(e.target.value)}
                style={{ cursor: 'pointer', width: '14px', height: '14px' }}
              />
              <span style={{ fontSize: '0.9rem' }}>Brightness</span>
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="primary-btn" onClick={handleConfirm}>Apply Palette</button>
        </div>
      </div>
    </div>
  );
};

export default PaletteModal;
