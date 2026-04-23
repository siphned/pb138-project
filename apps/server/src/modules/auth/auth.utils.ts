import { verifyToken } from '@clerk/backend'

export type ClerkPayload = Awaited<ReturnType<typeof verifyToken>> & {
  role?: 'user' | 'admin'
  is_winemaker?: boolean
  is_shop_owner?: boolean
}

export async function verifyClerkToken(authHeader: string | undefined): Promise<ClerkPayload | null> {
  if (!authHeader?.startsWith('Bearer ')) return null

  const CLERK_JWT_KEY = process.env.CLERK_JWT_KEY
  const FRONTEND_URL = process.env.FRONTEND_URL

  if (!CLERK_JWT_KEY) throw new Error('Missing env var: CLERK_JWT_KEY')
  if (!FRONTEND_URL) throw new Error('Missing env var: FRONTEND_URL')

  const token = authHeader.slice(7)

  try {
    const payload = await verifyToken(token, {
      jwtKey: CLERK_JWT_KEY,
      authorizedParties: [FRONTEND_URL],
    })
    return payload as ClerkPayload
  } catch {
    return null
  }
}
