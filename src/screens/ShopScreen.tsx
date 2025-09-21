
import React, { useState } from 'react';
import DoodleButton from '../components/ui/DoodleButton';
import { useAuth } from '../hooks/useAuth';
import { supabaseService, SHOP_ITEMS } from '../services/supabaseService';
import { ShopCategory, ShopItem, Skin, Accessory, PowerUpType } from '../types';

interface ShopScreenProps {
  onBack: () => void;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ onBack }) => {
  const { user, updateUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('Skins');

  if (!user) return null;

  const handlePurchase = (item: ShopItem) => {
    try {
        const updatedUser = supabaseService.purchaseItem(user.name, item.id as Skin | Accessory | PowerUpType);
        updateUser(updatedUser);
    } catch (error) {
        alert(error);
    }
  };

  const isItemOwned = (item: ShopItem) => {
    if (item.category === 'Skins') return user.ownedSkins.includes(item.id as Skin);
    if (item.category === 'Accessories') return user.ownedAccessories.includes(item.id as Accessory);
    return false;
  };
  
  const categoryTabs: ShopCategory[] = ['Skins', 'Accessories']; // 'Power-ups' can be added later

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent p-8 text-center">
      <h1 className="text-6xl md:text-7xl font-bold text-[#0048ab] mb-4" style={{ fontFamily: "'Kalam', cursive" }}>
        Cửa Hàng Kỹ Thuật
      </h1>
      <p className="text-3xl font-bold text-yellow-500 mb-6" style={{ fontFamily: "'Kalam', cursive" }}>
        Coins: {user.coins}
      </p>

      <div className="flex space-x-4 mb-6">
        {categoryTabs.map(cat => (
             <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`text-2xl font-bold py-2 px-6 border-4 rounded-lg transition-colors ${activeCategory === cat ? 'bg-[#0048ab] text-white' : 'border-[#0048ab] text-[#0048ab]'}`}
                style={{ fontFamily: "'Kalam', cursive" }}
              >
                 {cat}
             </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
        {SHOP_ITEMS.filter(item => item.category === activeCategory).map(item => (
          <div key={item.id} className="p-4 border-4 border-dashed border-[#0048ab] rounded-lg flex flex-col items-center text-center">
            <h3 className="text-3xl font-bold" style={{ fontFamily: "'Kalam', cursive" }}>{item.name}</h3>
            <p className="text-lg text-gray-700 my-2 h-12" style={{ fontFamily: "'Kalam', cursive" }}>{item.description}</p>
            {isItemOwned(item) ? (
                <p className="text-2xl font-bold text-green-600 mt-auto" style={{ fontFamily: "'Kalam', cursive" }}>Đã sở hữu</p>
            ) : (
                <DoodleButton onClick={() => handlePurchase(item)} disabled={user.coins < item.price} className="text-2xl py-2 px-6 mt-auto">
                    Mua ({item.price} Coins)
                </DoodleButton>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10">
        <DoodleButton onClick={onBack}>Trở về</DoodleButton>
      </div>
    </div>
  );
};

export default ShopScreen;
