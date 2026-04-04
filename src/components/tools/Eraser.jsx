import React from 'react';
import { Eraser as EraserIcon } from 'lucide-react';

const Eraser = ({ tool, setTool }) => (
  <button
    className={tool === 'erase' ? 'active' : ''}
    onClick={() => setTool('erase')}
    title="Erase"
  >
    <EraserIcon size={18} />
  </button>
);

export default Eraser;
