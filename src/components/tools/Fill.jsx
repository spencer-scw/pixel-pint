import React from 'react';
import { PaintBucket } from 'lucide-react';

const Fill = ({ tool, setTool }) => (
  <button
    className={tool === 'fill' ? 'active' : ''}
    onClick={() => setTool('fill')}
    title="Fill"
  >
    <PaintBucket size={18} />
  </button>
);

export default Fill;
