import React from 'react';
import { Pencil as PencilIcon } from 'lucide-react';

const Pencil = ({ tool, setTool }) => (
  <button
    className={tool === 'draw' ? 'active' : ''}
    onClick={() => setTool('draw')}
    title="Draw"
  >
    <PencilIcon size={18} />
  </button>
);

export default Pencil;
