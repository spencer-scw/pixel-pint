import React from 'react';
import { BringToFront } from 'lucide-react';

const Foreground = ({ activeLayer, setActiveLayer }) => (
  <button
    className={activeLayer === 'foreground' ? 'active' : ''}
    onClick={() => setActiveLayer('foreground')}
    title="Foreground"
  >
    <BringToFront size={18} />
  </button>
);

export default Foreground;
