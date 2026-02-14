import React, { useState } from 'react';
import { createProject } from '../utils/storage';
import PaletteSelector from './PaletteSelector';
import { sortColorsByHue, sortColorsByLuminance } from '../utils/colorSort';

const NewProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [name, setName] = useState('');
  const [width, setWidth] = useState(16);
  const [height, setHeight] = useState(16);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedPaletteName, setSelectedPaletteName] = useState(null);
  const [sortMethod, setSortMethod] = useState('none');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalName = name.trim() || 'untitled';
    let finalColors = selectedColors;
    if (sortMethod === 'hue') {
      finalColors = sortColorsByHue(selectedColors);
    } else if (sortMethod === 'luminance') {
      finalColors = sortColorsByLuminance(selectedColors);
    }
    const newProject = createProject(finalName, width, height, finalColors, selectedPaletteName);
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

          <PaletteSelector onPaletteSelect={setSelectedColors} onPaletteNameSelect={setSelectedPaletteName} sortPreview={sortMethod} />

          <div className="input-group">
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