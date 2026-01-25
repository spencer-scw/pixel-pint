import React, { useState, useRef, useEffect } from 'react';
import Canvas from './Canvas';
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
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  
  const canvasRef = useRef(null);

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

  const handleFinishRename = () => {
    const finalName = editingName.trim() || 'untitled';
    updateProjectMeta(projectId, { name: finalName });
    setProject(prev => ({ ...prev, name: finalName }));
    setEditingName(finalName);
    setIsEditingName(false);
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
    if (canvasRef.current && project) {
      const data = canvasRef.current.save();
      const thumbnail = canvasRef.current.getThumbnail();
      saveProjectData(projectId, data);
      updateProjectMeta(projectId, { thumbnail, name: project.name });
    }
    onBack();
  };

  if (!project) return null;

  return (
    <>
      <header className="editor-header">
        <button className="back-btn" onClick={handleSaveAndBack}>&larr;</button>
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
        <button className="export-btn" onClick={() => setShowExportModal(true)} title="Export">
          ⬇️
        </button>
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
        />

        <Toolbar 
          tool={tool} 
          setTool={setTool} 
          activeLayer={activeLayer} 
          setActiveLayer={setActiveLayer} 
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