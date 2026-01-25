import React, { useState, useEffect } from 'react';
import { getProjects, createProject } from '../utils/storage';
import './ProjectList.css';

const ProjectList = ({ onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSize, setNewSize] = useState(16);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    const name = newName.trim() || 'untitled';
    const newProject = createProject(name, newSize);
    onSelectProject(newProject.id);
  };

  return (
    <div className="project-list-container">
      <div className="project-list-header">
        <h2>Your Drawings</h2>
        <button onClick={() => setIsCreating(!isCreating)} className="new-project-btn">
          {isCreating ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {isCreating && (
        <form className="create-project-form" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Drawing Name (optional)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <div className="size-selector">
             <label>Size:</label>
             <button type="button" className={newSize === 16 ? 'active' : ''} onClick={() => setNewSize(16)}>16x16</button>
             <button type="button" className={newSize === 32 ? 'active' : ''} onClick={() => setNewSize(32)}>32x32</button>
             <button type="button" className={newSize === 64 ? 'active' : ''} onClick={() => setNewSize(64)}>64x64</button>
          </div>
          <button type="submit" className="create-confirm-btn">Start Drawing</button>
        </form>
      )}

      <div className="projects-grid">
        {projects.length === 0 && !isCreating && (
           <p className="empty-state">No drawings yet. Create one!</p>
        )}
        {projects.map((project) => (
          <div key={project.id} className="project-card" onClick={() => onSelectProject(project.id)}>
            <div className="project-preview">
               {project.thumbnail ? (
                 <img src={project.thumbnail} alt={project.name} className="thumbnail-img" />
               ) : (
                 <span className="project-size-badge">{project.width}x{project.height}</span>
               )}
            </div>
            <div className="project-info">
              <h3>{project.name}</h3>
              <p>{new Date(project.lastModified).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;