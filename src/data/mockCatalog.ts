import { Product, Listing, ProductAggregate, ProductCategory } from '../types/catalog';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Instant Food',
  'Chips & Namkeen',
  'Biscuits & Cookies',
  'Chocolates & Sweets',
  'Cold Drinks & Juices',
  'Energy Drinks',
  'Dairy & Milk-based',
  'Ice Cream & Desserts',
];

export const MOCK_PRODUCTS: Product[] = [
  // ─── INSTANT FOOD ──────────────────────────────────────────
  {
    id: 'maggi',
    name: 'Maggi 2-Min Noodles',
    category: 'Instant Food',
    mrp: 14,
    iconName: 'ramen_dining',
    imageUrl:
      'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    description: '2-Minute Masala Noodles. The ultimate late-night study fuel.',
  },
  {
    id: 'cup-noodles',
    name: 'Nissin Cup Noodles',
    category: 'Instant Food',
    mrp: 50,
    iconName: 'soup_kitchen',
    imageUrl:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    description: 'Instant Spicy Garlic Seafood/Veg Cup Noodles.',
  },
  {
    id: 'yippee',
    name: 'Yippee Magic Masala',
    category: 'Instant Food',
    mrp: 15,
    iconName: 'ramen_dining',
    imageUrl:
      'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
    description: 'Sunfeast Yippee long non-sticky noodles.',
  },
  {
    id: 'oats',
    name: 'Saffola Masala Oats',
    category: 'Instant Food',
    mrp: 30,
    iconName: 'set_meal',
    imageUrl:
      'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80',
    description: 'Saffola Masala Oats instant savory pouch.',
  },

  // ─── CHIPS & NAMKEEN ──────────────────────────────────────────
  {
    id: 'lays-chips',
    name: 'Lays Chips (India)',
    category: 'Chips & Namkeen',
    mrp: 20,
    iconName: 'lunch_dining',
    imageUrl:
      'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    description: 'Magic Masala & Classic Salted potato chips.',
  },
  {
    id: 'kurkure',
    name: 'Kurkure Masala Munch',
    category: 'Chips & Namkeen',
    mrp: 20,
    iconName: 'local_fire_department',
    imageUrl:
      'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=800&q=80',
    description: 'Tedhe Medhe crunchy Masala Munch puffs.',
  },
  {
    id: 'bingo-mad-angles',
    name: 'Bingo Mad Angles',
    category: 'Chips & Namkeen',
    mrp: 20,
    iconName: 'category',
    imageUrl:
      'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?auto=format&fit=crop&w=800&q=80',
    description: 'Achaari Masti crunchy triangle corn chips.',
  },
  {
    id: 'haldirams-bhujia',
    name: 'Haldirams Aloo Bhujia',
    category: 'Chips & Namkeen',
    mrp: 35,
    iconName: 'grain',
    imageUrl:
      'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',
    description: 'Spicy classic Haldiram Aloo Bhujia namkeen.',
  },
  {
    id: 'doritos',
    name: 'Doritos Nacho Cheese',
    category: 'Chips & Namkeen',
    mrp: 30,
    iconName: 'details',
    imageUrl:
      'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=800&q=80',
    description: 'Bold cheesy tortilla corn chips.',
  },

  // ─── BISCUITS & COOKIES ──────────────────────────────────────────
  {
    id: 'parle-g',
    name: 'Parle-G Biscuits',
    category: 'Biscuits & Cookies',
    mrp: 10,
    iconName: 'cookie',
    imageUrl:
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Original iconic Glucose biscuits for chai time.',
  },
  {
    id: 'bourbon',
    name: 'Britannia Bourbon',
    category: 'Biscuits & Cookies',
    mrp: 25,
    iconName: 'cookie',
    imageUrl:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    description: 'Rich chocolate cream biscuits with sugar crystals.',
  },
  {
    id: 'oreo',
    name: 'Oreo Original',
    category: 'Biscuits & Cookies',
    mrp: 30,
    iconName: 'cookie',
    imageUrl:
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    description: 'Chocolate Sandwich Cookies with Vanilla Cream.',
  },
  {
    id: 'dark-fantasy',
    name: 'Dark Fantasy Choco Fills',
    category: 'Biscuits & Cookies',
    mrp: 40,
    iconName: 'cookie',
    imageUrl:
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    description: 'Sunfeast Dark Fantasy cookies filled with molten chocolate.',
  },

  // ─── CHOCOLATES & SWEETS ──────────────────────────────────────────
  {
    id: 'dairy-milk-silk',
    name: 'Cadbury Dairy Milk Silk',
    category: 'Chocolates & Sweets',
    mrp: 80,
    iconName: 'cake',
    imageUrl:
      'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra smooth and creamy milk chocolate bar.',
  },
  {
    id: 'kitkat',
    name: 'KitKat 4-Finger',
    category: 'Chocolates & Sweets',
    mrp: 30,
    iconName: 'cake',
    imageUrl:
      'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
    description: 'Crispy wafer fingers covered in smooth milk chocolate.',
  },
  {
    id: 'snickers',
    name: 'Snickers Peanut Bar',
    category: 'Chocolates & Sweets',
    mrp: 40,
    iconName: 'cake',
    imageUrl:
      'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=800&q=80',
    description: 'Hunger busting roasted peanut, caramel and nougat bar.',
  },
  {
    id: 'five-star',
    name: 'Cadbury 5 Star',
    category: 'Chocolates & Sweets',
    mrp: 20,
    iconName: 'cake',
    imageUrl:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    description: 'Chewy caramel and nougat chocolate bar.',
  },

  // ─── COLD DRINKS & JUICES ──────────────────────────────────────────
  {
    id: 'coca-cola',
    name: 'Coca Cola Can',
    category: 'Cold Drinks & Juices',
    mrp: 40,
    iconName: 'local_drink',
    imageUrl:
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    description: 'Ice cold 250ml Coca Cola carbonated drink.',
  },
  {
    id: 'thums-up',
    name: 'Thums Up Charged',
    category: 'Cold Drinks & Juices',
    mrp: 40,
    iconName: 'local_drink',
    imageUrl:
      'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80',
    description: 'Strong fizzy cola with taste of thunder.',
  },
  {
    id: 'frooti',
    name: 'Parle Frooti Mango',
    category: 'Cold Drinks & Juices',
    mrp: 20,
    iconName: 'local_drink',
    imageUrl:
      'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
    description: 'Fresh Mango juice drink pack.',
  },

  // ─── ENERGY DRINKS ──────────────────────────────────────────
  {
    id: 'red-bull',
    name: 'Red Bull Energy Drink',
    category: 'Energy Drinks',
    mrp: 125,
    iconName: 'bolt',
    imageUrl:
      'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=800&q=80',
    description: '250ml Energy Drink. Vitalizes body & mind for late night coding.',
  },
  {
    id: 'sting',
    name: 'Sting Energy Drink',
    category: 'Energy Drinks',
    mrp: 20,
    iconName: 'bolt',
    imageUrl:
      'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=800&q=80',
    description: 'High energy berry flavoured carbonated beverage.',
  },

  // ─── DAIRY & MILK-BASED ──────────────────────────────────────────
  {
    id: 'amul-chocolate-milk',
    name: 'Amul Kool Chocolate Milk',
    category: 'Dairy & Milk-based',
    mrp: 30,
    iconName: 'water_drop',
    imageUrl:
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    description: 'Delicious chilled Amul Kool Koko chocolate drink.',
  },
  {
    id: 'amul-lassi',
    name: 'Amul Rose Lassi',
    category: 'Dairy & Milk-based',
    mrp: 20,
    iconName: 'water_drop',
    imageUrl:
      'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80',
    description: 'Sweet refreshing Rose Lassi pouch.',
  },

  // ─── ICE CREAM & DESSERTS ──────────────────────────────────────────
  {
    id: 'amul-chocobar',
    name: 'Amul Chocobar Ice Cream',
    category: 'Ice Cream & Desserts',
    mrp: 25,
    iconName: 'icecream',
    imageUrl:
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    description: 'Vanilla ice cream bar coated in dark chocolate layer.',
  },
  {
    id: 'cornetto-butterscotch',
    name: 'Kwality Walls Cornetto',
    category: 'Ice Cream & Desserts',
    mrp: 40,
    iconName: 'icecream',
    imageUrl:
      'https://images.unsplash.com/photo-1557142046-c704a3adf364?auto=format&fit=crop&w=800&q=80',
    description: 'Crispy cone with butterscotch ice cream & chocolate tip.',
  },
];

// Helper compatibility exports for legacy mock context
export const decrementListingQuantity = (listingId: string, qty: number = 1) => {};
export const syncUserListingWithProfile = (roomNumber: string, isAwake: boolean, deliveryOptIn: boolean) => {};

// ─── Room Number Parsing ─────────────────────────────────────────────
export interface ParsedRoom {
  block: string;  // e.g. "A", "B", "C"
  floor: number;  // e.g. 1, 2, 3
  roomNum: number; // e.g. 4 for A304
}

export const parseRoomNumber = (roomStr: string): ParsedRoom => {
  if (!roomStr) return { block: '', floor: 0, roomNum: 0 };

  const clean = roomStr.trim().toUpperCase();

  // 1. Try multi-letter block prefix (e.g. NB304, OB102, MAIN201)
  const multiMatch = clean.match(/^([A-Z]{2,4})(\d{1,2})(\d{2})$/);
  if (multiMatch) {
    return {
      block: multiMatch[1],
      floor: parseInt(multiMatch[2], 10),
      roomNum: parseInt(multiMatch[3], 10),
    };
  }

  // 2. Try single-letter block prefix (e.g. A304, B102, C205)
  const singleMatch = clean.match(/^([A-Z])(\d{1,2})(\d{2})$/);
  if (singleMatch) {
    return {
      block: singleMatch[1],
      floor: parseInt(singleMatch[2], 10),
      roomNum: parseInt(singleMatch[3], 10),
    };
  }

  // 3. Fallback generic match
  const alphaMatch = clean.match(/^([A-Z]+)(\d+)/);
  if (alphaMatch) {
    const blk = alphaMatch[1];
    const rest = alphaMatch[2];
    const flr = rest.length >= 3 ? parseInt(rest.slice(0, -2), 10) : parseInt(rest.charAt(0) || '0', 10);
    const rm = rest.length >= 2 ? parseInt(rest.slice(-2), 10) : 0;
    return {
      block: blk,
      floor: isNaN(flr) ? 0 : flr,
      roomNum: isNaN(rm) ? 0 : rm,
    };
  }

  return { block: '', floor: 0, roomNum: 0 };
};

export const splitRoomString = (
  roomStr: string,
  hostelBlocks: string[] = ['A']
): { block: string; number: string } => {
  if (!roomStr) return { block: hostelBlocks[0] || 'A', number: '' };

  const parsed = parseRoomNumber(roomStr);
  if (parsed.block && parsed.floor !== 0) {
    const formattedNum = `${parsed.floor}${parsed.roomNum.toString().padStart(2, '0')}`;
    const matchedBlock = hostelBlocks.includes(parsed.block) ? parsed.block : hostelBlocks[0] || parsed.block;
    return { block: matchedBlock, number: formattedNum };
  }

  const match = roomStr.trim().toUpperCase().match(/^([A-Z]{1,4})(\d+)/);
  if (match) {
    const matchedBlock = hostelBlocks.includes(match[1]) ? match[1] : hostelBlocks[0] || match[1];
    return { block: matchedBlock, number: match[2] };
  }

  return { block: hostelBlocks[0] || 'A', number: roomStr.replace(/\D/g, '') };
};

export const computeFloorDistance = (room1: string, room2: string): number => {
  const user = parseRoomNumber(room1);
  const seller = parseRoomNumber(room2);

  if (!user.block || !seller.block) return 0;

  if (user.block === seller.block) {
    return Math.abs(user.floor - seller.floor);
  }
  return (user.floor - 1) + (seller.floor - 1);
};

export const getProximityLabel = (userRoom: string, sellerRoom: string): string => {
  const user = parseRoomNumber(userRoom);
  const seller = parseRoomNumber(sellerRoom);

  if (!user.block || !seller.block) return 'Same hostel';

  const sameBlock = user.block === seller.block;
  const dist = computeFloorDistance(userRoom, sellerRoom);

  if (sameBlock && dist === 0) return 'Same floor';
  if (sameBlock && dist === 1) return '1 floor away';
  if (sameBlock) return `${dist} floors away`;

  if (dist === 0) return `Block ${seller.block}, same floor`;
  return `Block ${seller.block}, ${dist} ${dist === 1 ? 'floor' : 'floors'} away`;
};

export const sortListingsByProximity = (listings: Listing[], userRoom: string): Listing[] => {
  const userParsed = parseRoomNumber(userRoom);

  return [...listings].sort((a, b) => {
    const aParsed = parseRoomNumber(a.sellerRoom);
    const bParsed = parseRoomNumber(b.sellerRoom);

    const aSameBlock = userParsed.block && aParsed.block === userParsed.block;
    const bSameBlock = userParsed.block && bParsed.block === userParsed.block;

    if (aSameBlock && !bSameBlock) return -1;
    if (!aSameBlock && bSameBlock) return 1;

    const aDist = computeFloorDistance(userRoom, a.sellerRoom);
    const bDist = computeFloorDistance(userRoom, b.sellerRoom);

    if (aDist !== bDist) {
      return aDist - bDist;
    }

    const aRoomDiff = Math.abs(userParsed.roomNum - aParsed.roomNum);
    const bRoomDiff = Math.abs(userParsed.roomNum - bParsed.roomNum);
    return aRoomDiff - bRoomDiff;
  });
};
