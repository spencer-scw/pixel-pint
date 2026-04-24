import React, { useState, useEffect } from 'react';
import { Plus, Upload } from 'lucide-react';
import { getProjects } from '../utils/storage';
import NewProjectModal from './NewProjectModal';
import ImportProjectModal from './ImportProjectModal';
import './ProjectList.css';

const ProjectList = ({ onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleProjectCreated = (id) => {
    setIsModalOpen(false);
    setIsImportModalOpen(false);
    onSelectProject(id);
  };

  return (
    <div className="project-list-container">
      <div className="project-list-header">
        <h2>Your Drawings</h2>
        <div className="project-list-actions">
          <button onClick={() => setIsImportModalOpen(true)} className="import-project-btn">
            <Upload size={18} /> Import
          </button>
          <button onClick={() => setIsModalOpen(true)} className="new-project-btn">
            <Plus size={18} /> New Project
          </button>
        </div>
      </div>

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <ImportProjectModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <div className="projects-grid">
        {projects.length === 0 && (
           <p className="empty-state">No drawings yet. Create one!</p>
        )}
        {projects.map((project) => (
          <div key={project.id} className="project-card" onClick={() => onSelectProject(project.id)}>
            <div className={`project-preview ${project.thumbnail ? 'has-thumbnail' : ''}`}>
               {project.thumbnail ? (
                 <img 
                   src={project.thumbnail} 
                   alt={project.name} 
                   className="thumbnail-img" 
                   style={{ 
                     aspectRatio: `${project.width} / ${project.height}`,
                     width: project.width >= project.height ? '100%' : 'auto',
                     height: project.width >= project.height ? 'auto' : '100%'
                   }}
                 />
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