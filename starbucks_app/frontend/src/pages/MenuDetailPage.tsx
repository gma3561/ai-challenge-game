import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Define types for menu item and options
interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  basePrice: number;
  badges: {
    caffeine: boolean;
    allergens: string[];
  };
  optionGroupIds: string[];
}

interface Option {
  id: string;
  name: string;
  priceDelta: number;
}

interface OptionGroup {
  id: string;
  name: string;
  type: 'single' | 'multiple' | 'counter';
  required: boolean;
  options?: Option[];
  min?: number;
  max?: number;
  unitPriceDelta?: number;
  visibleWhen?: Record<string, string>;
}

interface SelectedOptions {
  [key: string]: string | number | string[];
}

const MenuDetailPage = () => {
  const { menuId } = useParams<{ menuId: string }>();
  const navigate = useNavigate();
  
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [optionGroups, setOptionGroups] = useState<Record<string, OptionGroup>>({});
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addToCartEnabled, setAddToCartEnabled] = useState(false);

  useEffect(() => {
    // In a real app, this would be fetched from the API
    fetch('/data/menu.json')
      .then(response => response.json())
      .then(data => {
        const item = data.items.find((i: MenuItem) => i.id === menuId);
        if (item) {
          setMenuItem(item);
          setTotalPrice(item.basePrice);
          
          // Set option groups
          setOptionGroups(data.commonOptionGroups);
          
          // Initialize selected options with defaults
          const initialOptions: SelectedOptions = {};
          item.optionGroupIds.forEach(groupId => {
            const group = data.commonOptionGroups[groupId];
            if (group) {
              if (group.type === 'single' && group.options && group.options.length > 0) {
                initialOptions[groupId] = group.options[0].id;
              } else if (group.type === 'counter') {
                initialOptions[groupId] = 0;
              } else if (group.type === 'multiple') {
                initialOptions[groupId] = [];
              }
            }
          });
          setSelectedOptions(initialOptions);
        }
      })
      .catch(error => console.error('Error loading menu data:', error));
  }, [menuId]);

  // Calculate total price when options change
  useEffect(() => {
    if (!menuItem) return;
    
    let price = menuItem.basePrice;
    
    // Add price deltas from selected options
    Object.entries(selectedOptions).forEach(([groupId, value]) => {
      const group = optionGroups[groupId];
      if (!group) return;
      
      if (group.type === 'single' && typeof value === 'string') {
        const option = group.options?.find(opt => opt.id === value);
        if (option) {
          price += option.priceDelta;
        }
      } else if (group.type === 'counter' && typeof value === 'number') {
        if (group.unitPriceDelta) {
          price += value * group.unitPriceDelta;
        }
      } else if (group.type === 'multiple' && Array.isArray(value)) {
        value.forEach(optionId => {
          const option = group.options?.find(opt => opt.id === optionId);
          if (option) {
            price += option.priceDelta;
          }
        });
      }
    });
    
    // Multiply by quantity
    price *= quantity;
    
    setTotalPrice(price);
  }, [menuItem, selectedOptions, quantity, optionGroups]);

  // Validate if we can add to cart
  useEffect(() => {
    if (!menuItem || !optionGroups) return;
    
    // Check if all required options are selected
    const allRequiredSelected = menuItem.optionGroupIds.every(groupId => {
      const group = optionGroups[groupId];
      if (!group || !group.required) return true;
      
      const value = selectedOptions[groupId];
      if (group.type === 'single') {
        return !!value;
      } else if (group.type === 'counter') {
        return true; // Counter always has a value (even 0)
      } else if (group.type === 'multiple') {
        return Array.isArray(value) && value.length > 0;
      }
      return false;
    });
    
    setAddToCartEnabled(allRequiredSelected);
  }, [menuItem, selectedOptions, optionGroups]);

  const handleOptionChange = (groupId: string, value: string | number | string[]) => {
    setSelectedOptions(prev => ({
      ...prev,
      [groupId]: value
    }));
  };

  const isOptionVisible = (group: OptionGroup): boolean => {
    if (!group.visibleWhen) return true;
    
    // Check visibility condition
    const [conditionKey, conditionValue] = Object.entries(group.visibleWhen)[0];
    return selectedOptions[conditionKey] === conditionValue;
  };

  const addToCart = () => {
    if (!menuItem || !addToCartEnabled) return;
    
    // In a real app, we would add this to a cart context or state manager
    const cartItem = {
      menuItemId: menuItem.id,
      menuItemName: menuItem.name,
      selectedOptions: selectedOptions,
      quantity: quantity,
      unitPrice: totalPrice / quantity,
      lineTotal: totalPrice
    };
    
    // For now, we'll just store in localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Navigate to cart page
    navigate('/cart');
  };

  if (!menuItem) {
    return <div>Loading...</div>;
  }

  return (
    <div className="menu-detail-page">
      <div className="menu-header">
        <h2>{menuItem.name}</h2>
        <div className="badges">
          {menuItem.badges.caffeine && <span className="badge caffeine">카페인</span>}
          {menuItem.badges.allergens.map(allergen => (
            <span key={allergen} className="badge allergen">{allergen}</span>
          ))}
        </div>
        <p className="base-price">기본 가격: {menuItem.basePrice.toLocaleString()}원</p>
      </div>
      
      <div className="options-container">
        {menuItem.optionGroupIds.map(groupId => {
          const group = optionGroups[groupId];
          if (!group || !isOptionVisible(group)) return null;
          
          return (
            <div key={groupId} className="option-group">
              <h3>{group.name} {group.required && <span className="required">*</span>}</h3>
              
              {group.type === 'single' && group.options && (
                <div className="single-options">
                  {group.options.map(option => (
                    <button 
                      key={option.id}
                      className={selectedOptions[groupId] === option.id ? 'selected' : ''}
                      onClick={() => handleOptionChange(groupId, option.id)}
                    >
                      {option.name}
                      {option.priceDelta > 0 && ` (+${option.priceDelta.toLocaleString()}원)`}
                    </button>
                  ))}
                </div>
              )}
              
              {group.type === 'counter' && (
                <div className="counter-option">
                  <button 
                    onClick={() => {
                      const current = selectedOptions[groupId] as number;
                      if (current > (group.min || 0)) {
                        handleOptionChange(groupId, current - 1);
                      }
                    }}
                    disabled={(selectedOptions[groupId] as number) <= (group.min || 0)}
                  >
                    -
                  </button>
                  <span>{selectedOptions[groupId]}</span>
                  <button
                    onClick={() => {
                      const current = selectedOptions[groupId] as number;
                      if (current < (group.max || 10)) {
                        handleOptionChange(groupId, current + 1);
                      }
                    }}
                    disabled={(selectedOptions[groupId] as number) >= (group.max || 10)}
                  >
                    +
                  </button>
                  {group.unitPriceDelta && (
                    <span className="price-delta">
                      +{((selectedOptions[groupId] as number) * group.unitPriceDelta).toLocaleString()}원
                    </span>
                  )}
                </div>
              )}
              
              {group.type === 'multiple' && group.options && (
                <div className="multiple-options">
                  {group.options.map(option => {
                    const selected = Array.isArray(selectedOptions[groupId]) && 
                                    (selectedOptions[groupId] as string[]).includes(option.id);
                    return (
                      <button 
                        key={option.id}
                        className={selected ? 'selected' : ''}
                        onClick={() => {
                          if (!Array.isArray(selectedOptions[groupId])) {
                            handleOptionChange(groupId, [option.id]);
                          } else {
                            const current = selectedOptions[groupId] as string[];
                            if (selected) {
                              handleOptionChange(
                                groupId, 
                                current.filter(id => id !== option.id)
                              );
                            } else {
                              handleOptionChange(groupId, [...current, option.id]);
                            }
                          }
                        }}
                      >
                        {option.name}
                        {option.priceDelta > 0 && ` (+${option.priceDelta.toLocaleString()}원)`}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="quantity-control">
        <h3>수량</h3>
        <div className="counter">
          <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>
      </div>
      
      <div className="total-price">
        <h3>총 가격</h3>
        <p>{totalPrice.toLocaleString()}원</p>
      </div>
      
      <button
        className="add-to-cart-button"
        disabled={!addToCartEnabled}
        onClick={addToCart}
      >
        장바구니에 추가
      </button>
    </div>
  );
};

export default MenuDetailPage;