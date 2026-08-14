export type HostelName = 'Shivalik' | 'Aravali' | 'Kurukshetra' | 'Himalaya' | 'Kalpana Chawala' | 'Vindhya';

export interface UserProfile {
  name: string;
  email: string;
  hostel: HostelName | '';
  roomNumber: string;
  isAwake: boolean;
  deliveryOptIn: boolean;
  reliabilityScore: number;
  isVerified: boolean;
  hasCompletedSetup: boolean;
}

export interface UserContextType {
  user: UserProfile;
  setVerifiedEmail: (email: string, parsedName: string) => void;
  setHostelAndRoom: (hostel: HostelName, roomNumber: string) => void;
  toggleAwakeStatus: () => void;
  toggleDeliveryOptIn: () => void;
  resetUserProfile: () => void;
  parseNameFromPecEmail: (email: string) => string;
  validatePecEmail: (email: string) => boolean;
}
