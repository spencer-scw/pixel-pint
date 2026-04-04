import React from 'react';
import { Pipette } from 'lucide-react';

const ColorPicker = ({ tool, setTool }) => (
  <button
    className={tool === 'eyedropper' ? 'active' : ''}
    onClick={() => setTool('eyedropper')}
    title="Color Picker"
  >
    <Pipette size={18} />
  </button>
);

export default ColorPicker;
