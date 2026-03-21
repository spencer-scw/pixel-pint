import React from 'react';
import PaletteSelector from './PaletteSelector';
import SortMethodSelect from './SortMethodSelect';
import { usePaletteSelection } from '../hooks/usePaletteSelection';

const PaletteModal = ({ isOpen, onClose, onSave, currentPalette, currentPaletteName }) => {
  const palette = usePaletteSelection(currentPalette, currentPaletteName);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSave(palette.getFinalColors(), palette.selectedPaletteName);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Change Palette</h3>
        <p className="modal-description">This will update the project's color palette.</p>

        <PaletteSelector
          onPaletteSelect={palette.setSelectedColors}
          onPaletteNameSelect={palette.setSelectedPaletteName}
          currentPaletteColors={currentPalette}
          currentPaletteName={currentPaletteName}
          sortPreview={palette.sortMethod}
        />

        <div style={{ marginTop: '1rem' }}>
          <SortMethodSelect
            sortMethod={palette.sortMethod}
            onSortMethodChange={palette.setSortMethod}
          />
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
