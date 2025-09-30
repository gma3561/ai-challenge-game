import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Define types for menu data
interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  basePrice: number;
  badges: {
    caffeine: boolean;
    allergens: string[];
  };
}

const MenuListPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    // In a real app, this would be fetched from the API
    fetch('/data/menu.json')
      .then(response => response.json())
      .then(data => {
        setCategories(data.categories);
        setMenuItems(data.items);
        
        // Set default active category to the first category
        if (data.categories.length > 0 && !activeCategory) {
          setActiveCategory(data.categories[0].id);
        }
      })
      .catch(error => console.error('Error loading menu data:', error));
  }, []);

  useEffect(() => {
    if (activeCategory) {
      setFilteredItems(menuItems.filter(item => item.categoryId === activeCategory));
    } else {
      setFilteredItems(menuItems);
    }
  }, [activeCategory, menuItems]);

  return (
    <div className="menu-list-page">
      <div className="category-tabs">
        {categories.map(category => (
          <button 
            key={category.id}
            className={activeCategory === category.id ? 'active' : ''}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      <div className="menu-items">
        {filteredItems.map(item => (
          <div key={item.id} className="menu-item-card">
            <Link to={`/menu/${item.id}`}>
              <div className="menu-item-content">
                <h3>{item.name}</h3>
                <p className="price">{item.basePrice.toLocaleString()}원</p>
                <div className="badges">
                  {item.badges.caffeine && <span className="badge caffeine">카페인</span>}
                  {item.badges.allergens.map(allergen => (
                    <span key={allergen} className="badge allergen">{allergen}</span>
                  ))}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuListPage;