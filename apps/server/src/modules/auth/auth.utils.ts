import { verifyToken } from '@clerk/backend'

if (!process.env.CLERK_JWT_KEY) throw new Error('Missing env var: CLERK_JWT_KEY')
if (!process.env.FRONTEND_URL) throw new Error('Missing env var: FRONTEND_URL')

export type ClerkPayload = Awaited<ReturnType<typeof verifyToken>> & {
  role?: 'user' | 'admin'
  is_winemaker?: boolean
  is_shop_owner?: boolean
}

export async function verifyClerkToken(authHeader: string | undefined): Promise<ClerkPayload | null> {
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)

  try {
    const payload = await verifyToken(token, {
      jwtKey: process.env.CLERK_JWT_KEY,
      authorizedParties: [process.env.FRONTEND_URL],
    })
    return payload as ClerkPayload
  } catch {
    return null
  }
}
