import { useState, useRef, useEffect } from 'react';

const ProjectCard = ({ project, onSelect, onRename, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [nameInput, setNameInput] = useState(project.name);
  const infoRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (infoRef.current && !infoRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleRenameSubmit = () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== project.name) {
      onRename(project.id, trimmed);
    } else {
      setNameInput(project.name);
    }
    setRenaming(false);
  };

  const handleInfoClick = (e) => {
    e.stopPropagation();
    if (!renaming) setMenuOpen(o => !o);
  };

  return (
    <>
    {confirming && (
      <div className="modal-overlay" onClick={() => setConfirming(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h3>Delete "{project.name}"?</h3>
          <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>This can't be undone.</p>
          <div className="modal-actions">
            <button className="secondary-btn" onClick={() => setConfirming(false)}>Cancel</button>
            <button className="primary-btn danger" onClick={() => onDelete(project.id)}>Delete</button>
          </div>
        </div>
      </div>
    )}
    <div className="project-card" onClick={() => onSelect(project.id)}>
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
      <div className="project-info" ref={infoRef} onClick={handleInfoClick}>
        {renaming ? (
          <input
            className="project-rename-input"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') { setRenaming(false); setNameInput(project.name); }
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h3>{project.name}</h3>
        )}
        <p>{new Date(project.lastModified).toLocaleDateString()}</p>
        {menuOpen && (
          <div className="project-menu-dropdown">
            <button onClick={(e) => { e.stopPropagation(); setRenaming(true); setMenuOpen(false); }}>
              Rename
            </button>
            <button className="delete" onClick={(e) => { e.stopPropagation(); setConfirming(true); setMenuOpen(false); }}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ProjectCard;
