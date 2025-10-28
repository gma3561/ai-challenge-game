const theme = {
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71',
    danger: '#e74c3c',
    dark: '#2c3e50',
    light: '#ecf0f1',
    text: '#333',
    background: '#f9f9f9',
    
    // 카테고리별 색상
    menuAnalysis: '#ffcccb',
    battleSimulation: '#c2e0ff',
    pdfAnalysis: '#d4ffcc',
    videoFactcheck: '#e0ccff',
    ancientTablet: '#fff5cc',
  },
  
  fontSizes: {
    small: '0.9rem',
    medium: '1rem',
    large: '1.2rem',
    xlarge: '1.5rem',
    xxlarge: '2rem',
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  
  borderRadius: {
    small: '3px',
    medium: '5px',
    large: '10px',
    round: '50%',
  },
  
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.1)',
    medium: '0 2px 10px rgba(0, 0, 0, 0.1)',
    large: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
  
  transitions: {
    fast: '0.2s',
    medium: '0.3s',
    slow: '0.5s',
  },
  
  breakpoints: {
    mobile: '576px',
    tablet: '768px',
    desktop: '992px',
    wide: '1200px',
  },
};

export default theme;