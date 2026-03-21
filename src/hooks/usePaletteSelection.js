import { useState } from 'react';
import { sortColorsByHue, sortColorsByLuminance } from '../utils/colorSort';

/**
 * Hook to manage palette selection and sorting state
 * @param {string[]} initialColors - Initial palette colors
 * @param {string} initialPaletteName - Initial palette name
 * @returns {object} Palette state and utilities
 */
export const usePaletteSelection = (initialColors = [], initialPaletteName = null) => {
  const [selectedColors, setSelectedColors] = useState(initialColors);
  const [selectedPaletteName, setSelectedPaletteName] = useState(initialPaletteName);
  const [sortMethod, setSortMethod] = useState('none');

  const getSortedColors = (colors) => {
    if (sortMethod === 'hue') {
      return sortColorsByHue(colors);
    } else if (sortMethod === 'luminance') {
      return sortColorsByLuminance(colors);
    }
    return colors;
  };

  const getFinalColors = () => getSortedColors(selectedColors);

  return {
    selectedColors,
    setSelectedColors,
    selectedPaletteName,
    setSelectedPaletteName,
    sortMethod,
    setSortMethod,
    getFinalColors,
  };
};
