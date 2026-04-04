import React from 'react';
import { SendToBack } from 'lucide-react';

const Background = ({ activeLayer, setActiveLayer }) => (
  <button
    className={activeLayer === 'background' ? 'active' : ''}
    onClick={() => setActiveLayer('background')}
    title="Background"
  >
    <SendToBack size={18} />
  </button>
);

export default Background;
