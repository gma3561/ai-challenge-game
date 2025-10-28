import { createGlobalStyle } from 'styled-components';
import theme from './theme';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: ${theme.colors.text};
    background-color: ${theme.colors.background};
  }
  
  a {
    text-decoration: none;
    color: ${theme.colors.primary};
  }
  
  ul, ol {
    list-style: none;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-bottom: ${theme.spacing.md};
  }
  
  button {
    cursor: pointer;
    background: none;
    border: none;
    outline: none;
  }
  
  input, textarea, select {
    font-family: inherit;
  }
  
  img {
    max-width: 100%;
    height: auto;
  }
`;

export default GlobalStyle;