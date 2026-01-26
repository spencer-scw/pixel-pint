import { useState } from 'react'
import './App.css'
import Editor from './components/Editor'
import ProjectList from './components/ProjectList'

function App() {
  const [view, setView] = useState('home'); // 'home' | 'editor'
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const handleSelectProject = (id) => {
    setSelectedProjectId(id);
    setView('editor');
  };

  const handleBack = () => {
    setView('home');
    setSelectedProjectId(null);
  };

  return (
    <div className="app-container">
      {view === 'home' && (
        <>
          <header className="home-header">
            <img src="/favicon.svg" alt="pixel-pint logo" className="home-logo" />
            <h1>pixel-pint</h1>
          </header>
          <ProjectList onSelectProject={handleSelectProject} />
        </>
      )}

      {view === 'editor' && selectedProjectId && (
        <Editor 
          projectId={selectedProjectId}
          onBack={handleBack}
        />
      )}
    </div>
  )
}

export default App
