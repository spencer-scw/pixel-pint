import { useState, useEffect, useRef } from 'react'
import './App.css'
import Canvas from './components/Canvas'
import ProjectList from './components/ProjectList'
import { getProjects, createProject, loadProjectData, saveProjectData, updateProjectMeta } from './utils/storage'

function App() {
  const [view, setView] = useState('home'); // 'home' | 'editor'
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentProjectData, setCurrentProjectData] = useState(null);
  
  // Editor State
  const [tool, setTool] = useState('draw'); 
  const [activeLayer, setActiveLayer] = useState('foreground'); 
  const [selectedColor, setSelectedColor] = useState('#000000');
  
  // Refs
  const canvasRef = useRef(null);

  const colors = [
    '#000000', '#808080', '#FFFFFF', '#FF0000', '#FFA500', 
    '#FFFF00', '#008000', '#0000FF', '#4B0082', '#EE82EE'
  ];

  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');

  // Load projects on mount
  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleCreateProject = (name, size) => {
    const finalName = name.trim() || 'untitled';
    const newProject = createProject(finalName, size);
    setProjects(getProjects());
    handleSelectProject(newProject);
  };

  const handleSelectProject = (project) => {
    const data = loadProjectData(project.id);
    setCurrentProject(project);
    setEditingName(project.name);
    setCurrentProjectData(data);
    setView('editor');
    // Reset tool state
    setTool('draw');
    setActiveLayer('foreground');
    setSelectedColor('#000000');
  };

  const handleSave = () => {
    if (canvasRef.current && currentProject) {
      const data = canvasRef.current.save();
      const thumbnail = canvasRef.current.getThumbnail();
      saveProjectData(currentProject.id, data);
      updateProjectMeta(currentProject.id, { thumbnail, name: currentProject.name }); 
      setProjects(getProjects());
    }
  };

  const handleBack = () => {
    handleSave(); // Auto-save on exit
    setView('home');
    setCurrentProject(null);
    setCurrentProjectData(null);
  };

  const finishRename = () => {
    const newName = editingName.trim() || 'untitled';
    updateProjectMeta(currentProject.id, { name: newName });
    setCurrentProject(prev => ({ ...prev, name: newName }));
    setEditingName(newName);
    setIsEditingName(false);
    setProjects(getProjects());
  };

  return (
    <div className="app-container">
      {view === 'home' && (
        <>
          <header>
             <h1>pixel pint</h1>
          </header>
          <ProjectList 
             projects={projects} 
             onCreateProject={handleCreateProject} 
             onSelectProject={handleSelectProject}
          />
        </>
      )}

      {view === 'editor' && currentProject && (
        <>
          <header className="editor-header">
             <button className="back-btn" onClick={handleBack}>&larr;</button>
             <h1>
               pixel pint / {isEditingName ? (
                 <input 
                   className="project-name-input"
                   value={editingName}
                   onChange={(e) => setEditingName(e.target.value)}
                   onBlur={finishRename}
                   onKeyDown={(e) => e.key === 'Enter' && finishRename()}
                   autoFocus
                 />
               ) : (
                 <span className="project-name" onClick={() => setIsEditingName(true)}>
                   {currentProject.name}
                 </span>
               )}
             </h1>
          </header>

          <main>
            <div className="palette-bar">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setSelectedColor(color)
                    setTool('draw')
                  }}
                />
              ))}
            </div>

            <Canvas 
              ref={canvasRef}
              width={currentProject.width} 
              height={currentProject.height} 
              activeTool={tool}
              activeLayer={activeLayer}
              selectedColor={selectedColor}
              initialData={currentProjectData}
            />
            
            <div className="toolbar">
              <div className="control-group">
                <button 
                  className={tool === 'draw' ? 'active' : ''} 
                  onClick={() => setTool('draw')}
                  title="Draw"
                >
                  ✏️
                </button>
                <button 
                  className={tool === 'erase' ? 'active' : ''} 
                  onClick={() => setTool('erase')}
                  title="Erase"
                >
                  🧼
                </button>
              </div>

              <div className="divider" />

              <div className="control-group">
                <button 
                  className={activeLayer === 'foreground' ? 'active' : ''} 
                  onClick={() => setActiveLayer('foreground')}
                >
                  fg
                </button>
                <button 
                  className={activeLayer === 'background' ? 'active' : ''} 
                  onClick={() => setActiveLayer('background')}
                >
                  bg
                </button>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  )
}

export default App