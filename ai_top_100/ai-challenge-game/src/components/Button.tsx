import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  as?: React.ElementType;
  to?: string;
  style?: React.CSSProperties;
}

const StyledButton = styled.button<Omit<ButtonProps, 'children'>>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.medium};
  transition: all ${props => props.theme.transitions.medium};
  font-weight: 500;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.disabled ? 0.6 : 1)};
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  
  /* Size variants */
  padding: ${props => {
    switch (props.size) {
      case 'small':
        return `${props.theme.spacing.xs} ${props.theme.spacing.md}`;
      case 'large':
        return `${props.theme.spacing.md} ${props.theme.spacing.xl}`;
      default:
        return `${props.theme.spacing.sm} ${props.theme.spacing.lg}`;
    }
  }};
  
  font-size: ${props => {
    switch (props.size) {
      case 'small':
        return props.theme.fontSizes.small;
      case 'large':
        return props.theme.fontSizes.large;
      default:
        return props.theme.fontSizes.medium;
    }
  }};
  
  /* Color variants */
  background-color: ${props => {
    if (props.variant === 'outline') return 'transparent';
    
    switch (props.variant) {
      case 'secondary':
        return props.theme.colors.secondary;
      case 'danger':
        return props.theme.colors.danger;
      default:
        return props.theme.colors.primary;
    }
  }};
  
  color: ${props => {
    if (props.variant === 'outline') {
      return props.theme.colors.primary;
    }
    return '#fff';
  }};
  
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'secondary':
        return props.theme.colors.secondary;
      case 'danger':
        return props.theme.colors.danger;
      default:
        return props.theme.colors.primary;
    }
  }};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.medium};
    
    background-color: ${props => {
      if (props.variant === 'outline') {
        return `${props.theme.colors.primary}10`;
      }
      
      switch (props.variant) {
        case 'secondary':
          return '#27ae60';
        case 'danger':
          return '#c0392b';
        default:
          return '#2980b9';
      }
    }};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  onClick,
  children,
  type = 'button',
  ...rest
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...rest}
    >
      {children}
    </StyledButton>
  );
};

export default Button;