import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useUser } from './UserContext';
import { subscribeToIncomingRequests, FirestoreRequest } from '../firebase/requests';
import { playNotificationChime } from '../utils/audio';

interface NotificationContextType {
  permission: NotificationPermission;
  isExplainerOpen: boolean;
  requestNotificationPermission: () => Promise<void>;
  dismissExplainer: () => void;
  triggerTestNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    return 'Notification' in window ? Notification.permission : 'denied';
  });
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const isInitialLoadRef = useRef(true);
  const knownRequestIdsRef = useRef<Set<string>>(new Set());

  // 1. Register Service Worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[SW] Service Worker registered scope:', reg.scope);
          setSwRegistration(reg);
        })
        .catch((err) => {
          console.error('[SW] Service Worker registration failed:', err);
        });
    }
  }, []);

  // 2. Prompt for Notification explainer on first login/catalog load if default
  useEffect(() => {
    if (user.uid && user.hasCompletedSetup && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const hasDismissed = sessionStorage.getItem('rulesoff_notif_explainer_dismissed');
        if (!hasDismissed) {
          setIsExplainerOpen(true);
        }
      } else {
        setPermission(Notification.permission);
      }
    }
  }, [user.uid, user.hasCompletedSetup]);

  // Request browser Notification Permission
  const requestNotificationPermission = async () => {
    setIsExplainerOpen(false);
    if (!('Notification' in window)) return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        // Play audio & vibration feedback
        playNotificationChime();
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

        // Send confirmation test notification
        if (swRegistration && 'showNotification' in swRegistration) {
          await swRegistration.showNotification('Notifications Enabled! 🔥', {
            body: 'You will now get instant sound & vibration alerts for incoming craving requests.',
            icon: '/icons/logo-192.png',
            badge: '/icons/logo-192.png',
            vibrate: [200, 100, 200],
            tag: 'rulesoff-welcome',
            data: { url: '/requests' },
          } as any);
        }
      }
    } catch (err) {
      console.error('[Notifications] Permission request error:', err);
    }
  };

  const dismissExplainer = () => {
    setIsExplainerOpen(false);
    sessionStorage.setItem('rulesoff_notif_explainer_dismissed', 'true');
  };

  const triggerTestNotification = async () => {
    playNotificationChime();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

    if (swRegistration && 'showNotification' in swRegistration) {
      await swRegistration.showNotification('Test Request Alert! 🔥', {
        body: 'Shivam Sharma (Room A304) wants 2x Maggi 2-Min Noodles from your room.',
        icon: '/icons/logo-192.png',
        badge: '/icons/logo-192.png',
        vibrate: [200, 100, 200],
        tag: 'test-request',
        data: { url: '/requests' },
      } as any);
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test Request Alert! 🔥', {
        body: 'Shivam Sharma (Room A304) wants 2x Maggi 2-Min Noodles from your room.',
        icon: '/icons/logo-192.png',
      });
    }
  };

  // 3. Real-Time Snapshot Listener for Incoming Requests
  useEffect(() => {
    if (!user.uid) return;

    const unsubscribe = subscribeToIncomingRequests(user.uid, (requests) => {
      // Filter pending requests
      const pendingRequests = requests.filter((r) => r.status === 'pending');

      if (isInitialLoadRef.current) {
        // Record existing historical pending request IDs on initial boot (do NOT trigger notifications for past items)
        pendingRequests.forEach((r) => {
          if (r.id) knownRequestIdsRef.current.add(r.id);
        });
        isInitialLoadRef.current = false;
        return;
      }

      // Check for any NEW incoming pending request that wasn't in known set
      let newArrival: FirestoreRequest | null = null;
      for (const req of pendingRequests) {
        if (req.id && !knownRequestIdsRef.current.has(req.id)) {
          knownRequestIdsRef.current.add(req.id);
          newArrival = req; // Found new arrival
          break;
        }
      }

      if (newArrival) {
        // Play Audio Cue
        playNotificationChime();

        // Trigger Vibration
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }

        // Trigger OS Web Notification
        const title = 'New Request! 🔥';
        const body = `${newArrival.buyerName} (Room ${newArrival.buyerRoom}) wants ${newArrival.quantity}x ${newArrival.productName} from your room.`;

        if (swRegistration && 'showNotification' in swRegistration) {
          swRegistration.showNotification(title, {
            body,
            icon: '/icons/logo-192.png',
            badge: '/icons/logo-192.png',
            vibrate: [200, 100, 200],
            tag: `request-${newArrival.id}`,
            data: { url: '/requests' },
          } as any);
        } else if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/icons/logo-192.png',
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user.uid, swRegistration]);

  return (
    <NotificationContext.Provider
      value={{
        permission,
        isExplainerOpen,
        requestNotificationPermission,
        dismissExplainer,
        triggerTestNotification,
      }}
    >
      {children}

      {/* IN-APP NOTIFICATION EXPLAINER MODAL */}
      {isExplainerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121414] border border-primary-container/40 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 text-center animate-fade-in shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-primary-container/15 border border-primary-container/40 flex items-center justify-center mx-auto text-primary-container">
              <span className="material-symbols-outlined text-3xl">notifications_active</span>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-white uppercase tracking-tight">
                Turn On Notifications 🔔
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mt-1.5">
                Get instant sound & vibration alerts so you never miss a craving request from fellow hostelers!
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mt-2">
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="w-full py-3.5 rounded-full font-extrabold text-xs uppercase tracking-wider text-black bg-primary-container neon-glow active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">notifications</span>
                <span>Enable Notifications</span>
              </button>

              <button
                type="button"
                onClick={dismissExplainer}
                className="w-full py-2.5 rounded-full font-bold text-xs uppercase tracking-wider text-on-surface-variant hover:text-white transition-all cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
