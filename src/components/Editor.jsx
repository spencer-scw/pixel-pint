import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, ChevronLeft, MoreVertical, Trash2 } from 'lucide-react';
import Canvas from './canvas/Canvas';
import Palette from './Palette';
import Toolbar from './Toolbar';
import ExportModal from './ExportModal';
import { loadProjectData, saveProjectData, updateProjectMeta, getProjects } from '../utils/storage';

const Editor = ({ projectId, onBack }) => {
  const [project, setProject] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [tool, setTool] = useState('draw');
  const [activeLayer, setActiveLayer] = useState('foreground');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving'
  const [historyStatus, setHistoryStatus] = useState({ canUndo: false, canRedo: false });
  
  const canvasRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    const projects = getProjects();
    const foundProject = projects.find(p => p.id === projectId);
    if (foundProject) {
      setProject(foundProject);
      setEditingName(foundProject.name);
      setProjectData(loadProjectData(projectId));
    }
  }, [projectId]);

  const colors = [
    '#000000', '#808080', '#FFFFFF', '#FF0000', '#FFA500',
    '#FFFF00', '#008000', '#0000FF', '#4B0082', '#EE82EE'
  ];

  const handleSave = useCallback(() => {
    if (canvasRef.current && project) {
      const data = canvasRef.current.save();
      const thumbnail = canvasRef.current.getThumbnail();
      saveProjectData(projectId, data);
      updateProjectMeta(projectId, { thumbnail, name: project.name });
      setSaveStatus('saved');
    }
  }, [project, projectId]);

  const triggerAutoSave = () => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(handleSave, 1000);
  };

  const handleFinishRename = () => {
    const finalName = editingName.trim() || 'untitled';
    updateProjectMeta(projectId, { name: finalName });
    setProject(prev => ({ ...prev, name: finalName }));
    setEditingName(finalName);
    setIsEditingName(false);
    triggerAutoSave();
  };

  const handleExport = (scale) => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.exportImage(scale);
      const link = document.createElement('a');
      link.download = `${project.name}_${scale === 1 ? 'true' : '10x'}.png`;
      link.href = dataUrl;
      link.click();
      setShowExportModal(false);
    }
  };

  const handleSaveAndBack = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      handleSave();
    }
    onBack();
  };

  const handleResetCanvas = () => {
    if (window.confirm("Are you sure you want to clear both layers? This cannot be undone.")) {
       if (canvasRef.current) {
         canvasRef.current.clear();
         triggerAutoSave();
       }
       setShowMoreMenu(false);
    }
  };

  if (!project) return null;

  return (
    <>
      <header className="editor-header">
        <button className="back-btn" onClick={handleSaveAndBack}>
          <ChevronLeft size={24} />
        </button>
        <div className="title-section">
          <h1>
            pixel-pint/ {isEditingName ? (
              <input
                className="project-name-input"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={handleFinishRename}
                onKeyDown={(e) => e.key === 'Enter' && handleFinishRename()}
                autoFocus
              />
            ) : (
              <span className="project-name" onClick={() => setIsEditingName(true)}>
                {project.name}
              </span>
            )}
          </h1>
          <span className={`save-status ${saveStatus}`}>{saveStatus === 'saving' ? 'saving...' : 'saved'}</span>
        </div>
        <div className="header-actions">
          <button className="export-btn" onClick={() => setShowExportModal(true)} title="Export">
            <Download size={20} />
          </button>
          <div className="more-menu-container">
            <button className="more-btn" onClick={() => setShowMoreMenu(!showMoreMenu)} title="More">
              <MoreVertical size={20} />
            </button>
            {showMoreMenu && (
              <div className="more-menu">
                <button className="menu-item danger" onClick={handleResetCanvas}>
                  <Trash2 size={16} /> Reset Canvas
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        <Palette 
          colors={colors} 
          selectedColor={selectedColor} 
          onSelectColor={(color) => {
            setSelectedColor(color);
            setTool('draw');
          }} 
        />

        <Canvas
          ref={canvasRef}
          width={project.width}
          height={project.height}
          activeTool={tool}
          activeLayer={activeLayer}
          selectedColor={selectedColor}
          initialData={projectData}
          onCanvasChange={triggerAutoSave}
          onHistoryChange={setHistoryStatus}
        />

        <Toolbar 
          tool={tool} 
          setTool={setTool} 
          activeLayer={activeLayer} 
          setActiveLayer={setActiveLayer}
          onUndo={() => canvasRef.current?.undo()}
          onRedo={() => canvasRef.current?.redo()}
          canUndo={historyStatus.canUndo}
          canRedo={historyStatus.canRedo}
        />
      </main>

      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
        onExport={handleExport}
        width={project.width}
        height={project.height}
      />
    </>
  );
};

export default Editor;
