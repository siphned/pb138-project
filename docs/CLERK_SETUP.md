# Clerk Setup for Local Development

To run the project locally, you need a Clerk application configured for development.

## 1. Create a Clerk Application
- Go to the [Clerk Dashboard](https://dashboard.clerk.com/).
- Create a new application (e.g., "WineMarket Local").
- Select your preferred authentication methods (Email, Google, etc.).

## 2. Configure URLs
In the Clerk Dashboard, navigate to **Configure > Path Settings**:

- **Home URL**: `http://localhost:5173`
- **Sign-in URL**: `http://localhost:5173/sign-in`
- **Sign-up URL**: `http://localhost:5173/sign-up`
- **After Sign-in URL**: `http://localhost:5173/`
- **After Sign-up URL**: `http://localhost:5173/`

## 3. Allowed Origins
Navigate to **Configure > API Keys > Authorized Origins**:
- Add `http://localhost:5173`.

## 4. Environment Variables
Copy your **Publishable Key** and **Secret Key** to your `.env` files.

### Frontend (`apps/web/.env.local`)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Backend (`apps/server/.env.local`)
```env
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_KEY="-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----"
```

> Note: To get the JWT Public Key, go to **Configure > API Keys > Advanced > JWT Templates** and find the PEM-encoded public key.
