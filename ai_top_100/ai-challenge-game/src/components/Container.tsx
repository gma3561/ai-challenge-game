import React from 'react';
import styled from 'styled-components';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
}

const StyledContainer = styled.div<{ fluid?: boolean }>`
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  padding-right: 15px;
  padding-left: 15px;
  
  max-width: ${props => (props.fluid ? '100%' : '1200px')};
  
  @media (max-width: ${props => props.theme.breakpoints.desktop}) {
    max-width: 960px;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    max-width: 720px;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    max-width: 540px;
  }
`;

const Container: React.FC<ContainerProps> = ({ children, className, fluid }) => {
  return (
    <StyledContainer fluid={fluid} className={className}>
      {children}
    </StyledContainer>
  );
};

export default Container;