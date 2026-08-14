export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'fulfilled';
export type RequestMethod = 'pickup' | 'delivery';

export interface RequestItem {
  id: string;
  buyerName: string;
  buyerRoom: string;
  listingId: string;
  sellerRoom: string;
  sellerName: string;
  productId: string;
  quantity: number;
  method: RequestMethod;
  price: number;       // Unit price
  deliveryFee: number; // 0 for pickup, e.g. 5 for delivery
  totalPrice: number;  // (price * quantity) + deliveryFee
  status: RequestStatus;
  createdAt: number;   // Timestamp (ms)
}
