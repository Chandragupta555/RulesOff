import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "./config";

/**
 * Sign in user using Google Auth provider restricted to PEC domain.
 */
export const signInWithGoogle = async (): Promise<{ user: FirebaseUser; isPecEmail: boolean }> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    hd: "pec.edu.in",
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
  const isPecEmail = email.endsWith("@pec.edu.in");

  if (!isPecEmail) {
    console.warn("[Firebase Auth] Non-PEC email attempted sign in:", email);
    await signOut(auth);
  }

  return { user, isPecEmail };
};

/**
 * Handle redirect result if signInWithRedirect was triggered on mobile.
 */
export const handleRedirectAuthResult = async (): Promise<{ user: FirebaseUser; isPecEmail: boolean } | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const email = (result.user.email || "").trim().toLowerCase();
      const isPecEmail = email.endsWith("@pec.edu.in");
      if (!isPecEmail) {
        await signOut(auth);
      }
      return { user: result.user, isPecEmail };
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
