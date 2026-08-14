import React, { createContext, useContext, useState, useEffect } from 'react';
import { RequestItem, RequestStatus, RequestMethod } from '../types/request';
import { useUser } from './UserContext';
import { decrementListingQuantity } from '../data/mockCatalog';

const SCHEMA_VERSION_KEY = 'rulesoff_schema_v2';
const CURRENT_SCHEMA_VERSION = 'v2_simplified';

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
  cancelRequest: (requestId: string) => void;
  fulfillRequest: (requestId: string) => void;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

// Clean Initial Seeded Requests for testing (Incoming to user A304)
const INITIAL_SEEDED_REQUESTS: RequestItem[] = [
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
    createdAt: Date.now() - 5 * 60 * 1000,
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
    createdAt: Date.now() - 2 * 60 * 1000,
  },
];

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const userRoom = user.roomNumber || 'A304';
  const userName = user.name || 'Rohit Sharma';

  const [requests, setRequests] = useState<RequestItem[]>(() => {
    try {
      const version = localStorage.getItem(SCHEMA_VERSION_KEY);
      const saved = localStorage.getItem('rulesoff_requests');
      console.log('[INSTRUMENTATION] RequestContext: Schema version in localStorage:', version, 'Raw saved requests:', saved);

      if (version !== CURRENT_SCHEMA_VERSION) {
        console.warn(`[INSTRUMENTATION] RequestContext: Schema mismatch! Stored version "${version}" !== expected "${CURRENT_SCHEMA_VERSION}". Purging stale cache.`);
        localStorage.removeItem('rulesoff_requests');
        localStorage.setItem(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION);
        return INITIAL_SEEDED_REQUESTS;
      }

      if (saved) {
        const parsed = JSON.parse(saved);
        const isValid = Array.isArray(parsed) && parsed.every((r) => r.id && r.status);
        console.log('[INSTRUMENTATION] RequestContext: Requests schema validation result:', isValid ? 'VALID' : 'INVALID', `(${parsed?.length || 0} items)`);
        if (isValid) {
          return parsed;
        } else {
          console.error('[INSTRUMENTATION] RequestContext: Invalid request structure detected, returning seeded defaults.');
        }
      }
    } catch (e) {
      console.error('[INSTRUMENTATION] RequestContext: Failed to parse saved requests:', e);
    }
    return INITIAL_SEEDED_REQUESTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('rulesoff_requests', JSON.stringify(requests));
      console.log('[INSTRUMENTATION] RequestContext: Saved requests to localStorage:', requests.length, 'items');
    } catch (e) {
      console.error('[INSTRUMENTATION] RequestContext: Failed to save requests:', e);
    }
  }, [requests]);

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
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'declined' as RequestStatus } : r))
    );
  };

  const cancelRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const fulfillRequest = (requestId: string) => {
    setRequests((prev) => {
      const target = prev.find((r) => r.id === requestId);
      if (target && target.status !== 'fulfilled') {
        decrementListingQuantity(target.listingId, target.quantity);
        return prev.map((r) => (r.id === requestId ? { ...r, status: 'fulfilled' as RequestStatus } : r));
      }
      return prev;
    });
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        createRequest,
        acceptRequest,
        declineRequest,
        cancelRequest,
        fulfillRequest,
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
