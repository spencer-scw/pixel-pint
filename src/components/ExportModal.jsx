import React from 'react';

const ExportModal = ({ isOpen, onClose, onExport, width, height }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Download PNG</h3>
        <div className="export-options">
          <button onClick={() => onExport(1)}>
            True Size ({width}x{height})
          </button>
          <button onClick={() => onExport(10)}>
            10x Upscaled ({width * 10}x{height * 10})
          </button>
        </div>
        <button className="close-modal" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default ExportModal;
