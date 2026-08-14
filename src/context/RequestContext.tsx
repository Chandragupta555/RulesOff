import React, { createContext, useContext, useState, useEffect } from 'react';
import { RequestItem, RequestStatus, RequestMethod } from '../types/request';
import { useUser } from './UserContext';
import { MOCK_LISTINGS, sortListingsByProximity, decrementListingQuantity } from '../data/mockCatalog';

interface RequestContextType {
  requests: RequestItem[];
  createRequest: (params: {
    listingId: string;
    productId: string;
    quantity: number;
    method: RequestMethod;
    sellerRoom: string;
    sellerName: string;
    price: number;
    deliveryFee: number;
  }) => RequestItem;
  acceptRequest: (requestId: string) => void;
  declineRequest: (requestId: string) => void;
  fulfillRequest: (requestId: string) => void;
  fastForwardTimeout: (requestId: string) => void; // Testing helper to trigger timeout immediately
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

// Initial Seeded Requests (Incoming to user A304)
const SEEDED_REQUESTS: RequestItem[] = [
  {
    id: 'req-seed-1',
    buyerName: 'Rahul Verma',
    buyerRoom: 'A302',
    listingId: 'list-m-user',
    sellerRoom: 'A304',
    sellerName: 'Rohit Sharma',
    productId: 'maggi',
    quantity: 2,
    method: 'pickup',
    price: 12,
    deliveryFee: 0,
    totalPrice: 24,
    status: 'pending',
    createdAt: Date.now(),
    responseDeadline: Date.now() + 5 * 60 * 1000,
    rerouteChain: ['A304'],
  },
  {
    id: 'req-seed-2',
    buyerName: 'Vikram Singh',
    buyerRoom: 'B108',
    listingId: 'list-m-user',
    sellerRoom: 'A304',
    sellerName: 'Rohit Sharma',
    productId: 'maggi',
    quantity: 1,
    method: 'delivery',
    price: 12,
    deliveryFee: 5,
    totalPrice: 17,
    status: 'pending',
    createdAt: Date.now() - 60 * 1000, // 1 minute ago
    responseDeadline: Date.now() + 4 * 60 * 1000,
    rerouteChain: ['A304'],
  },
];

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const userRoom = user.roomNumber || 'A304';
  const userName = user.name || 'Rohit Sharma';

  const [requests, setRequests] = useState<RequestItem[]>(() => {
    const saved = localStorage.getItem('rulesoff_requests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved requests', e);
      }
    }
    return SEEDED_REQUESTS;
  });

  useEffect(() => {
    localStorage.setItem('rulesoff_requests', JSON.stringify(requests));
  }, [requests]);

  // Helper for Auto-Rerouting
  const performAutoReroute = (targetReq: RequestItem, currentRequests: RequestItem[]): RequestItem[] => {
    // Find candidate sellers from MOCK_LISTINGS
    // Exclude buyer's own room and seller rooms already in rerouteChain
    const candidateListings = MOCK_LISTINGS.filter(
      (l) =>
        l.productId === targetReq.productId &&
        l.isSellerAwake &&
        l.quantity >= targetReq.quantity &&
        l.sellerRoom !== targetReq.buyerRoom &&
        !targetReq.rerouteChain.includes(l.sellerRoom)
    );

    const sortedCandidates = sortListingsByProximity(candidateListings, targetReq.buyerRoom);

    if (sortedCandidates.length > 0) {
      const nextListing = sortedCandidates[0];
      const newReqId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

      const newRequest: RequestItem = {
        id: newReqId,
        buyerName: targetReq.buyerName,
        buyerRoom: targetReq.buyerRoom,
        listingId: nextListing.id,
        sellerRoom: nextListing.sellerRoom,
        sellerName: nextListing.sellerName,
        productId: targetReq.productId,
        quantity: targetReq.quantity,
        method: targetReq.method,
        price: nextListing.price,
        deliveryFee: targetReq.deliveryFee,
        totalPrice: nextListing.price * targetReq.quantity + targetReq.deliveryFee,
        status: 'pending',
        createdAt: Date.now(),
        responseDeadline: Date.now() + 5 * 60 * 1000,
        rerouteChain: [...targetReq.rerouteChain, nextListing.sellerRoom],
      };

      // Mark target request as auto-rerouted linking to new request
      const updatedOriginal: RequestItem = {
        ...targetReq,
        status: 'auto-rerouted',
        reroutedToId: newReqId,
      };

      return currentRequests.map((r) => (r.id === targetReq.id ? updatedOriginal : r)).concat(newRequest);
    } else {
      // Exhausted all options
      const exhaustedReq: RequestItem = {
        ...targetReq,
        status: 'expired',
        isExhausted: true,
      };
      return currentRequests.map((r) => (r.id === targetReq.id ? exhaustedReq : r));
    }
  };

  // Interval timer checking for expired pending requests every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRequests((prev) => {
        let hasChanges = false;
        let nextState = [...prev];

        for (const req of prev) {
          if (req.status === 'pending' && now >= req.responseDeadline) {
            hasChanges = true;
            nextState = performAutoReroute(req, nextState);
          }
        }

        return hasChanges ? nextState : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const createRequest = ({
    listingId,
    productId,
    quantity,
    method,
    sellerRoom,
    sellerName,
    price,
    deliveryFee,
  }: {
    listingId: string;
    productId: string;
    quantity: number;
    method: RequestMethod;
    sellerRoom: string;
    sellerName: string;
    price: number;
    deliveryFee: number;
  }): RequestItem => {
    const newReqId = `req-${Date.now()}`;
    const newReq: RequestItem = {
      id: newReqId,
      buyerName: userName,
      buyerRoom: userRoom,
      listingId,
      sellerRoom,
      sellerName,
      productId,
      quantity,
      method,
      price,
      deliveryFee,
      totalPrice: price * quantity + deliveryFee,
      status: 'pending',
      createdAt: Date.now(),
      responseDeadline: Date.now() + 5 * 60 * 1000,
      rerouteChain: [sellerRoom],
    };

    setRequests((prev) => [newReq, ...prev]);
    return newReq;
  };

  const acceptRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'accepted' as RequestStatus } : r))
    );
  };

  const declineRequest = (requestId: string) => {
    setRequests((prev) => {
      const target = prev.find((r) => r.id === requestId);
      if (!target) return prev;
      // Perform auto-reroute immediately on decline
      return performAutoReroute(target, prev);
    });
  };

  const fulfillRequest = (requestId: string) => {
    setRequests((prev) => {
      const target = prev.find((r) => r.id === requestId);
      if (target) {
        decrementListingQuantity(target.listingId, target.quantity);
        return prev.map((r) => (r.id === requestId ? { ...r, status: 'fulfilled' as RequestStatus } : r));
      }
      return prev;
    });
  };

  const fastForwardTimeout = (requestId: string) => {
    setRequests((prev) => {
      const target = prev.find((r) => r.id === requestId);
      if (!target) return prev;
      return performAutoReroute(target, prev);
    });
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        createRequest,
        acceptRequest,
        declineRequest,
        fulfillRequest,
        fastForwardTimeout,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = (): RequestContextType => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};
