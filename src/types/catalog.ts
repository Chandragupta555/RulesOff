export type ProductCategory =
  | 'Chips & Wafers'
  | 'Namkeen & Bhujia'
  | 'Instant Food'
  | 'Biscuits & Cookies'
  | 'Chocolates & Sweets'
  | 'Cold Drinks & Juices'
  | 'Energy & Health Drinks'
  | 'Dairy & Milk-Based'
  | 'Ice Cream & Frozen Desserts'
  | 'Bread, Buns & Bakery';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  mrp: number; // Maximum Retail Price (INR)
  imageUrl: string;
  iconName: string;
  description: string;
  isUnverified?: boolean;
  isCustomApproved?: boolean;
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
  isUnverified?: boolean;
  unverifiedProductName?: string;
}

export interface ProductAggregate {
  product: Product;
  totalUnits: number;
  awakeRoomCount: number;
  availableListings: Listing[];
  lowestPrice: number;
  badge?: 'Almost Gone' | 'Last One' | 'Out of Stock';
}
