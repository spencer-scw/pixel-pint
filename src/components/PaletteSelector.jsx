import React, { useState, useEffect } from 'react';
import { Globe, FilePlus, Loader2, ExternalLink, Check } from 'lucide-react';
import { fetchLospecPalette, getPopularPaletteNames, parseHexFile } from '../utils/palettes';
import { getCustomPalettes, saveCustomPalette } from '../utils/storage';
import PalettePreview from './PalettePreview';

const PaletteSelector = ({ onPaletteSelect, currentPaletteColors }) => {
  const [selectedName, setSelectedPaletteName] = useState('pico-8');
  const [popularNames, setPopularNames] = useState([]);
  const [customPalettes, setCustomPalettes] = useState({});
  const [previewColors, setPreviewColors] = useState(currentPaletteColors || []);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showLospecImport, setShowLospecInput] = useState(false);
  const [lospecInputName, setLospecInputName] = useState('');

  useEffect(() => {
    getPopularPaletteNames().then(setPopularNames);
    setCustomPalettes(getCustomPalettes());
  }, []);

  // Update preview when selection changes
  useEffect(() => {
    const updatePreview = async () => {
      if (customPalettes[selectedName]) {
        const colors = customPalettes[selectedName];
        setPreviewColors(colors);
        onPaletteSelect(colors);
      } else {
        setIsLoading(true);
        const colors = await fetchLospecPalette(selectedName);
        if (colors) {
          setPreviewColors(colors);
          onPaletteSelect(colors);
        }
        setIsLoading(false);
      }
    };
    updatePreview();
  }, [selectedName, customPalettes]);

  const submitLospecImport = async (e) => {
    if (e) e.preventDefault();
    const name = lospecInputName.trim().replace(/\s+/g, '-').toLowerCase();
    if (name) {
      setIsLoading(true);
      const colors = await fetchLospecPalette(name);
      if (colors) {
        saveCustomPalette(name, colors);
        setCustomPalettes(getCustomPalettes());
        setSelectedPaletteName(name);
        setLospecInputName('');
        setShowLospecInput(false);
      } else {
        alert("Palette not found on Lospec: " + name);
      }
      setIsLoading(false);
    }
  };

  const handleLospecKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      submitLospecImport();
    }
  };

  const handleImportHex = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.hex';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const colors = parseHexFile(event.target.result);
          if (colors.length > 0) {
            const name = file.name.replace('.hex', '');
            saveCustomPalette(name, colors);
            setCustomPalettes(getCustomPalettes());
            setSelectedPaletteName(name);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="palette-selector">
      <div className="input-group">
        <label>Select Palette</label>
        <div className="palette-select-container">
          <select 
            value={selectedName} 
            onChange={(e) => setSelectedPaletteName(e.target.value)}
            className="palette-select"
          >
            <optgroup label="Popular">
              {popularNames.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </optgroup>
            {Object.keys(customPalettes).length > 0 && (
              <optgroup label="Custom">
                {Object.keys(customPalettes).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </optgroup>
            )}
          </select>
          <div className="palette-import-buttons">
            <button 
              type="button" 
              className={showLospecImport ? 'active' : ''}
              onClick={() => setShowLospecInput(!showLospecImport)} 
              title="Import from Lospec"
            >
              <Globe size={16} />
            </button>
            <button type="button" onClick={handleImportHex} title="Import .hex file"><FilePlus size={16} /></button>
          </div>
        </div>
      </div>

      {showLospecImport && (
        <div className="lospec-import-row">
          <input 
            type="text" 
            placeholder="Lospec palette slug" 
            value={lospecInputName}
            onChange={(e) => setLospecInputName(e.target.value)}
            onKeyDown={handleLospecKeyDown}
            autoFocus
          />
          <button 
            type="button" 
            className="import-submit-btn" 
            onClick={() => submitLospecImport()}
            disabled={!lospecInputName.trim() || isLoading}
          >
            <Check size={16} />
          </button>
          <a 
            href="https://lospec.com/palette-list" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="lospec-link-btn"
            title="Browse Lospec Palettes"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      )}

      <div className="palette-preview-container">
        {isLoading ? (
          <div className="preview-loading"><Loader2 size={16} className="spin" /> Fetching colors...</div>
        ) : (
          <PalettePreview colors={previewColors} />
        )}
      </div>
    </div>
  );
};

export default PaletteSelector;