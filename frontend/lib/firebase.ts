import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type Auth,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!authInstance) authInstance = getAuth(firebaseApp);
  return authInstance;
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function firebaseSignIn(email: string, password: string, rememberMe: boolean): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured");
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
}

export async function firebaseSignUp(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured");
  await setPersistence(auth, browserLocalPersistence);
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (name.trim()) {
    await updateProfile(result.user, { displayName: name.trim() });
  }
  return result.user;
}

export async function firebaseGoogleSignIn(): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured");
  await setPersistence(auth, browserLocalPersistence);
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function firebaseResetPassword(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured");
  await sendPasswordResetEmail(auth, email.trim());
}

export async function firebaseLogout(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}

export function firebaseAuthErrorMessage(err: unknown): string {
  const code = typeof err === "object" && err && "code" in err ? String((err as { code: string }).code) : "";
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists";
    case "auth/invalid-email":
      return "Enter a valid email address";
    case "auth/weak-password":
      return "Password must be at least 6 characters";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again";
    case "auth/unauthorized-domain":
      return "This domain is not allowed in Firebase. Add localhost in Authentication → Settings → Authorized domains";
    case "auth/popup-blocked":
      return "The Google sign-in popup was blocked. Allow popups for this site and try again";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again";
    default:
      return err instanceof Error ? err.message : "Authentication failed";
  }
}
