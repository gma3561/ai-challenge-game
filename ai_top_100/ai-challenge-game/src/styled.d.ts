import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      danger: string;
      dark: string;
      light: string;
      text: string;
      background: string;
      
      // 카테고리별 색상
      menuAnalysis: string;
      battleSimulation: string;
      pdfAnalysis: string;
      videoFactcheck: string;
      ancientTablet: string;
    };
    
    fontSizes: {
      small: string;
      medium: string;
      large: string;
      xlarge: string;
      xxlarge: string;
    };
    
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    
    borderRadius: {
      small: string;
      medium: string;
      large: string;
      round: string;
    };
    
    shadows: {
      small: string;
      medium: string;
      large: string;
    };
    
    transitions: {
      fast: string;
      medium: string;
      slow: string;
    };
    
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
      wide: string;
    };
  }
}