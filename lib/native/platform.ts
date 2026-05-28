'use client';

let capacitorCore: typeof import('@capacitor/core') | null = null;

async function getCapacitorCore() {
  if (typeof window === 'undefined') return null;
  if (!capacitorCore) {
    try {
      capacitorCore = await import('@capacitor/core');
    } catch {
      return null;
    }
  }
  return capacitorCore;
}

export async function isNativePlatform(): Promise<boolean> {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.has('native')) {
      const value = params.get('native') !== '0';
      localStorage.setItem('__native_preview', value ? '1' : '0');
      return value;
    }
    if (localStorage.getItem('__native_preview') === '1') return true;
  }
  const core = await getCapacitorCore();
  return core?.Capacitor.isNativePlatform() ?? false;
}

export async function getNativePlatform(): Promise<'ios' | 'android' | 'web'> {
  const core = await getCapacitorCore();
  if (!core?.Capacitor.isNativePlatform()) return 'web';
  return core.Capacitor.getPlatform() as 'ios' | 'android';
}

export async function openExternalUrl(url: string): Promise<void> {
  const native = await isNativePlatform();
  if (native) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url, presentationStyle: 'popover' });
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
