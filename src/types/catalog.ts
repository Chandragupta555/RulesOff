export interface Product {
  id: string;
  name: string;
  category: 'snack' | 'drink' | 'instant';
  mrp: number; // Maximum Retail Price (INR)
  imageUrl: string;
  iconName: string;
  description: string;
}

export interface Listing {
  id: string;
  productId: string;
  hostel: string;
  sellerRoom: string;
  sellerName: string;
  quantity: number;
  price: number; // Seller price, capped <= mrp
  isSellerAwake: boolean;
  deliveryOptIn: boolean;
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
