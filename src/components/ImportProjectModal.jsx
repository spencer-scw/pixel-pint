import React, { useState, useRef, useMemo } from 'react';
import { Upload, FileImage, RefreshCw } from 'lucide-react';
import { createProject, saveProjectData, updateProjectMeta } from '../utils/storage';
import { rgbaToHex } from './canvas/canvasUtils';
import { sortColorsByHue, sortColorsByLuminance } from '../utils/colorSort';
import { usePaletteSelection } from '../hooks/usePaletteSelection';
import PaletteSelector from './PaletteSelector';
import SortMethodSelect from './SortMethodSelect';
import PalettePreview from './PalettePreview';

const MAX_DIMENSION = 128;

const loadImageFromFile = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    resolve(img);
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('decode failed'));
  };
  img.src = url;
});

const extractPalette = (ctx, width, height) => {
  const data = ctx.getImageData(0, 0, width, height).data;
  const seen = new Set();
  const colors = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const hex = rgbaToHex(data[i], data[i + 1], data[i + 2]);
    if (!seen.has(hex)) {
      seen.add(hex);
      colors.push(hex);
    }
  }
  return colors;
};

const dedupeColors = (colors) => {
  const seen = new Set();
  const out = [];
  for (const c of colors) {
    const key = c.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(c);
    }
  }
  return out;
};

const applySort = (colors, method) => {
  if (method === 'hue') return sortColorsByHue(colors);
  if (method === 'luminance') return sortColorsByLuminance(colors);
  return colors;
};

const stripExtension = (filename) => filename.replace(/\.[^/.]+$/, '');

const ImportProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [name, setName] = useState('');
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [unionEnabled, setUnionEnabled] = useState(false);
  const fileInputRef = useRef(null);
  const palette = usePaletteSelection();

  const imageColors = preview?.imageColors;
  const unionSelected = palette.selectedColors;
  const finalPalette = useMemo(() => {
    const base = imageColors || [];
    const extra = unionEnabled ? unionSelected : [];
    return applySort(dedupeColors([...base, ...extra]), palette.sortMethod);
  }, [imageColors, unionEnabled, unionSelected, palette.sortMethod]);

  if (!isOpen) return null;

  const reset = () => {
    setName('');
    setPreview(null);
    setFileName('');
    setError('');
    setUnionEnabled(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    if (file.type !== 'image/png') {
      setPreview(null);
      setFileName('');
      setError('File must be a PNG.');
      return;
    }
    try {
      const img = await loadImageFromFile(file);
      if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
        setPreview(null);
        setFileName('');
        setError(`Image is ${img.width}×${img.height}. Max is ${MAX_DIMENSION}×${MAX_DIMENSION}.`);
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      const imageColors = extractPalette(ctx, img.width, img.height);
      setPreview({ dataUrl, width: img.width, height: img.height, imageColors });
      setFileName(file.name);
      if (!name.trim()) setName(stripExtension(file.name));
    } catch {
      setPreview(null);
      setFileName('');
      setError('Could not read the image.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!preview) return;
    const finalName = name.trim() || 'untitled';
    const savedPalette = finalPalette.length > 0 ? finalPalette : ['#000000', '#FFFFFF'];
    const paletteName = unionEnabled ? palette.selectedPaletteName : null;
    const newProject = createProject(finalName, preview.width, preview.height, savedPalette, paletteName);
    saveProjectData(newProject.id, { background: null, foreground: preview.dataUrl });
    updateProjectMeta(newProject.id, { thumbnail: preview.dataUrl });
    reset();
    onProjectCreated(newProject.id);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Import Image</h3>
        <form onSubmit={handleSubmit} className="new-project-form">
          <input
            type="file"
            accept="image/png,.png"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="visually-hidden"
          />

          {!preview ? (
            <button type="button" className="file-dropzone" onClick={openFilePicker}>
              <Upload size={32} />
              <span className="file-dropzone-title">Click to select a PNG</span>
              <span className="file-dropzone-hint">max {MAX_DIMENSION}×{MAX_DIMENSION}</span>
            </button>
          ) : (
            <button type="button" className="file-selected" onClick={openFilePicker} title="Choose a different file">
              <FileImage size={18} className="file-selected-icon" />
              <span className="file-selected-name">{fileName}</span>
              <RefreshCw size={14} className="file-selected-change" />
            </button>
          )}

          {error && <p className="import-error">{error}</p>}

          {preview && (
            <>
              <div className="import-preview">
                <div className="import-preview-stage">
                  <img src={preview.dataUrl} alt="preview" className="import-preview-img" />
                </div>
                <p className="import-preview-info">
                  {preview.width}×{preview.height} · {preview.imageColors.length} {preview.imageColors.length === 1 ? 'color' : 'colors'} from image
                </p>
              </div>

              <div className="input-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Drawing Name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={unionEnabled}
                    onChange={(e) => setUnionEnabled(e.target.checked)}
                  />
                  <span>Add colors from another palette</span>
                </label>
              </div>

              {unionEnabled && (
                <PaletteSelector
                  onPaletteSelect={palette.setSelectedColors}
                  onPaletteNameSelect={palette.setSelectedPaletteName}
                  sortPreview={palette.sortMethod}
                />
              )}

              <SortMethodSelect
                sortMethod={palette.sortMethod}
                onSortMethodChange={palette.setSortMethod}
              />

              <div className="input-group">
                <label>Final Palette ({finalPalette.length} {finalPalette.length === 1 ? 'color' : 'colors'})</label>
                <PalettePreview colors={finalPalette} twoRows={true} />
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={handleClose}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={!preview}>Import</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportProjectModal;
