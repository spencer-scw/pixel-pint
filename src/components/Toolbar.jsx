import React from 'react';

const Toolbar = ({ tool, setTool, activeLayer, setActiveLayer }) => {
  return (
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
  );
};

export default Toolbar;
