import { createClerkClient } from '@clerk/backend'
import { usersRepository } from './users.repository'
import type { ClerkPayload } from '../auth'
import type { User, Address } from '../../db/schema'

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

    return usersRepository.upsert({
      clerkId,
      fname: clerkUser.firstName ?? '',
      lname: clerkUser.lastName ?? '',
      email,
      role: payload.role === 'admin' ? 'admin' : 'user',
    })
  },

  getById(id: string): Promise<User | undefined> {
    return usersRepository.findById(id)
  },

  async updateProfile(
    clerkId: string,
    payload: ClerkPayload,
    data: { fname?: string; lname?: string }
  ): Promise<User> {
    const user = await usersService.lazyGetOrCreate(clerkId, payload)
    return usersRepository.updateById(user.id, data)
  },

  async getAddresses(
    clerkId: string,
    payload: ClerkPayload
  ): Promise<{ shipping: Address | null; billing: Address | null }> {
    const user = await usersService.lazyGetOrCreate(clerkId, payload)

    const [shipping, billing] = await Promise.all([
      user.shippingAddressId ? usersRepository.findAddressById(user.shippingAddressId) : null,
      user.billingAddressId ? usersRepository.findAddressById(user.billingAddressId) : null,
    ])

    return {
      shipping: shipping ?? null,
      billing: billing ?? null,
    }
  },

  async upsertAddress(
    clerkId: string,
    payload: ClerkPayload,
    type: 'shipping' | 'billing',
    addressData: { country: string; city: string; postalCode: string; street: string; houseNumber: string }
  ): Promise<Address> {
    const user = await usersService.lazyGetOrCreate(clerkId, payload)

    const address = await usersRepository.createAddress(addressData)

    const field = type === 'shipping' ? 'shippingAddressId' : 'billingAddressId'
    await usersRepository.updateById(user.id, { [field]: address.id })

    return address
  },
}
