# Environment Variables Setup

## Required Variables for Vercel Deployment

### Firebase Client (Public)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Firebase Admin (Server-side)
```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_STORAGE_BUCKET=
```

### MercadoPago
```
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=
```

## Getting Firebase Admin Credentials

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Use these values:
   - `FIREBASE_PROJECT_ID`: project_id from JSON
   - `FIREBASE_CLIENT_EMAIL`: client_email from JSON
   - `FIREBASE_PRIVATE_KEY`: private_key from JSON (keep \n as \n)
   - `FIREBASE_STORAGE_BUCKET`: your-project.firebasestorage.app

## Setting up in Vercel

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add all the variables above
4. Make sure to set them for all environments (Production, Preview, Development)

## Setting up locally

Create `.env.local` file in project root with all the variables above.
