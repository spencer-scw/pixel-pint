import React from 'react';

const SortMethodSelect = ({ sortMethod, onSortMethodChange }) => {
  const options = [
    { value: 'none', label: 'None' },
    { value: 'hue', label: 'Hue' },
    { value: 'luminance', label: 'Brightness' },
  ];

  return (
    <div className="input-group">
      <label style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>Sort colors by...</label>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {options.map(option => (
          <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="sortMethod"
              value={option.value}
              checked={sortMethod === option.value}
              onChange={(e) => onSortMethodChange(e.target.value)}
              style={{ cursor: 'pointer', width: '14px', height: '14px' }}
            />
            <span style={{ fontSize: '0.9rem' }}>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default SortMethodSelect;
