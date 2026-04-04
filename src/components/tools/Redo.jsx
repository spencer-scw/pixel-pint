import React from 'react';
import { Redo2 } from 'lucide-react';

const Redo = ({ canRedo, onRedo }) => (
  <button
    disabled={!canRedo}
    onClick={onRedo}
    title="Redo"
  >
    <Redo2 size={18} />
  </button>
);

export default Redo;
