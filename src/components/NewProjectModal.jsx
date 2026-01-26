import React, { useState } from 'react';
import { createProject } from '../utils/storage';
import PaletteSelector from './PaletteSelector';

const NewProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [name, setName] = useState('');
  const [width, setWidth] = useState(16);
  const [height, setHeight] = useState(16);
  const [selectedColors, setSelectedColors] = useState([]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalName = name.trim() || 'untitled';
    const newProject = createProject(finalName, width, height, selectedColors);
    onProjectCreated(newProject.id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>New Project</h3>
        <form onSubmit={handleSubmit} className="new-project-form">
          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Drawing Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="size-inputs">
            <div className="input-group">
              <label>Width</label>
              <input
                type="number"
                min="1" max="128"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Height</label>
              <input
                type="number"
                min="1" max="128"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
          </div>

          <PaletteSelector onPaletteSelect={setSelectedColors} />

          <div className="size-presets">
             <button type="button" onClick={() => { setWidth(8); setHeight(8); }}>8x8</button>
             <button type="button" onClick={() => { setWidth(16); setHeight(16); }}>16x16</button>
             <button type="button" onClick={() => { setWidth(32); setHeight(32); }}>32x32</button>
             <button type="button" onClick={() => { setWidth(64); setHeight(64); }}>64x64</button>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">Create Project</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;