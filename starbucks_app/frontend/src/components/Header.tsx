import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Header = () => {
  const location = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);
  
  // Update cart count whenever localStorage changes
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItemCount(cart.length);
    };
    
    // Initial count
    updateCartCount();
    
    // Listen for storage events to update cart count
    window.addEventListener('storage', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);
  
  // Also update when navigating
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItemCount(cart.length);
  }, [location.pathname]);
  
  return (
    <header className="app-header">
      <div className="logo">
        <Link to="/">
          <h1>그린빈 커피</h1>
        </Link>
      </div>
      
      <nav className="main-nav">
        <ul>
          <li className={location.pathname === '/' ? 'active' : ''}>
            <Link to="/">홈</Link>
          </li>
          <li className={location.pathname.startsWith('/menu') ? 'active' : ''}>
            <Link to="/menu">메뉴</Link>
          </li>
          <li className={location.pathname === '/cart' ? 'active' : ''}>
            <Link to="/cart">
              장바구니
              {cartItemCount > 0 && (
                <span className="cart-badge">{cartItemCount}</span>
              )}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;