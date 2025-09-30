import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Define types for cart item
interface CartItem {
  menuItemId: string;
  menuItemName: string;
  selectedOptions: Record<string, any>;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigate = useNavigate();
  
  // Load cart data from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Failed to parse cart data:', error);
        setCartItems([]);
      }
    }
  }, []);

  // Calculate total amount when cart items change
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
    setTotalAmount(total);
  }, [cartItems]);

  // Handle quantity change
  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = [...cartItems];
    updatedCart[index] = {
      ...updatedCart[index],
      quantity: newQuantity,
      lineTotal: updatedCart[index].unitPrice * newQuantity
    };
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Handle item removal
  const removeItem = (index: number) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout');
  };

  // Format option name and price delta
  const formatOptionText = (optionKey: string, optionValue: any) => {
    // This is a simplified version. In a real app, we would fetch option details from the menu data
    // based on the optionKey and optionValue
    return `${optionKey}: ${optionValue}`;
  };

  return (
    <div className="cart-page">
      <h2>장바구니</h2>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>장바구니가 비어 있습니다.</p>
          <Link to="/menu" className="go-to-menu-button">메뉴 보기</Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="item-info">
                  <h3>{item.menuItemName}</h3>
                  <div className="options-list">
                    {Object.entries(item.selectedOptions).map(([key, value]) => (
                      <p key={key} className="option">
                        {formatOptionText(key, value)}
                      </p>
                    ))}
                  </div>
                </div>
                
                <div className="item-quantity">
                  <button onClick={() => updateItemQuantity(index, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateItemQuantity(index, item.quantity + 1)}>+</button>
                </div>
                
                <div className="item-price">
                  <p className="unit-price">{item.unitPrice.toLocaleString()}원</p>
                  <p className="line-total">{item.lineTotal.toLocaleString()}원</p>
                </div>
                
                <button 
                  className="remove-item-button"
                  onClick={() => removeItem(index)}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <div className="total-amount">
              <h3>총 금액</h3>
              <p>{totalAmount.toLocaleString()}원</p>
            </div>
            
            <button 
              className="checkout-button"
              onClick={proceedToCheckout}
              disabled={cartItems.length === 0}
            >
              결제하기
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;