export type HostelName = 'Shivalik' | 'Aravali' | 'Kurukshetra' | 'Himalaya' | 'Kalpana Chawala' | 'Vindhya';

export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  hostel: HostelName | '';
  roomNumber: string;
  isAwake: boolean;
  deliveryOptIn: boolean;
  reliabilityScore: number;
  isVerified: boolean;
  hasCompletedSetup: boolean;
  lastHostelChangeDate?: number; // Timestamp ms of last hostel change
}

export interface UserContextType {
  user: UserProfile;
  loading: boolean;
  signInWithGoogleAccount: () => Promise<UserProfile>;
  setVerifiedEmail: (email: string, parsedName: string) => Promise<void>;
  setHostelAndRoom: (hostel: HostelName, roomNumber: string) => Promise<void>;
  toggleAwakeStatus: () => Promise<void>;
  toggleDeliveryOptIn: () => Promise<void>;
  resetUserProfile: () => Promise<void>;
  parseNameFromPecEmail: (email: string) => string;
  validatePecEmail: (email: string) => boolean;
}
