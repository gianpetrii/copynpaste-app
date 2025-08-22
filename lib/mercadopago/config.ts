import { MercadoPagoConfig } from 'mercadopago';

// Configuración de MercadoPago
export const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

// Configuración del entorno
export const MP_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '',
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  isProduction: process.env.NEXT_PUBLIC_ENV === 'production',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
};

// URLs de callback
export const getCallbackUrls = (subscriptionId: string) => ({
  success: `${MP_CONFIG.baseUrl}/subscription/success?subscription_id=${subscriptionId}`,
  failure: `${MP_CONFIG.baseUrl}/subscription/failure?subscription_id=${subscriptionId}`,
  pending: `${MP_CONFIG.baseUrl}/subscription/pending?subscription_id=${subscriptionId}`
});

// Validar configuración
export const validateMPConfig = (): boolean => {
  if (!MP_CONFIG.publicKey || !MP_CONFIG.accessToken) {
    console.error('❌ MercadoPago: Credenciales faltantes');
    return false;
  }
  
  if (!MP_CONFIG.baseUrl) {
    console.error('❌ MercadoPago: URL base faltante');
    return false;
  }
  
  return true;
};
