import React, { useState } from 'react';
import PaletteSelector from './PaletteSelector';

const PaletteModal = ({ isOpen, onClose, onSave, currentPalette }) => {
  const [selectedColors, setSelectedColors] = useState(currentPalette);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSave(selectedColors);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Change Palette</h3>
        <p className="modal-description">This will update the project's color palette.</p>
        
        <PaletteSelector 
          onPaletteSelect={setSelectedColors} 
          currentPaletteColors={currentPalette}
        />

        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="primary-btn" onClick={handleConfirm}>Apply Palette</button>
        </div>
      </div>
    </div>
  );
};

export default PaletteModal;
