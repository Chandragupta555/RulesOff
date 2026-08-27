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

export interface ProductVariant {
  size: string;
  mrp: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  variants: ProductVariant[];
  mrp?: number; // Legacy convenience getter / fallback
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
  variantSize?: string;
  mrp?: number;
  hostel: string;
  sellerRoom: string;
  sellerName: string;
  quantity: number;
  price: number; // Seller price, capped <= variant mrp
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
