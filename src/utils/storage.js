const STORAGE_PREFIX = 'pixel-pint-';
const LIST_KEY = `${STORAGE_PREFIX}projects-list`;

export const getProjects = () => {
  const list = localStorage.getItem(LIST_KEY);
  return list ? JSON.parse(list) : [];
};

export const saveProjectList = (projects) => {
  localStorage.setItem(LIST_KEY, JSON.stringify(projects));
};

export const saveProjectData = (id, data) => {
  localStorage.setItem(`${STORAGE_PREFIX}project-${id}`, JSON.stringify(data));
};

export const loadProjectData = (id) => {
  const data = localStorage.getItem(`${STORAGE_PREFIX}project-${id}`);
  return data ? JSON.parse(data) : null;
};

export const createProject = (name, size) => {
  const id = Date.now().toString();
  const newProject = {
    id,
    name,
    width: size,
    height: size,
    lastModified: Date.now(),
  };
  
  const projects = getProjects();
  projects.unshift(newProject);
  saveProjectList(projects);
  
  // Initialize empty data
  saveProjectData(id, { foreground: null, background: null });
  
  return newProject;
};

export const updateProjectMeta = (id, updates) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index !== -1) {
    projects[index] = { ...projects[index], ...updates, lastModified: Date.now() };
    saveProjectList(projects);
    return projects;
  }
  return projects;
};
