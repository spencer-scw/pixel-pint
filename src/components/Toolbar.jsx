import React from 'react';
import { Pencil, Fill, ColorPicker, Eraser, Undo, Redo, Foreground, Background } from './tools';

const Toolbar = ({ tool, setTool, activeLayer, setActiveLayer, onUndo, onRedo, canUndo, canRedo }) => {
  return (
    <div className="toolbar">
      <div className="control-group">
        <Pencil tool={tool} setTool={setTool} />
        <Fill tool={tool} setTool={setTool} />
        <ColorPicker tool={tool} setTool={setTool} />
        <Eraser tool={tool} setTool={setTool} />
      </div>

      <div className="divider" />

      <div className="control-group">
        <Undo canUndo={canUndo} onUndo={onUndo} />
        <Redo canRedo={canRedo} onRedo={onRedo} />
      </div>

      <div className="divider" />

      <div className="control-group">
        <Foreground activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
        <Background activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
      </div>
    </div>
  );
};

export default Toolbar;
