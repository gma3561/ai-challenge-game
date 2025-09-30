import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Order {
  id: string;
  customerName: string;
  amount: number;
  createdAt: string;
}

const SuccessPage = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  
  useEffect(() => {
    // Get order from localStorage
    const orderData = localStorage.getItem('currentOrder');
    
    if (!orderData) {
      // Redirect to home if no order data
      navigate('/');
      return;
    }
    
    try {
      const parsedOrder = JSON.parse(orderData);
      setOrder(parsedOrder);
    } catch (error) {
      console.error('Failed to parse order data:', error);
      navigate('/');
    }
  }, [navigate]);
  
  if (!order) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="success-page">
      <div className="success-icon">✓</div>
      <h2>주문이 완료되었습니다!</h2>
      
      <div className="order-details">
        <div className="order-number">
          <h3>주문번호</h3>
          <p>{order.id}</p>
        </div>
        
        <div className="customer-name">
          <h3>주문자명</h3>
          <p>{order.customerName}</p>
        </div>
        
        <div className="order-amount">
          <h3>결제금액</h3>
          <p>{order.amount.toLocaleString()}원</p>
        </div>
      </div>
      
      <div className="pickup-instructions">
        <p>카운터에서 이름 확인 후 수령해 주세요.</p>
        <p>잠시만 기다려 주시면 음료를 준비해 드리겠습니다.</p>
      </div>
      
      <Link to="/" className="new-order-button">
        다시 주문하기
      </Link>
    </div>
  );
};

export default SuccessPage;