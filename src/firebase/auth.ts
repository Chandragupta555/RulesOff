import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "./config";

import { isOwnerAdminEmail } from "../config/admin";
import { checkIsAdminEmailAsync } from "./adminManagement";

/**
 * Check if an email is authorized to sign in (PEC student, Owner Admin, or Dynamic Admin).
 */
export const isAllowedSignInEmail = async (email: string): Promise<boolean> => {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) return false;
  if (cleanEmail.endsWith("@pec.edu.in")) return true;
  if (isOwnerAdminEmail(cleanEmail)) return true;
  return await checkIsAdminEmailAsync(cleanEmail);
};

/**
 * Sign in user using Google Auth provider (supports PEC students, Owner Admin, and Dynamic Admins).
 */
export const signInWithGoogle = async (): Promise<{ user: FirebaseUser; isAllowed: boolean }> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account"
  });

  let user: FirebaseUser;

  try {
    const result = await signInWithPopup(auth, provider);
    user = result.user;
  } catch (error: any) {
    console.warn("[Firebase Auth] signInWithPopup failed or blocked, attempting fallback:", error.code);
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      await signInWithRedirect(auth, provider);
      // Flow redirects to Google page
      throw new Error("Redirecting to Google sign in...");
    }
    throw error;
  }

  const email = (user.email || "").trim().toLowerCase();
  const isAllowed = await isAllowedSignInEmail(email);

  if (!isAllowed) {
    console.warn("[Firebase Auth] Unauthorized non-PEC and non-admin email attempted sign in:", email);
    await signOut(auth);
  }

  return { user, isAllowed };
};

/**
 * Handle redirect result if signInWithRedirect was triggered on mobile.
 */
export const handleRedirectAuthResult = async (): Promise<{ user: FirebaseUser; isAllowed: boolean } | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const email = (result.user.email || "").trim().toLowerCase();
      const isAllowed = await isAllowedSignInEmail(email);
      if (!isAllowed) {
        await signOut(auth);
      }
      return { user: result.user, isAllowed };
    }
  } catch (error) {
    console.error("[Firebase Auth] Redirect result error:", error);
  }
  return null;
};

/**
 * Sign out current authenticated user.
 */
export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};
