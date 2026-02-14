/**
 * Convert hex color to HSL values
 * @param {string} hex - Color in hex format (#RRGGBB)
 * @returns {object} { h: 0-360, s: 0-100, l: 0-100 }
 */
export const hexToHSL = (hex) => {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  switch (max) {
    case rNorm:
      h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
      break;
    case gNorm:
      h = ((bNorm - rNorm) / d + 2) / 6;
      break;
    case bNorm:
      h = ((rNorm - gNorm) / d + 4) / 6;
      break;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

/**
 * Calculate perceived luminance of a color (brightness)
 * Uses standard luminance formula
 * @param {string} hex - Color in hex format (#RRGGBB)
 * @returns {number} Luminance value 0-255
 */
export const getLuminance = (hex) => {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;

  // Standard luminance formula: 0.299*R + 0.587*G + 0.114*B
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

/**
 * Sort colors by luminance (brightness)
 * Arranges from dark to light
 * @param {string[]} colors - Array of hex colors
 * @returns {string[]} Sorted array of colors
 */
export const sortColorsByLuminance = (colors) => {
  if (colors.length === 0) return colors;

  const colorsWithLum = colors.map(color => ({
    color,
    luminance: getLuminance(color)
  }));

  // Sort by luminance from dark to light
  colorsWithLum.sort((a, b) => a.luminance - b.luminance);

  // Distribute into 2 columns for 2-row layout
  const result = [];
  const left = [];
  const right = [];

  colorsWithLum.forEach((item, i) => {
    if (i % 2 === 0) {
      left.push(item.color);
    } else {
      right.push(item.color);
    }
  });

  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    if (i < left.length) result.push(left[i]);
    if (i < right.length) result.push(right[i]);
  }

  return result;
};

/**
 * Sort colors by hue with desaturated colors grouped at the start
 * Groups muted/desaturated colors (saturation < 30%) by lightness,
 * then sorts saturated colors by hue
 * @param {string[]} colors - Array of hex colors
 * @returns {string[]} Sorted array of colors
 */
export const sortColorsByHue = (colors) => {
  if (colors.length === 0) return colors;

  const colorsWithData = colors.map(color => ({
    color,
    hsl: hexToHSL(color)
  }));

  // Split into desaturated (low saturation) and saturated colors
  // Using saturation as the perceptual indicator of "neutralness"
  const SATURATION_THRESHOLD = 30;
  const desaturated = [];
  const saturated = [];

  colorsWithData.forEach(item => {
    if (item.hsl.s < SATURATION_THRESHOLD) {
      desaturated.push(item);
    } else {
      saturated.push(item);
    }
  });

  // Sort desaturated colors by lightness (dark to light)
  desaturated.sort((a, b) => a.hsl.l - b.hsl.l);

  // Sort saturated colors by hue, then saturation (high to low), then lightness
  saturated.sort((a, b) => {
    const hueDiff = a.hsl.h - b.hsl.h;
    if (Math.abs(hueDiff) > 1) return hueDiff;

    const satDiff = b.hsl.s - a.hsl.s;
    if (Math.abs(satDiff) > 1) return satDiff;

    return a.hsl.l - b.hsl.l;
  });

  // Combine colors
  const desaturatedColors = desaturated.map(item => item.color);
  const saturatedColors = saturated.map(item => item.color);

  const result = [];
  result.push(...desaturatedColors);
  result.push(...saturatedColors);

  return result;
};
