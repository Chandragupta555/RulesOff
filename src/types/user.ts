export type HostelName = 'Shivalik' | 'Aravali' | 'Kurukshetra' | 'Himalaya' | 'Kalpana Chawala' | 'Vindhya';

export const HOSTEL_BLOCKS: Record<HostelName, string[]> = {
  'Shivalik': ['A', 'B', 'C'],
  'Aravali': ['A', 'B'],
  'Himalaya': ['NB', 'OB'],
  'Kurukshetra': ['Main'],
  'Vindhya': ['Main'],
  'Kalpana Chawala': ['Main'],
};

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
  lastHostelChangeDate?: number; // Timestamp ms of last hostel change (only set on subsequent hostel changes, NOT onboarding)
}

export interface UserContextType {
  user: UserProfile;
  loading: boolean;
  dynamicAdmins: string[];
  isOwnerAdmin: boolean;
  isAdmin: boolean;
  signInWithGoogleAccount: () => Promise<UserProfile>;
  setVerifiedEmail: (email: string, parsedName: string) => Promise<void>;
  setHostelAndRoom: (hostel: HostelName, roomNumber: string, isActualHostelChange?: boolean) => Promise<void>;
  toggleAwakeStatus: () => Promise<void>;
  toggleDeliveryOptIn: () => Promise<void>;
  resetUserProfile: () => Promise<void>;
  parseNameFromPecEmail: (email: string) => string;
  validatePecEmail: (email: string) => boolean;
}
