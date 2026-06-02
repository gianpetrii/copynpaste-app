'use client';

import { GoogleAuthProvider, signInWithCredential, type User } from 'firebase/auth';
import { auth } from './firebase';

export async function signInWithGoogleNative(): Promise<User> {
  const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
  
  const result = await FirebaseAuthentication.signInWithGoogle();
  
  if (!result.credential?.idToken) {
    throw new Error('No se obtuvo el token de Google');
  }

  const credential = GoogleAuthProvider.credential(result.credential.idToken);
  const userCredential = await signInWithCredential(auth, credential);
  
  return userCredential.user;
}

export async function signOutNative(): Promise<void> {
  const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
  await FirebaseAuthentication.signOut();
}

export async function getCurrentUserNative(): Promise<User | null> {
  const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
  const result = await FirebaseAuthentication.getCurrentUser();
  
  if (!result.user) {
    return null;
  }
  
  return auth.currentUser;
}
