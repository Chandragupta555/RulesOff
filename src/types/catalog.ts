export type ProductCategory =
  | 'Instant Food'
  | 'Chips & Namkeen'
  | 'Biscuits & Cookies'
  | 'Chocolates & Sweets'
  | 'Cold Drinks & Juices'
  | 'Energy Drinks'
  | 'Dairy & Milk-based'
  | 'Ice Cream & Desserts';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  mrp: number; // Maximum Retail Price (INR)
  imageUrl: string;
  iconName: string;
  description: string;
}

export interface Listing {
  id: string;
  sellerUid?: string;
  productId: string;
  hostel: string;
  sellerRoom: string;
  sellerName: string;
  quantity: number;
  price: number; // Seller price, capped <= mrp
  isSellerAwake: boolean;
  deliveryOptIn: boolean;
  deliveryFee?: number;
  pendingRequestsCount?: number;
}

export interface ProductAggregate {
  product: Product;
  totalUnits: number;
  awakeRoomCount: number;
  availableListings: Listing[];
  lowestPrice: number;
  badge?: 'Almost Gone' | 'Last One' | 'Out of Stock';
}
