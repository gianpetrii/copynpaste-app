import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './firebase';
import { logger } from '@/lib/utils/logger';

// Proveedor de autenticación de Google
const googleProvider = new GoogleAuthProvider();

// Función para registrar un nuevo usuario
export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    logger.authError('Error al registrar usuario', error);
    throw error;
  }
};

// Función para iniciar sesión
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    logger.authError('Error al iniciar sesión', error);
    throw error;
  }
};

// Función para iniciar sesión con Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    logger.authError('Error al iniciar sesión con Google', error);
    throw error;
  }
};

// Función para cerrar sesión
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return true;
  } catch (error) {
    logger.authError('Error al cerrar sesión', error);
    throw error;
  }
};

// Función para observar cambios en el estado de autenticación
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Función para recuperar contraseña
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    logger.authError('Error al enviar email de recuperación', error);
    throw error;
  }
}; 