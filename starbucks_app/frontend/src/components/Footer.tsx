const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h2>그린빈 커피</h2>
          <p>데모용 커피 주문 PWA</p>
        </div>
        
        <div className="footer-info">
          <p>&copy; {currentYear} 그린빈 커피. 모든 권리 보유.</p>
          <p className="disclaimer">이 앱은 데모용으로 실제 결제가 이루어지지 않습니다.</p>
          <p className="disclaimer">상표: 스타벅스 공식 로고/명칭을 사용하지 않습니다.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;