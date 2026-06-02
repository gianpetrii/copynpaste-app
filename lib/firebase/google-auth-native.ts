'use client';

import { GoogleAuthProvider, signInWithCredential, signInWithCustomToken, type User } from 'firebase/auth';
import { auth } from './firebase';
import { getWebUrl } from '@/lib/utils/api-url';
import { agentLog } from '@/lib/debug/agent-log';
import { getNativePlatform } from '@/lib/native/platform';
import { openSystemBrowser } from '@/lib/native/system-browser';

const AUTH_CALLBACK_PREFIX = 'copynpaste://auth/callback';
const AUTH_TIMEOUT_MS = 5 * 60 * 1000;

type PendingGoogleAuth = {
  resolve: (user: User) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
  browserFinishedListener?: { remove: () => Promise<void> };
};

let pendingGoogleAuth: PendingGoogleAuth | null = null;
let appUrlListenerRegistered = false;
let googleAuthCompleted = false;

function clearPendingGoogleAuth(error?: Error) {
  if (!pendingGoogleAuth) return;

  clearTimeout(pendingGoogleAuth.timeoutId);
  void pendingGoogleAuth.browserFinishedListener?.remove();
  pendingGoogleAuth = null;

  if (error) {
    agentLog({
      hypothesisId: 'C',
      location: 'google-auth-native:clearPending',
      message: 'Google auth flow cleared with error',
      data: { error: error.message },
    });
  }
}

async function finishGoogleAuth(user: User): Promise<void> {
  googleAuthCompleted = true;

  const { Browser } = await import('@capacitor/browser');
  await Browser.close().catch(() => {});

  if (pendingGoogleAuth) {
    const { resolve } = pendingGoogleAuth;
    clearPendingGoogleAuth();
    resolve(user);
  }

  agentLog({
    hypothesisId: 'D',
    location: 'google-auth-native:finish',
    message: 'Google sign-in completed',
    data: { uid: user.uid },
    runId: 'post-fix',
  });
}

async function signInFromDeepLinkTokens(
  idToken: string,
  accessToken: string | null
): Promise<User> {
  agentLog({
    hypothesisId: 'K',
    location: 'google-auth-native:signInFromTokens',
    message: 'Creating Google credential and signing in',
    data: {
      idTokenLength: idToken.length,
      hasAccessToken: !!accessToken,
    },
    runId: 'post-fix',
  });

  const credential = GoogleAuthProvider.credential(
    decodeURIComponent(idToken),
    accessToken ? decodeURIComponent(accessToken) : undefined
  );

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('signInWithCredential timeout (15s)')), 15000);
  });

  const result = await Promise.race([
    signInWithCredential(auth, credential),
    timeoutPromise,
  ]);

  agentLog({
    hypothesisId: 'K',
    location: 'google-auth-native:signInFromTokens',
    message: 'signInWithCredential succeeded',
    data: { uid: result.user.uid },
    runId: 'post-fix',
  });

  return result.user;
}

export async function registerGoogleAuthDeepLinkListener(): Promise<void> {
  if (appUrlListenerRegistered || typeof window === 'undefined') return;

  try {
    const { App } = await import('@capacitor/app');
    await App.addListener('appUrlOpen', (event) => {
      void handleGoogleAuthDeepLink(event.url);
    });
    appUrlListenerRegistered = true;
    agentLog({
      hypothesisId: 'D',
      location: 'google-auth-native:registerListener',
      message: 'appUrlOpen listener registered',
      data: {},
    });
  } catch (error) {
    agentLog({
      hypothesisId: 'D',
      location: 'google-auth-native:registerListener',
      message: 'Failed to register appUrlOpen listener',
      data: { error: error instanceof Error ? error.message : 'unknown' },
    });
  }
}

export async function handleGoogleAuthDeepLink(url: string): Promise<boolean> {
  if (!url.startsWith(AUTH_CALLBACK_PREFIX)) return false;

  // #region agent log
  fetch('http://127.0.0.1:7734/ingest/a96e22fe-7db9-467b-a658-0c1b519fae26',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a0b6a1'},body:JSON.stringify({sessionId:'a0b6a1',location:'google-auth-native:deepLink',message:'Auth deep link received',data:{hasPending:!!pendingGoogleAuth,alreadyCompleted:googleAuthCompleted,urlLength:url.length},timestamp:Date.now(),hypothesisId:'M'})}).catch(()=>{});
  // #endregion

  if (googleAuthCompleted) {
    return true;
  }

  const parsed = new URL(url.replace('copynpaste://', 'https://local/'));
  const error = parsed.searchParams.get('error');
  const customToken = parsed.searchParams.get('customToken');
  const idToken = parsed.searchParams.get('idToken');
  const accessToken = parsed.searchParams.get('accessToken');

  // #region agent log
  fetch('http://127.0.0.1:7734/ingest/a96e22fe-7db9-467b-a658-0c1b519fae26',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a0b6a1'},body:JSON.stringify({sessionId:'a0b6a1',location:'google-auth-native:deepLink-parsed',message:'Deep link params parsed',data:{hasCustomToken:!!customToken,hasIdToken:!!idToken,hasError:!!error},timestamp:Date.now(),hypothesisId:'M'})}).catch(()=>{});
  // #endregion

  try {
    if (error) {
      throw new Error(decodeURIComponent(error));
    }

    if (customToken) {
      const decodedToken = decodeURIComponent(customToken);
      
      // #region agent log
      fetch('http://127.0.0.1:7734/ingest/a96e22fe-7db9-467b-a658-0c1b519fae26',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a0b6a1'},body:JSON.stringify({sessionId:'a0b6a1',location:'google-auth-native:customToken-start',message:'Starting signInWithCustomToken',data:{tokenLength:decodedToken.length,authReady:!!auth,authConfig:auth?.config?.apiKey?.substring(0,10),currentUser:!!auth?.currentUser},timestamp:Date.now(),hypothesisId:'Q'})}).catch(()=>{});
      // #endregion

      try {
        // #region agent log
        fetch('http://127.0.0.1:7734/ingest/a96e22fe-7db9-467b-a658-0c1b519fae26',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a0b6a1'},body:JSON.stringify({sessionId:'a0b6a1',location:'google-auth-native:customToken-calling',message:'Calling signInWithCustomToken now',data:{timestamp:Date.now()},timestamp:Date.now(),hypothesisId:'Q'})}).catch(()=>{});
        // #endregion

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            // #region agent log
            fetch('http://127.0.0.1:7734/ingest/a96e22fe-7db9-467b-a658-0c1b519fae26',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a0b6a1'},body:JSON.stringify({sessionId:'a0b6a1',location:'google-auth-native:customToken-timeout',message:'Timeout triggered - signInWithCustomToken did not resolve',data:{},timestamp:Date.now(),hypothesisId:'Q'})}).catch(()=>{});
            // #endregion
            reject(new Error('signInWithCustomToken timeout (15s)'));
          }, 15000);
        });

        const signInPromise = signInWithCustomToken(auth, decodedToken).then((result) => {
          // #region agent log
          fetch('http://127.0.0.1:7734/ingest/a96e22fe-7db9-467b-a658-0c1b519fae26',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a0b6a1'},body:JSON.stringify({sessionId:'a0b6a1',location:'google-auth-native:customToken-resolved',message:'signInWithCustomToken promise resolved',data:{uid:result.user.uid},timestamp:Date.now(),hypothesisId:'Q'})}).catch(()=>{});
          // #endregion
          return result;
        }).catch((err) => {
          // #region agent log
          fetch('http://127.0.0.1:7734/ingest/a96e22fe-7db9-467b-a658-0c1b519fae26',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a0b6a1'},body:JSON.stringify({sessionId:'a0b6a1',location:'google-auth-native:customToken-rejected',message:'signInWithCustomToken promise rejected',data:{error:err?.message,code:err?.code},timestamp:Date.now(),hypothesisId:'Q'})}).catch(()=>{});
          // #endregion
          throw err;
        });

        const result = await Promise.race([signInPromise, timeoutPromise]);

        // #region agent log
        fetch('http://127.0.0.1:7734/ingest/a96e22fe-7db9-467b-a658-0c1b519fae26',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a0b6a1'},body:JSON.stringify({sessionId:'a0b6a1',location:'google-auth-native:customToken-success',message:'signInWithCustomToken succeeded',data:{uid:result.user.uid},timestamp:Date.now(),hypothesisId:'Q'})}).catch(()=>{});
        // #endregion

        await finishGoogleAuth(result.user);
      } catch (tokenError) {
        // #region agent log
        fetch('http://127.0.0.1:7734/ingest/a96e22fe-7db9-467b-a658-0c1b519fae26',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a0b6a1'},body:JSON.stringify({sessionId:'a0b6a1',location:'google-auth-native:customToken-error',message:'signInWithCustomToken failed',data:{error:tokenError instanceof Error?tokenError.message:'unknown'},timestamp:Date.now(),hypothesisId:'Q'})}).catch(()=>{});
        // #endregion
        throw tokenError;
      }
      return true;
    }

    if (idToken) {
      try {
        const user = await signInFromDeepLinkTokens(idToken, accessToken);
        await finishGoogleAuth(user);
      } catch (credentialError) {
        agentLog({
          hypothesisId: 'K',
          location: 'google-auth-native:deepLink',
          message: 'signInFromDeepLinkTokens failed',
          data: { error: credentialError instanceof Error ? credentialError.message : 'unknown' },
          runId: 'post-fix',
        });
        throw credentialError;
      }
      return true;
    }

    throw new Error('No se recibió token de autenticación');
  } catch (authError) {
    if (pendingGoogleAuth) {
      const { reject } = pendingGoogleAuth;
      clearPendingGoogleAuth();
      reject(authError instanceof Error ? authError : new Error('Error de autenticación con Google'));
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7734/ingest/a96e22fe-7db9-467b-a658-0c1b519fae26',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a0b6a1'},body:JSON.stringify({sessionId:'a0b6a1',location:'google-auth-native:deepLink-error',message:'Deep link error without pending auth',data:{error:authError instanceof Error?authError.message:'unknown'},timestamp:Date.now(),hypothesisId:'M'})}).catch(()=>{});
      // #endregion
    }
  }

  return true;
}

async function openAuthBrowser(authUrl: string): Promise<'system' | 'in-app'> {
  const platform = await getNativePlatform();

  if (platform === 'ios') {
    agentLog({
      hypothesisId: 'H',
      location: 'google-auth-native:openAuthBrowser',
      message: 'Opening system Safari for Google auth',
      data: { authUrl },
      runId: 'post-fix',
    });
    await openSystemBrowser(authUrl);
    return 'system';
  }

  const { Browser } = await import('@capacitor/browser');
  await Browser.open({
    url: authUrl,
    presentationStyle: 'fullscreen',
  });
  return 'in-app';
}

export async function signInWithGoogleNative(): Promise<User> {
  await registerGoogleAuthDeepLinkListener();
  googleAuthCompleted = false;

  const authSession = Date.now().toString();
  const authUrl = getWebUrl(`/native-google-auth?session=${authSession}`);

  agentLog({
    hypothesisId: 'A',
    location: 'google-auth-native:signIn',
    message: 'Starting Browser Google auth',
    data: {
      origin: typeof window !== 'undefined' ? window.location.origin : 'ssr',
      authUrl,
    },
  });

  return new Promise<User>(async (resolve, reject) => {
    if (pendingGoogleAuth) {
      reject(new Error('Ya hay un inicio de sesión con Google en curso'));
      return;
    }

    const timeoutId = setTimeout(() => {
      if (!pendingGoogleAuth || googleAuthCompleted) return;
      clearPendingGoogleAuth();
      reject(new Error('Tiempo de espera agotado al iniciar sesión con Google'));
    }, AUTH_TIMEOUT_MS);

    pendingGoogleAuth = { resolve, reject, timeoutId };

    try {
      const browserMode = await openAuthBrowser(authUrl);

      if (browserMode === 'in-app') {
        const { Browser } = await import('@capacitor/browser');
        pendingGoogleAuth.browserFinishedListener = await Browser.addListener('browserFinished', () => {
          setTimeout(() => {
            if (googleAuthCompleted || !pendingGoogleAuth) return;

            if (auth.currentUser) {
              agentLog({
                hypothesisId: 'C',
                location: 'google-auth-native:browserFinished',
                message: 'Browser closed after auth already completed',
                data: { uid: auth.currentUser.uid },
                runId: 'post-fix',
              });
              void finishGoogleAuth(auth.currentUser);
              return;
            }

            agentLog({
              hypothesisId: 'C',
              location: 'google-auth-native:browserFinished',
              message: 'Browser closed before auth callback',
              data: {},
            });
            const { reject: rejectPending } = pendingGoogleAuth;
            clearPendingGoogleAuth();
            rejectPending(new Error('Inicio de sesión cancelado'));
          }, 800);
        });
      }

      agentLog({
        hypothesisId: 'B',
        location: 'google-auth-native:signIn',
        message: 'Auth browser opened',
        data: { authUrl, browserMode },
      });
    } catch (error) {
      clearPendingGoogleAuth();
      reject(error instanceof Error ? error : new Error('No se pudo abrir el navegador de autenticación'));
    }
  });
}
