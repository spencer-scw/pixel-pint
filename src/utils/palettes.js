export const fetchLospecPalette = async (name) => {
  try {
    // Try local proxy first if available, otherwise fallback to corsproxy
    const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? '/lospec-api' 
      : 'https://corsproxy.io/?https://lospec.com';
    
    const response = await fetch(`${baseUrl}/palette-list/${name}.hex`);
    if (!response.ok) throw new Error('Palette not found');
    const text = await response.text();
    return parseHexFile(text);
  } catch (error) {
    console.error('Error fetching palette:', error);
    return null;
  }
};

export const parseHexFile = (text) => {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith(';')) // Lospec .hex files sometimes have comments
    .map(hex => hex.startsWith('#') ? hex : `#${hex}`);
};

export const getPopularPaletteNames = async () => {
  try {
    const response = await fetch('/lospec-palettes.json');
    if (!response.ok) throw new Error('Local palette list not found');
    return await response.json();
  } catch (error) {
    console.error('Error loading palette list:', error);
    return ['pico-8', 'sweetie-16', 'aap-64', 'dawnbringer-32'];
  }
};