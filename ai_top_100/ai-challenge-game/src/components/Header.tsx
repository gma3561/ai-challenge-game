import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import Container from './Container';

const HeaderWrapper = styled.header`
  background-color: white;
  box-shadow: ${props => props.theme.shadows.medium};
  padding: ${props => props.theme.spacing.md} 0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled(Container)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  font-size: ${props => props.theme.fontSizes.xlarge};
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  
  span {
    margin-left: ${props => props.theme.spacing.sm};
  }
`;

const Nav = styled.nav`
  display: flex;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const NavList = styled.ul`
  display: flex;
`;

const NavItem = styled.li`
  margin-left: ${props => props.theme.spacing.lg};
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  color: ${props => (props.$active ? props.theme.colors.primary : props.theme.colors.dark)};
  font-weight: ${props => (props.$active ? '500' : 'normal')};
  padding: ${props => props.theme.spacing.sm} 0;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${props => props.theme.colors.primary};
    transform: ${props => (props.$active ? 'scaleX(1)' : 'scaleX(0)')};
    transform-origin: bottom left;
    transition: transform ${props => props.theme.transitions.medium};
  }
  
  &:hover:after {
    transform: scaleX(1);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  font-size: 1.5rem;
  color: ${props => props.theme.colors.dark};
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: block;
  }
`;

const Header: React.FC = () => {
  const location = useLocation();
  
  return (
    <HeaderWrapper>
      <HeaderContent>
        <Logo to="/">
          <i className="fas fa-robot" />
          <span>AI 챌린지</span>
        </Logo>
        
        <Nav>
          <NavList>
            <NavItem>
              <NavLink to="/" $active={location.pathname === '/'}>
                홈
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink 
                to="/problems" 
                $active={location.pathname === '/problems' || location.pathname.startsWith('/problem/')}
              >
                문제
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/about" $active={location.pathname === '/about'}>
                소개
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/progress" $active={location.pathname === '/progress'}>
                진행상황
              </NavLink>
            </NavItem>
          </NavList>
        </Nav>
        
        <MobileMenuButton>
          <i className="fas fa-bars" />
        </MobileMenuButton>
      </HeaderContent>
    </HeaderWrapper>
  );
};

export default Header;