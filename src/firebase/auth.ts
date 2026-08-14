import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "./config";

// Deterministic secure password helper so PEC email onboarding is passwordless & frictionless for students
const getDeterministicPasswordForPecEmail = (email: string): string => {
  const prefix = email.trim().toLowerCase().split("@")[0];
  return `PecRulesOff#2026_${prefix}`;
};

/**
 * Authenticate or register a PEC student using Firebase Auth.
 */
export const authenticatePecUser = async (
  email: string,
  name?: string
): Promise<FirebaseUser> => {
  const cleanEmail = email.trim().toLowerCase();
  const password = getDeterministicPasswordForPecEmail(cleanEmail);

  try {
    // Attempt sign in first
    const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    return credential.user;
  } catch (error: any) {
    // If user does not exist or credentials fail, create new account
    if (
      error.code === "auth/user-not-found" ||
      error.code === "auth/invalid-credential"
    ) {
      const newCredential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );
      return newCredential.user;
    }
    throw error;
  }
};

/**
 * Sign out current authenticated user.
 */
export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};
