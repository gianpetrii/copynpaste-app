'use client';

import { registerPlugin } from '@capacitor/core';

interface SystemBrowserPlugin {
  open(options: { url: string }): Promise<void>;
}

const SystemBrowser = registerPlugin<SystemBrowserPlugin>('SystemBrowser');

export async function openSystemBrowser(url: string): Promise<void> {
  await SystemBrowser.open({ url });
}
