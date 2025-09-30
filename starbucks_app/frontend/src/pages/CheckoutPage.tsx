import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  menuItemId: string;
  menuItemName: string;
  selectedOptions: Record<string, any>;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  
  // Load cart data
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (!storedCart || storedCart === '[]') {
      // Redirect to cart page if cart is empty
      navigate('/cart');
      return;
    }
    
    try {
      const parsedCart = JSON.parse(storedCart);
      setCartItems(parsedCart);
    } catch (error) {
      console.error('Failed to parse cart data:', error);
      navigate('/cart');
    }
  }, [navigate]);
  
  // Calculate total
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
    setTotalAmount(total);
  }, [cartItems]);
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = [];
    
    for (let i = 0; i < numbers.length && i < 16; i += 4) {
      groups.push(numbers.substring(i, i + 4));
    }
    
    return groups.join(' ');
  };
  
  // Format card expiry with slash
  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    return `${numbers.substring(0, 2)}/${numbers.substring(2, 4)}`;
  };
  
  // Handle form input changes
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };
  
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setCardExpiry(formatted);
  };
  
  const handleCVCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/\D/g, '');
    setCardCVC(numbers.substring(0, 3));
  };
  
  // Process payment
  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError('');
    
    // Validate required fields
    if (!customerName || !cardNumber || !cardExpiry || !cardCVC) {
      setPaymentError('모든 필드를 입력해 주세요.');
      setIsProcessing(false);
      return;
    }
    
    // Validate card number format
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanedCardNumber.length !== 16) {
      setPaymentError('유효한 카드번호를 입력해 주세요.');
      setIsProcessing(false);
      return;
    }
    
    // Mock payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check for test card numbers
    if (cleanedCardNumber === '4242424242424242') {
      // Successful payment
      const orderId = 'ORD-' + Math.floor(Math.random() * 10000);
      
      // Clear cart
      localStorage.removeItem('cart');
      
      // Store order in localStorage for demo
      localStorage.setItem('currentOrder', JSON.stringify({
        id: orderId,
        customerName,
        items: cartItems,
        amount: totalAmount,
        status: 'paid',
        createdAt: new Date().toISOString()
      }));
      
      // Navigate to success page
      navigate('/success');
    } else if (cleanedCardNumber === '4000000000000002') {
      // Failed payment test card
      setPaymentError('결제가 거부되었습니다. 다른 카드로 시도해 주세요.');
    } else {
      setPaymentError('테스트 카드만 사용 가능합니다. (성공: 4242..., 실패: 4000...)');
    }
    
    setIsProcessing(false);
  };
  
  return (
    <div className="checkout-page">
      <h2>결제하기</h2>
      
      <div className="order-summary">
        <h3>주문 내역</h3>
        <div className="items-summary">
          {cartItems.map((item, index) => (
            <div key={index} className="item-summary">
              <span className="item-name">
                {item.menuItemName} x {item.quantity}
              </span>
              <span className="item-price">
                {item.lineTotal.toLocaleString()}원
              </span>
            </div>
          ))}
        </div>
        <div className="total-amount">
          <h4>총 결제 금액</h4>
          <p>{totalAmount.toLocaleString()}원</p>
        </div>
      </div>
      
      <form className="payment-form" onSubmit={processPayment}>
        <div className="form-group">
          <label htmlFor="customerName">이름</label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="주문자 이름"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="cardNumber">카드 번호</label>
          <input
            id="cardNumber"
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            required
          />
        </div>
        
        <div className="card-details">
          <div className="form-group expiry">
            <label htmlFor="cardExpiry">유효기간</label>
            <input
              id="cardExpiry"
              type="text"
              value={cardExpiry}
              onChange={handleExpiryChange}
              placeholder="MM/YY"
              maxLength={5}
              required
            />
          </div>
          
          <div className="form-group cvc">
            <label htmlFor="cardCVC">CVC</label>
            <input
              id="cardCVC"
              type="text"
              value={cardCVC}
              onChange={handleCVCChange}
              placeholder="123"
              maxLength={3}
              required
            />
          </div>
        </div>
        
        {paymentError && (
          <div className="error-message">
            {paymentError}
          </div>
        )}
        
        <div className="test-card-notice">
          <p>데모 카드 번호:</p>
          <ul>
            <li>성공: <strong>4242 4242 4242 4242</strong></li>
            <li>실패: <strong>4000 0000 0000 0002</strong></li>
          </ul>
          <p>* 실제 결제가 이루어지지 않습니다.</p>
        </div>
        
        <button 
          type="submit" 
          className="pay-button"
          disabled={isProcessing}
        >
          {isProcessing ? '처리 중...' : `${totalAmount.toLocaleString()}원 결제하기`}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;