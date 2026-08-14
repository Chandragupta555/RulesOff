export type RequestStatus = 
  | 'pending' 
  | 'accepted' 
  | 'declined' 
  | 'expired' 
  | 'fulfilled' 
  | 'auto-rerouted';

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
  createdAt: number;       // Timestamp (ms)
  responseDeadline: number; // Timestamp (ms) - createdAt + 5 minutes
  reroutedToId?: string;   // ID of the new request if auto-rerouted
  rerouteChain: string[];  // Array of sellerRoom strings already attempted in this request chain
  isExhausted?: boolean;   // True if all available seller rooms have been tried and failed
}
