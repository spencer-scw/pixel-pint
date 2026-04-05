import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getProjects, deleteProject, updateProjectMeta } from '../utils/storage';
import NewProjectModal from './NewProjectModal';
import ProjectCard from './ProjectCard';
import './ProjectList.css';

const ProjectList = ({ onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleProjectCreated = (id) => {
    setIsModalOpen(false);
    onSelectProject(id);
  };

  const handleRename = (id, newName) => {
    setProjects(updateProjectMeta(id, { name: newName }));
  };

  const handleDelete = (id) => {
    setProjects(deleteProject(id));
  };

  return (
    <div className="project-list-container">
      <div className="project-list-header">
        <h2>Your Drawings</h2>
        <button onClick={() => setIsModalOpen(true)} className="new-project-btn">
          <Plus size={18} /> New Project
        </button>
      </div>

      <NewProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onProjectCreated={handleProjectCreated}
      />

      <div className="projects-grid">
        {projects.length === 0 && (
           <p className="empty-state">No drawings yet. Create one!</p>
        )}
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onSelect={onSelectProject} onRename={handleRename} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;