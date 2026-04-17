import { createClerkClient } from '@clerk/backend'
import { roleRequestsRepository } from './role-requests.repository'
import { usersRepository } from '../users/users.repository'

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

export const roleRequestsService = {
  listPending() {
    return roleRequestsRepository.findPending()
  },

  async submitRequest(
    userId: string,
    requestedRole: 'winemaker' | 'shop_owner',
    businessName: string,
    details?: string
  ) {
    const existing = await roleRequestsRepository.findByUserId(userId)
    const duplicate = existing.find(
      (r) => r.requestedRole === requestedRole && r.status === 'pending'
    )
    if (duplicate) throw new Error('DUPLICATE_REQUEST')

    return roleRequestsRepository.create({ userId, requestedRole, businessName, details })
  },

  async approve(requestId: string, adminUserId: string) {
    const request = await roleRequestsRepository.findById(requestId)
    if (!request) throw new Error('NOT_FOUND')
    if (request.status !== 'pending') throw new Error('NOT_PENDING')

    const user = await usersRepository.findById(request.userId)
    if (!user) throw new Error('USER_NOT_FOUND')

    await roleRequestsRepository.updateStatus(requestId, 'approved', adminUserId)

    const clerkUser = await clerkClient.users.getUser(user.clerkId)
    const metadataKey =
      request.requestedRole === 'winemaker' ? 'is_winemaker' : 'is_shop_owner'

    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: {
        ...(clerkUser.publicMetadata as object),
        [metadataKey]: true,
      },
    })
  },

  async reject(requestId: string, adminUserId: string) {
    const request = await roleRequestsRepository.findById(requestId)
    if (!request) throw new Error('NOT_FOUND')
    if (request.status !== 'pending') throw new Error('NOT_PENDING')

    return roleRequestsRepository.updateStatus(requestId, 'rejected', adminUserId)
  },
}
