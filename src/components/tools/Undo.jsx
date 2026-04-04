import React from 'react';
import { Undo2 } from 'lucide-react';

const Undo = ({ canUndo, onUndo }) => (
  <button
    disabled={!canUndo}
    onClick={onUndo}
    title="Undo"
  >
    <Undo2 size={18} />
  </button>
);

export default Undo;
