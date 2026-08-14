import { Product, Listing, ProductAggregate } from '../types/catalog';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'maggi',
    name: 'Maggi',
    category: 'instant',
    mrp: 14,
    iconName: 'ramen_dining',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBS8GbLxU4aPaAV9aMMhovsvP36DZYvoIs2GbUMsDPMkihA-ii6hfSkciOuu9Z-RBPTV6RlK32tcIBFy1rwOQWmNF_5T8IJ5UFhaBy-1UTfvebKxbs5zWG_KQE77qMNybxJEzn0BFZuh0q16a2eQTWLOyfi52XMn7ghhewc-RiAW4lrBWr101cwAMrDoFEQ8hDZIkV4yWzb5VT_sDq78ktIZMsieEblv7EOV8QxTQJSbu1rviFkWwmY',
    description: '2-Minute Masala Noodles. The ultimate late-night study fuel.',
  },
  {
    id: 'lays-chips',
    name: 'Lays Chips',
    category: 'snack',
    mrp: 20,
    iconName: 'lunch_dining',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDn0Wr9mwbp7VRiU5Ca6Ppx4KynoT4dgL19YZConvPUx4EFcRnbQmZFaerHw00mevTGict6VqWEHyDIhhtEOu_4eIdEQQ7XIFNxg3bF7opL6vD6hJzkjMSllHq-tfNuuTlD_15XSh_695HPnKHzIzOjfGQuNAx723FA08tf3bQJITHY-I3e56SXfAV37412rSO_O7yTcT8UYfeSdPnu2bhzecAKslwCb8P1sZUn2wK1FScAspaGycK8',
    description: 'Crispy Classic Salted & Magic Masala potato chips.',
  },
  {
    id: 'kurkure',
    name: 'Kurkure',
    category: 'snack',
    mrp: 20,
    iconName: 'local_fire_department',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDbIwvG8waF6ql68810MiFA3ZsgaTypSd5psfXN6qfgegN0p6uLuTVDO_EM-rRo5TkvcD1FTyRN8hg_jAuODADC2TvJahww9noX2JU_seMri2yWqozFB52iyDgtdSlZD65ztsbP0xLrJxy9-w3ytc4YqogMxLgrgRsB-0ErMBbnq5czQLeQXioL1Zt41qD-nnzkJfRZOuHx8kSTCePlH_BxPyfNeLafFRTqqDO9rbC2aQ7hU_3ZH7QA',
    description: 'Tedhe Medhe Masala Munch corn puffs.',
  },
  {
    id: 'coca-cola',
    name: 'Coca Cola',
    category: 'drink',
    mrp: 40,
    iconName: 'local_drink',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBhrtnySZmxlnJdN6JAsXgXrERxLTkUFaLuAbQb4Bvoal7EXwBar3rpDqyhHGHO1ja2-fSurn7cE95SsOG8X0mFNRXFYTnzYgYd3XvXFb8JlNKT-hxXywDLocxPXCqwwZKqKaWpaEmK6ggrd78QPDcO2KHrNqy0QW1iOcSnZjVin410f5Rmt5zEHNrHuaLNDUKbVmp3g3DIk0MyzZ-EvwerAt_rorUiUIzqIP9hqCKTkEalzr9RQ1_G',
    description: 'Ice cold 250ml Coca Cola can.',
  },
  {
    id: 'oats',
    name: 'Oats',
    category: 'instant',
    mrp: 30,
    iconName: 'set_meal',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBwKxRdou5JLdGAjXoO8zD80swKlAevmZ7a-cr5H09y5AID9fvhdylaXNE8TiGDPMLNZbP2t1FwQgqP0bAPJ_mFaD9JUUcLTix_52apmAjv6QnU5BN15B4uhLMF8INHyCK-5AnGo5HkibaTvJ-j_5Dckiehqy7x7tMe0eMihXVr_42hh5tZWaWdD1zQOWTuGy5B8lc3NhtpIJ0R9IO1CV6M_dao_Iemm-B1yp8igL9hchc14bMFQ6eJ',
    description: 'Saffola Masala Oats instant pouch.',
  },
];

// ─── Room Number Parsing ─────────────────────────────────────────────
// PEC hostel room numbers follow the format [Block Letter][Floor Digit(s)][Room Number]
// Examples: "A304" = Block A, Floor 3, Room 04; "B102" = Block B, Floor 1, Room 02
export interface ParsedRoom {
  block: string;  // e.g. "A", "B", "C"
  floor: number;  // e.g. 3
  room: number;   // e.g. 4 (the last 2 digits after floor)
  raw: string;    // original string
}

/**
 * Parse a PEC hostel room string into its block, floor, and room components.
 * Format: [A-Z][floor digit][room digits]
 *   "A304" -> { block: "A", floor: 3, room: 4 }
 *   "B102" -> { block: "B", floor: 1, room: 2 }
 *   "C215" -> { block: "C", floor: 2, room: 15 }
 */
export const parseRoomNumber = (roomStr: string): ParsedRoom => {
  if (!roomStr || roomStr.length < 3) {
    return { block: '', floor: 0, room: 0, raw: roomStr };
  }
  const match = roomStr.match(/^([A-Za-z])(\d)(\d{1,2})$/);
  if (match) {
    return {
      block: match[1].toUpperCase(),
      floor: parseInt(match[2], 10),
      room: parseInt(match[3], 10),
      raw: roomStr,
    };
  }
  // Fallback for unexpected formats
  return { block: '', floor: 0, room: 0, raw: roomStr };
};

// ─── Distance Helpers ────────────────────────────────────────────────
/**
 * Compute the floor distance between buyer and seller.
 *  - Same block: |buyer_floor - seller_floor|
 *  - Different block: (buyer_floor - 1) + (seller_floor - 1)
 *    i.e. walk down to ground (floor 1) then climb up in the other block.
 */
export const computeFloorDistance = (userRoom: string, sellerRoom: string): number => {
  const user = parseRoomNumber(userRoom);
  const seller = parseRoomNumber(sellerRoom);
  if (!user.block || !seller.block) return 0;

  if (user.block === seller.block) {
    return Math.abs(user.floor - seller.floor);
  }
  // Cross-block: down to ground + up in other block
  return (user.floor - 1) + (seller.floor - 1);
};

// ─── Proximity Label ─────────────────────────────────────────────────
export const getProximityLabel = (userRoom: string, sellerRoom: string): string => {
  const user = parseRoomNumber(userRoom);
  const seller = parseRoomNumber(sellerRoom);

  if (!user.block || !seller.block) return 'Same hostel';

  const sameBlock = user.block === seller.block;
  const dist = computeFloorDistance(userRoom, sellerRoom);

  if (sameBlock && dist === 0) return 'Same floor';
  if (sameBlock && dist === 1) return '1 floor away';
  if (sameBlock) return `${dist} floors away`;

  // Different block — show block letter + computed walking distance
  if (dist === 0) return `Block ${seller.block}, same floor`;
  return `Block ${seller.block}, ${dist} ${dist === 1 ? 'floor' : 'floors'} away`;
};

// ─── Proximity Sorting ───────────────────────────────────────────────
/**
 * Sort listings by proximity to the buyer's room.
 * Priority:
 *   a) SAME BLOCK as buyer — always ranks above any different-block room.
 *      Within same-block: sort by |buyer_floor - seller_floor|, then closest room number.
 *   b) DIFFERENT BLOCK — ranks below all same-block rooms.
 *      Within different-block: sort by (buyer_floor-1)+(seller_floor-1) ascending,
 *      then closest room number.
 */
export const sortListingsByProximity = (listings: Listing[], userRoom: string): Listing[] => {
  const userParsed = parseRoomNumber(userRoom);

  return [...listings].sort((a, b) => {
    const parsedA = parseRoomNumber(a.sellerRoom);
    const parsedB = parseRoomNumber(b.sellerRoom);

    const sameBlockA = userParsed.block === parsedA.block;
    const sameBlockB = userParsed.block === parsedB.block;

    // Primary: same block always ranks above different block
    if (sameBlockA && !sameBlockB) return -1;
    if (!sameBlockA && sameBlockB) return 1;

    // Secondary: sort by computed floor distance (ascending)
    const distA = computeFloorDistance(userRoom, a.sellerRoom);
    const distB = computeFloorDistance(userRoom, b.sellerRoom);
    if (distA !== distB) return distA - distB;

    // Tertiary: tiebreak by room number difference
    const roomDiffA = Math.abs(userParsed.room - parsedA.room);
    const roomDiffB = Math.abs(userParsed.room - parsedB.room);
    return roomDiffA - roomDiffB;
  });
};

// ─── Legacy alias (used by CatalogScreen header display) ─────────────
export const getFloorProximityLabel = getProximityLabel;

// ─── Mock Listings ───────────────────────────────────────────────────
// Room numbers now use PEC format: [Block][Floor][Room]
// User is in A304, so we spread listings across blocks A, B, C and multiple floors.
export const MOCK_LISTINGS: Listing[] = [
  // ── User's Own Listing (Room A304) ──
  {
    id: 'list-m-user',
    productId: 'maggi',
    hostel: 'Shivalik',
    sellerRoom: 'A304',
    sellerName: 'Rohit Sharma',
    quantity: 5,
    price: 12,
    isSellerAwake: true,
    deliveryOptIn: true,
  },
  // ── Maggi Listings (Total awake: 14 units across 6 rooms in Shivalik) ──
  {
    id: 'list-m1',
    productId: 'maggi',
    hostel: 'Shivalik',
    sellerRoom: 'A402',
    sellerName: 'Aman Deep',
    quantity: 3,
    price: 12,
    isSellerAwake: true,
    deliveryOptIn: true,
  },
  {
    id: 'list-m2',
    productId: 'maggi',
    hostel: 'Shivalik',
    sellerRoom: 'A307',  // Same block A, same floor 3 as buyer A304
    sellerName: 'Vikas Sharma',
    quantity: 4,
    price: 10, // Best price!
    isSellerAwake: true,
    deliveryOptIn: true,
    pendingRequestsCount: 1,
  },
  {
    id: 'list-m3',
    productId: 'maggi',
    hostel: 'Shivalik',
    sellerRoom: 'B512',
    sellerName: 'Rohan Gupta',
    quantity: 2,
    price: 12,
    isSellerAwake: true,
    deliveryOptIn: false,
  },
  {
    id: 'list-m4',
    productId: 'maggi',
    hostel: 'Shivalik',
    sellerRoom: 'C212',
    sellerName: 'Kartik Varma',
    quantity: 2,
    price: 14,
    isSellerAwake: true,
    deliveryOptIn: true,
  },
  {
    id: 'list-m5',
    productId: 'maggi',
    hostel: 'Shivalik',
    sellerRoom: 'B108',
    sellerName: 'Arjun Mehta',
    quantity: 2,
    price: 12,
    isSellerAwake: true,
    deliveryOptIn: false,
  },
  {
    id: 'list-m6',
    productId: 'maggi',
    hostel: 'Shivalik',
    sellerRoom: 'A302',  // Same block A, same floor 3 as buyer A304
    sellerName: 'Sameer Sen',
    quantity: 1,
    price: 14,
    isSellerAwake: true,
    deliveryOptIn: true,
  },
  // Sleeping seller with Maggi (should not count in available totals)
  {
    id: 'list-m7',
    productId: 'maggi',
    hostel: 'Shivalik',
    sellerRoom: 'A205',
    sellerName: 'Siddharth R',
    quantity: 5,
    price: 12,
    isSellerAwake: false,
    deliveryOptIn: true,
  },

  // ── Lays Chips Listings (Total awake: 2 units across 1 room) ──
  {
    id: 'list-l1',
    productId: 'lays-chips',
    hostel: 'Shivalik',
    sellerRoom: 'A402',
    sellerName: 'Aman Deep',
    quantity: 2,
    price: 18,
    isSellerAwake: true,
    deliveryOptIn: true,
  },
  {
    id: 'list-l2',
    productId: 'lays-chips',
    hostel: 'Shivalik',
    sellerRoom: 'B110',
    sellerName: 'Nitin Kumar',
    quantity: 3,
    price: 20,
    isSellerAwake: false, // Sleeping
    deliveryOptIn: true,
  },

  // ── Kurkure Listings (Total awake: 8 units across 4 rooms) ──
  {
    id: 'list-k1',
    productId: 'kurkure',
    hostel: 'Shivalik',
    sellerRoom: 'A301',  // Same block, same floor as buyer
    sellerName: 'Vikas Sharma',
    quantity: 3,
    price: 18,
    isSellerAwake: true,
    deliveryOptIn: true,
  },
  {
    id: 'list-k2',
    productId: 'kurkure',
    hostel: 'Shivalik',
    sellerRoom: 'C212',
    sellerName: 'Kartik Varma',
    quantity: 2,
    price: 18,
    isSellerAwake: true,
    deliveryOptIn: true,
  },
  {
    id: 'list-k3',
    productId: 'kurkure',
    hostel: 'Shivalik',
    sellerRoom: 'B504',
    sellerName: 'Hardik Singh',
    quantity: 2,
    price: 20,
    isSellerAwake: true,
    deliveryOptIn: false,
  },
  {
    id: 'list-k4',
    productId: 'kurkure',
    hostel: 'Shivalik',
    sellerRoom: 'B108',
    sellerName: 'Arjun Mehta',
    quantity: 1,
    price: 18,
    isSellerAwake: true,
    deliveryOptIn: false,
  },

  // ── Coca Cola Listings (Total awake: 1 unit across 1 room) ──
  {
    id: 'list-c1',
    productId: 'coca-cola',
    hostel: 'Shivalik',
    sellerRoom: 'B512',
    sellerName: 'Rohan Gupta',
    quantity: 1,
    price: 35,
    isSellerAwake: true,
    deliveryOptIn: true,
  },

  // ── Oats Listings (Total awake: 0 units / Out of Stock) ──
  {
    id: 'list-o1',
    productId: 'oats',
    hostel: 'Shivalik',
    sellerRoom: 'A408',
    sellerName: 'Praveen K',
    quantity: 0,
    price: 30,
    isSellerAwake: true,
    deliveryOptIn: false,
  },
  {
    id: 'list-o2',
    productId: 'oats',
    hostel: 'Shivalik',
    sellerRoom: 'C202',
    sellerName: 'Manish P',
    quantity: 4,
    price: 28,
    isSellerAwake: false, // Sleeping
    deliveryOptIn: true,
  },
];

// Helper: Get listings dynamically projected for the user's active hostel
export const getListingsForHostel = (userHostel: string, productId?: string): Listing[] => {
  const targetHostel = userHostel || 'Shivalik';
  return MOCK_LISTINGS.map((l) => ({
    ...l,
    hostel: targetHostel,
  })).filter((l) => !productId || l.productId === productId);
};

// ─── Aggregation ─────────────────────────────────────────────────────
export const getProductAggregates = (userHostel: string): ProductAggregate[] => {
  const hostelListings = getListingsForHostel(userHostel);
  console.log(`[INSTRUMENTATION] getProductAggregates called for userHostel="${userHostel}" (${hostelListings.length} total listings projected)`);

  return MOCK_PRODUCTS.map((product) => {
    // Filter listings matching awake seller and quantity > 0
    const available = hostelListings.filter(
      (l) =>
        l.productId === product.id &&
        l.isSellerAwake &&
        l.quantity > 0
    );

    const totalUnits = available.reduce((acc, curr) => acc + curr.quantity, 0);
    const awakeRoomCount = new Set(available.map((l) => l.sellerRoom)).size;
    console.log(`[INSTRUMENTATION] Product "${product.name}": found ${available.length} available listings for hostel "${userHostel}", totalUnits=${totalUnits}`);

    // Calculate lowest price among available listings
    const prices = available.map((l) => l.price);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : product.mrp;

    let badge: 'Almost Gone' | 'Last One' | 'Out of Stock' | undefined = undefined;
    if (totalUnits === 0) {
      badge = 'Out of Stock';
    } else if (totalUnits === 1) {
      badge = 'Last One';
    } else if (totalUnits <= 2) {
      badge = 'Almost Gone';
    }

    return {
      product,
      totalUnits,
      awakeRoomCount,
      availableListings: available,
      lowestPrice,
      badge,
    };
  });
};

// ─── Weekly Sales Tracking ───────────────────────────────────────────
export interface WeeklySales {
  [productId: string]: number;
}

export const MOCK_WEEKLY_SALES: WeeklySales = {
  maggi: 12,
  'lays-chips': 8,
  kurkure: 5,
  'coca-cola': 3,
  oats: 0,
};

export const decrementListingQuantity = (listingId: string, qty: number): boolean => {
  const listing = MOCK_LISTINGS.find((l) => l.id === listingId);
  if (listing) {
    listing.quantity = Math.max(0, listing.quantity - qty);
    MOCK_WEEKLY_SALES[listing.productId] = (MOCK_WEEKLY_SALES[listing.productId] || 0) + qty;
    return true;
  }
  return false;
};

export const syncUserListingWithProfile = (userRoom: string, isAwake: boolean, deliveryOptIn: boolean) => {
  const targetRoom = userRoom || 'A304';
  const userListing = MOCK_LISTINGS.find((l) => l.sellerRoom === targetRoom);
  if (userListing) {
    userListing.isSellerAwake = isAwake;
    userListing.deliveryOptIn = deliveryOptIn;
  }
};

