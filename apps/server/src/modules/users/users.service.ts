import { createClerkClient } from '@clerk/backend'
import { usersRepository } from './users.repository'
import type { ClerkPayload } from '../auth'
import type { User } from '../../db/schema'

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

export const usersService = {
  async lazyGetOrCreate(clerkId: string, payload: ClerkPayload): Promise<User> {
    const existing = await usersRepository.findByClerkId(clerkId)
    if (existing) return existing

    const clerkUser = await clerkClient.users.getUser(clerkId)

    const email = clerkUser.emailAddresses[0]?.emailAddress
    if (!email) throw new Error('Clerk user has no email address')

    return usersRepository.create({
      clerkId,
      fname: clerkUser.firstName ?? '',
      lname: clerkUser.lastName ?? '',
      email,
      role: (payload.role as 'user' | 'admin') ?? 'user',
    })
  },

  getById(id: string): Promise<User | undefined> {
    return usersRepository.findById(id)
  },
}
