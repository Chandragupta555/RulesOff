import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserContextType, HostelName } from '../types/user';

const INITIAL_USER: UserProfile = {
  name: '',
  email: '',
  hostel: '',
  roomNumber: '',
  isAwake: true,
  deliveryOptIn: true,
  reliabilityScore: 100,
  isVerified: false,
  hasCompletedSetup: false,
};

const LOCAL_STORAGE_KEY = 'rulesoff_user_profile_v1';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const validatePecEmail = (email: string): boolean => {
  if (!email) return false;
  // PEC email pattern: name + "bt" + 2-digit year + branch + "@pec.edu.in"
  // Example: john.bt21ece@pec.edu.in or rahul_sharma.bt22cse@pec.edu.in
  const pecRegex = /^[a-zA-Z0-9._-]+bt\d{2}[a-zA-Z]+@pec\.edu\.in$/i;
  return pecRegex.test(email.trim());
};

export const parseNameFromPecEmail = (email: string): string => {
  if (!email) return '';
  const cleanEmail = email.trim().toLowerCase();
  // Match prefix before "btYYbranch@pec.edu.in"
  const match = cleanEmail.match(/^([a-zA-Z0-9._-]+)bt\d{2}[a-zA-Z]+@pec\.edu\.in$/);
  if (match && match[1]) {
    const rawName = match[1];
    // Replace dots and underscores with spaces
    const parts = rawName.replace(/[._]/g, ' ').split(' ').filter(Boolean);
    // Capitalize each part
    return parts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  // Fallback if not matching exact PEC regex but has @pec
  const atIndex = cleanEmail.indexOf('@');
  if (atIndex > 0) {
    const prefix = cleanEmail.substring(0, atIndex);
    return prefix
      .replace(/bt\d{2}[a-zA-Z]+$/i, '')
      .replace(/[._]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  return '';
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to read user profile from localStorage', e);
    }
    return INITIAL_USER;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user profile to localStorage', e);
    }
  }, [user]);

  const setVerifiedEmail = (email: string, parsedName: string) => {
    setUser((prev) => ({
      ...prev,
      email: email.trim().toLowerCase(),
      name: parsedName.trim() || parseNameFromPecEmail(email),
      isVerified: true,
    }));
  };

  const setHostelAndRoom = (hostel: HostelName, roomNumber: string) => {
    setUser((prev) => ({
      ...prev,
      hostel,
      roomNumber: roomNumber.trim(),
      hasCompletedSetup: true,
    }));
  };

  const toggleAwakeStatus = () => {
    setUser((prev) => ({
      ...prev,
      isAwake: !prev.isAwake,
    }));
  };

  const toggleDeliveryOptIn = () => {
    setUser((prev) => ({
      ...prev,
      deliveryOptIn: !prev.deliveryOptIn,
    }));
  };

  const resetUserProfile = () => {
    setUser(INITIAL_USER);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setVerifiedEmail,
        setHostelAndRoom,
        toggleAwakeStatus,
        toggleDeliveryOptIn,
        resetUserProfile,
        parseNameFromPecEmail,
        validatePecEmail,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
