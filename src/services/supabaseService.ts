
import { User, LeaderboardEntry, ShopItem, Skin, Accessory, PowerUpType } from '../types';
import { LEADERBOARD_SIZE } from '../constants';

const DB_USER_KEY = 'bat_trung_user';
const DB_LEADERBOARD_KEY = 'bat_trung_leaderboard';

// --- SHOP DEFINITION ---
export const SHOP_ITEMS: ShopItem[] = [
    // Skins
    { id: 'robot', name: 'Robot', price: 0, category: 'Skins', description: 'The default schematic.' },
    { id: 'stickman', name: 'Stickman', price: 500, category: 'Skins', description: 'A lightweight, agile design.' },
    // Accessories
    { id: 'top_hat', name: 'Top Hat', price: 150, category: 'Accessories', description: 'For the distinguished engineer.' },
    { id: 'sunglasses', name: 'Sunglasses', price: 200, category: 'Accessories', description: 'Boosts operational coolness.' },
    // Power-ups (Example of purchasable items)
    // { id: EggType.MAGNET, name: 'Start with Magnet', price: 50, category: 'Power-ups', description: 'Begin your next run with a magnet.' },
];


// --- MOCK API ---

const getLeaderboard = (): LeaderboardEntry[] => {
    try {
        const data = localStorage.getItem(DB_LEADERBOARD_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
};

const updateLeaderboard = (name: string, score: number) => {
    const leaderboard = getLeaderboard();
    const newLeaderboard = [...leaderboard, { name, score }]
        .sort((a, b) => b.score - a.score)
        .slice(0, LEADERBOARD_SIZE);
    localStorage.setItem(DB_LEADERBOARD_KEY, JSON.stringify(newLeaderboard));
};


const getUser = (name: string): User | null => {
    try {
        const data = localStorage.getItem(`${DB_USER_KEY}_${name}`);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
};

const updateUser = (user: User): User => {
    localStorage.setItem(`${DB_USER_KEY}_${user.name}`, JSON.stringify(user));
    return user;
};

const loginOrRegister = (name: string): User => {
    const existingUser = getUser(name);
    if (existingUser) {
        return existingUser;
    }
    const isAdmin = name.toLowerCase() === 'admin';
    const newUser: User = {
        name,
        isAdmin,
        coins: isAdmin ? 99999 : 100,
        highScore: 0,
        ownedSkins: ['robot'],
        ownedAccessories: [],
        equippedSkin: 'robot',
        equippedAccessories: [],
    };
    if (isAdmin) {
        newUser.ownedSkins.push('stickman');
        newUser.ownedAccessories.push('top_hat', 'sunglasses');
    }
    return updateUser(newUser);
};

const saveUserProgress = (name: string, score: number, coinsEarned: number): User => {
    const user = getUser(name);
    if (!user) throw new Error("User not found");

    user.highScore = Math.max(user.highScore, score);
    user.coins += coinsEarned;
    updateLeaderboard(name, score);
    return updateUser(user);
};

const purchaseItem = (name: string, itemId: Skin | Accessory | PowerUpType): User => {
    const user = getUser(name);
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!user || !item || user.coins < item.price) throw new Error("Cannot complete purchase");

    user.coins -= item.price;
    if(item.category === 'Skins' && !user.ownedSkins.includes(item.id as Skin)) {
        user.ownedSkins.push(item.id as Skin);
    } else if (item.category === 'Accessories' && !user.ownedAccessories.includes(item.id as Accessory)) {
        user.ownedAccessories.push(item.id as Accessory);
    }
    // Handle power-ups later if needed
    return updateUser(user);
}

const equipItem = (name: string, itemId: Skin | Accessory, itemType: 'skin' | 'accessory'): User => {
    const user = getUser(name);
    if (!user) throw new Error("User not found");

    if (itemType === 'skin') {
        user.equippedSkin = itemId as Skin;
    } else {
        const accessory = itemId as Accessory;
        if(user.equippedAccessories.includes(accessory)) {
            // Unequip
            user.equippedAccessories = user.equippedAccessories.filter(a => a !== accessory);
        } else {
            // Equip
            user.equippedAccessories.push(accessory);
        }
    }
    return updateUser(user);
}

export const supabaseService = {
    loginOrRegister,
    getUser,
    updateUser,
    saveUserProgress,
    getLeaderboard,
    purchaseItem,
    equipItem,
};
