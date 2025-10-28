import React from 'react';
import styled from 'styled-components';

interface CardProps {
  children: React.ReactNode;
  color?: string;
  padding?: string;
  elevation?: 'low' | 'medium' | 'high';
  onClick?: () => void;
  className?: string;
}

const StyledCard = styled.div<Omit<CardProps, 'children'>>`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.large};
  padding: ${props => props.padding || props.theme.spacing.lg};
  transition: transform ${props => props.theme.transitions.medium},
    box-shadow ${props => props.theme.transitions.medium};
  cursor: ${props => (props.onClick ? 'pointer' : 'default')};
  
  ${props => {
    if (props.color) {
      return `
        border-top: 5px solid ${props.color};
      `;
    }
    return '';
  }}
  
  box-shadow: ${props => {
    switch (props.elevation) {
      case 'low':
        return props.theme.shadows.small;
      case 'high':
        return props.theme.shadows.large;
      default:
        return props.theme.shadows.medium;
    }
  }};
  
  &:hover {
    ${props =>
      props.onClick
        ? `
      transform: translateY(-5px);
      box-shadow: ${props.theme.shadows.large};
    `
        : ''}
  }
`;

const Card: React.FC<CardProps> = ({
  children,
  color,
  padding,
  elevation = 'medium',
  onClick,
  className,
}) => {
  return (
    <StyledCard
      color={color}
      padding={padding}
      elevation={elevation}
      onClick={onClick}
      className={className}
    >
      {children}
    </StyledCard>
  );
};

export default Card;