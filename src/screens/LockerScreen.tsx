

import React from 'react';
import DoodleButton from '../components/ui/DoodleButton';
import { useAuth } from '../hooks/useAuth';
import { supabaseService, SHOP_ITEMS } from '../services/supabaseService';
import { Skin, Accessory } from '../types';

interface LockerScreenProps {
  onBack: () => void;
}

const LockerScreen: React.FC<LockerScreenProps> = ({ onBack }) => {
  const { user, updateUser } = useAuth();
  if (!user) return null;

  const handleEquip = (itemId: Skin | Accessory, type: 'skin' | 'accessory') => {
    const updatedUser = supabaseService.equipItem(user.name, itemId, type);
    updateUser(updatedUser);
  };
  
  const renderItemSelection = (
      title: string, 
      itemIds: (Skin | Accessory)[],
      equippedId: Skin | Accessory | Accessory[],
      type: 'skin' | 'accessory'
    ) => (
    <div className="w-full">
        <h3 className="text-3xl font-bold text-[#0048ab] mb-2" style={{ fontFamily: "'Kalam', cursive" }}>{title}</h3>
        <div className="flex flex-col space-y-2">
            {itemIds.map(id => {
                const item = SHOP_ITEMS.find(i => i.id === id);
                if (!item) return null;
                // FIX: Cast `id` to `Accessory` to resolve type mismatch with `equippedId` array.
                const isEquipped = Array.isArray(equippedId) ? equippedId.includes(id as Accessory) : equippedId === id;
                return (
                    <div key={id} className="flex items-center justify-between p-2 border-2 border-dashed border-[#0048ab] rounded-lg">
                        <span className="text-xl font-bold text-gray-800">{item.name}</span>
                        <button onClick={() => handleEquip(id, type)}
                            className={`text-lg font-bold py-1 px-4 border-2 rounded-lg transition-colors ${isEquipped ? 'bg-green-500 text-white' : 'border-[#0048ab] text-[#0048ab]'}`}
                        >
                            {isEquipped && type === 'accessory' ? 'Bỏ trang bị' : 'Trang bị'}
                        </button>
                    </div>
                )
            })}
        </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent p-8">
      <h1 className="text-6xl font-bold text-[#0048ab] mb-8" style={{ fontFamily: "'Kalam', cursive" }}>
        Tủ Đồ
      </h1>
      <div className="w-full max-w-md space-y-6">
        {renderItemSelection('Skins', user.ownedSkins, user.equippedSkin, 'skin')}
        {renderItemSelection('Accessories', user.ownedAccessories, user.equippedAccessories, 'accessory')}
      </div>
      <div className="mt-12">
        <DoodleButton onClick={onBack}>Trở về</DoodleButton>
      </div>
    </div>
  );
};

export default LockerScreen;
