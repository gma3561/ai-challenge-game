import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Define the type for featured menu items
interface MenuItem {
  id: string;
  name: string;
  basePrice: number;
  categoryId: string;
}

const HomePage = () => {
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [storeName, setStoreName] = useState('그린빈 커피');
  const [storeHours, setStoreHours] = useState('평일 7:00 - 21:00 / 주말 9:00 - 20:00');
  
  useEffect(() => {
    // In a real app, this would be fetched from the API
    fetch('/data/menu.json')
      .then(response => response.json())
      .then(data => {
        // Get 3 random menu items as featured items
        const randomItems = [...data.items]
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        setFeaturedItems(randomItems);
      })
      .catch(error => console.error('Error loading menu data:', error));
  }, []);

  return (
    <div className="home-page">
      <div className="store-info">
        <h2>{storeName}</h2>
        <p>{storeHours}</p>
      </div>
      
      <section className="featured-menu">
        <h2>오늘의 추천 메뉴</h2>
        <div className="featured-items">
          {featuredItems.map(item => (
            <div key={item.id} className="featured-item">
              <Link to={`/menu/${item.id}`}>
                <h3>{item.name}</h3>
                <p className="price">{item.basePrice.toLocaleString()}원</p>
              </Link>
            </div>
          ))}
        </div>
      </section>
      
      <div className="view-menu-button">
        <Link to="/menu">전체 메뉴 보기</Link>
      </div>
    </div>
  );
};

export default HomePage;