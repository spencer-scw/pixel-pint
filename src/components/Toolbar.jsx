import React from 'react';
import { Pencil, Eraser, PaintBucket, BringToFront, SendToBack, Undo2, Redo2 } from 'lucide-react';

const Toolbar = ({ tool, setTool, activeLayer, setActiveLayer, onUndo, onRedo, canUndo, canRedo }) => {
  return (
    <div className="toolbar">
      <div className="control-group">
        <button
          className={tool === 'draw' ? 'active' : ''}
          onClick={() => setTool('draw')}
          title="Draw"
        >
          <Pencil size={18} />
        </button>
        <button
          className={tool === 'fill' ? 'active' : ''}
          onClick={() => setTool('fill')}
          title="Fill Bucket"
        >
          <PaintBucket size={18} />
        </button>
        <button
          className={tool === 'erase' ? 'active' : ''}
          onClick={() => setTool('erase')}
          title="Erase"
        >
          <Eraser size={18} />
        </button>
      </div>

      <div className="divider" />

      <div className="control-group">
        <button
          disabled={!canUndo}
          onClick={onUndo}
          title="Undo"
        >
          <Undo2 size={18} />
        </button>
        <button
          disabled={!canRedo}
          onClick={onRedo}
          title="Redo"
        >
          <Redo2 size={18} />
        </button>
      </div>

      <div className="divider" />

      <div className="control-group">
        <button
          className={activeLayer === 'foreground' ? 'active' : ''}
          onClick={() => setActiveLayer('foreground')}
          title="Foreground"
        >
          <BringToFront size={18} />
        </button>
        <button
          className={activeLayer === 'background' ? 'active' : ''}
          onClick={() => setActiveLayer('background')}
          title="Background"
        >
          <SendToBack size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;