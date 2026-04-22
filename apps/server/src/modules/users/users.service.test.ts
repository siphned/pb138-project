import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockGetUser = vi.hoisted(() => vi.fn())

vi.mock('@clerk/backend', () => ({
  createClerkClient: () => ({
    users: { getUser: mockGetUser },
  }),
}))

vi.mock('./users.repository', () => ({
  usersRepository: {
    findByClerkId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
    updateById: vi.fn(),
    createAddress: vi.fn(),
    findAddressById: vi.fn(),
  },
}))

import { usersService } from './users.service'
import { usersRepository } from './users.repository'
import type { ClerkPayload } from '../auth'

const clerkId = 'user_clerk_abc'
const existingUser = {
  id: 'uuid',
  clerkId,
  email: 'a@b.c',
  fname: 'A',
  lname: 'B',
  role: 'user',
  shippingAddressId: null,
  billingAddressId: null,
}
const payload = (role?: string): ClerkPayload => ({ sub: clerkId, role } as never)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('lazyGetOrCreate', () => {
  it('returns the existing user and never calls Clerk when the user is already in the DB', async () => {
    vi.mocked(usersRepository.findByClerkId).mockResolvedValue(existingUser as never)

    const result = await usersService.lazyGetOrCreate(clerkId, payload('user'))

    expect(result).toBe(existingUser)
    expect(mockGetUser).not.toHaveBeenCalled()
    expect(usersRepository.upsert).not.toHaveBeenCalled()
  })

  it('promotes an existing user to admin when JWT role is admin', async () => {
    vi.mocked(usersRepository.findByClerkId).mockResolvedValue(existingUser as never)
    const promotedUser = { ...existingUser, role: 'admin' }
    vi.mocked(usersRepository.updateById).mockResolvedValue(promotedUser as never)

    const result = await usersService.lazyGetOrCreate(clerkId, payload('admin'))

    expect(usersRepository.updateById).toHaveBeenCalledWith(existingUser.id, { role: 'admin' })
    expect(mockGetUser).not.toHaveBeenCalled()
    expect(usersRepository.upsert).not.toHaveBeenCalled()
    expect(result.role).toBe('admin')
  })

  it('fetches Clerk profile and upserts a new user when not found locally', async () => {
    vi.mocked(usersRepository.findByClerkId).mockResolvedValue(undefined)
    mockGetUser.mockResolvedValue({
      firstName: 'Johnny',
      lastName: 'Stavbar',
      emailAddresses: [{ emailAddress: 'johnny@example.com' }],
    })
    vi.mocked(usersRepository.upsert).mockResolvedValue({ id: 'new-uuid' } as never)

    await usersService.lazyGetOrCreate(clerkId, payload('user'))

    expect(usersRepository.upsert).toHaveBeenCalledWith({
      clerkId,
      fname: 'Johnny',
      lname: 'Stavbar',
      email: 'johnny@example.com',
      role: 'user',
    })
  })

  it('throws when the Clerk user has no email address', async () => {
    vi.mocked(usersRepository.findByClerkId).mockResolvedValue(undefined)
    mockGetUser.mockResolvedValue({ firstName: 'A', lastName: 'B', emailAddresses: [] })

    await expect(usersService.lazyGetOrCreate(clerkId, payload('user'))).rejects.toThrow(
      'Clerk user has no email address'
    )
    expect(usersRepository.upsert).not.toHaveBeenCalled()
  })

  it('upserts with role="admin" when the JWT payload says admin', async () => {
    vi.mocked(usersRepository.findByClerkId).mockResolvedValue(undefined)
    mockGetUser.mockResolvedValue({
      firstName: 'A',
      lastName: 'B',
      emailAddresses: [{ emailAddress: 'a@b.c' }],
    })
    vi.mocked(usersRepository.upsert).mockResolvedValue({ id: 'new-uuid' } as never)

    await usersService.lazyGetOrCreate(clerkId, payload('admin'))

    expect(usersRepository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin' })
    )
  })

  // Regression for the role-cast fix — any unexpected claim must default to 'user'.
  it('defaults to role="user" when the JWT payload role is missing or unknown', async () => {
    vi.mocked(usersRepository.findByClerkId).mockResolvedValue(undefined)
    mockGetUser.mockResolvedValue({
      firstName: 'A',
      lastName: 'B',
      emailAddresses: [{ emailAddress: 'a@b.c' }],
    })
    vi.mocked(usersRepository.upsert).mockResolvedValue({ id: 'new-uuid' } as never)

    await usersService.lazyGetOrCreate(clerkId, payload('superadmin' as never))

    expect(usersRepository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'user' })
    )
  })
})

describe('updateProfile', () => {
  it('calls updateById with provided fields after resolving the user', async () => {
    vi.mocked(usersRepository.findByClerkId).mockResolvedValue(existingUser as never)
    const updated = { ...existingUser, fname: 'NewName' }
    vi.mocked(usersRepository.updateById).mockResolvedValue(updated as never)

    const result = await usersService.updateProfile(clerkId, payload('user'), { fname: 'NewName' })

    expect(usersRepository.updateById).toHaveBeenCalledWith('uuid', { fname: 'NewName' })
    expect(result.fname).toBe('NewName')
  })

  it('can update lname independently', async () => {
    vi.mocked(usersRepository.findByClerkId).mockResolvedValue(existingUser as never)
    vi.mocked(usersRepository.updateById).mockResolvedValue({ ...existingUser, lname: 'Smith' } as never)

    await usersService.updateProfile(clerkId, payload('user'), { lname: 'Smith' })

    expect(usersRepository.updateById).toHaveBeenCalledWith('uuid', { lname: 'Smith' })
  })
})

describe('getAddresses', () => {
  it('returns null for both when user has no linked addresses', async () => {
    vi.mocked(usersRepository.findByClerkId).mockResolvedValue(existingUser as never)

    const result = await usersService.getAddresses(clerkId, payload('user'))

    expect(result).toEqual({ shipping: null, billing: null })
    expect(usersRepository.findAddressById).not.toHaveBeenCalled()
  })

  it('fetches shipping address when shippingAddressId is set', async () => {
    const userWithShipping = { ...existingUser, shippingAddressId: 'addr-uuid' }
    vi.mocked(usersRepository.findByClerkId).mockResolvedValue(userWithShipping as never)
    const shippingAddr = { id: 'addr-uuid', country: 'CZ', city: 'Brno', postalCode: '60200', street: 'Main', houseNumber: '1', createdAt: new Date() }
    vi.mocked(usersRepository.findAddressById).mockResolvedValue(shippingAddr as never)

    const result = await usersService.getAddresses(clerkId, payload('user'))

    expect(usersRepository.findAddressById).toHaveBeenCalledWith('addr-uuid')
    expect(result.shipping).toEqual(shippingAddr)
    expect(result.billing).toBeNull()
  })

  it('fetches both addresses when both IDs are set', async () => {
    const userWithBoth = { ...existingUser, shippingAddressId: 'ship-id', billingAddressId: 'bill-id' }
    vi.mocked(usersRepository.findByClerkId).mockResolvedValue(userWithBoth as never)
    vi.mocked(usersRepository.findAddressById)
      .mockResolvedValueOnce({ id: 'ship-id' } as never)
      .mockResolvedValueOnce({ id: 'bill-id' } as never)

    const result = await usersService.getAddresses(clerkId, payload('user'))

    expect(result.shipping).toEqual({ id: 'ship-id' })
    expect(result.billing).toEqual({ id: 'bill-id' })
  })
})

describe('upsertAddress', () => {
  const addressData = { country: 'CZ', city: 'Brno', postalCode: '60200', street: 'Main', houseNumber: '1' }
  const createdAddr = { id: 'new-addr-id', ...addressData, createdAt: new Date() }

  it('creates address and links it as shipping', async () => {
    vi.mocked(usersRepository.findByClerkId).mockResolvedValue(existingUser as never)
    vi.mocked(usersRepository.createAddress).mockResolvedValue(createdAddr as never)
    vi.mocked(usersRepository.updateById).mockResolvedValue(existingUser as never)

    const result = await usersService.upsertAddress(clerkId, payload('user'), 'shipping', addressData)

    expect(usersRepository.createAddress).toHaveBeenCalledWith(addressData)
    expect(usersRepository.updateById).toHaveBeenCalledWith('uuid', { shippingAddressId: 'new-addr-id' })
    expect(result).toEqual(createdAddr)
  })

  it('creates address and links it as billing', async () => {
    vi.mocked(usersRepository.findByClerkId).mockResolvedValue(existingUser as never)
    vi.mocked(usersRepository.createAddress).mockResolvedValue(createdAddr as never)
    vi.mocked(usersRepository.updateById).mockResolvedValue(existingUser as never)

    await usersService.upsertAddress(clerkId, payload('user'), 'billing', addressData)

    expect(usersRepository.updateById).toHaveBeenCalledWith('uuid', { billingAddressId: 'new-addr-id' })
  })
})

describe('updateProfileById', () => {
  it('calls updateById directly without a Clerk roundtrip', async () => {
    const updated = { ...existingUser, fname: 'Direct' }
    vi.mocked(usersRepository.updateById).mockResolvedValue(updated as never)

    const result = await usersService.updateProfileById('uuid', { fname: 'Direct' })

    expect(usersRepository.updateById).toHaveBeenCalledWith('uuid', { fname: 'Direct' })
    expect(usersRepository.findByClerkId).not.toHaveBeenCalled()
    expect(result.fname).toBe('Direct')
  })
})

describe('getAddressesForUser', () => {
  const addressData = { country: 'CZ', city: 'Brno', postalCode: '60200', street: 'Main', houseNumber: '1' }

  it('returns null for both when user has no linked addresses', async () => {
    const result = await usersService.getAddressesForUser(existingUser as never)

    expect(result).toEqual({ shipping: null, billing: null })
    expect(usersRepository.findAddressById).not.toHaveBeenCalled()
  })

  it('fetches shipping address when shippingAddressId is set', async () => {
    const userWithShipping = { ...existingUser, shippingAddressId: 'addr-uuid' }
    const shippingAddr = { id: 'addr-uuid', ...addressData, createdAt: new Date() }
    vi.mocked(usersRepository.findAddressById).mockResolvedValue(shippingAddr as never)

    const result = await usersService.getAddressesForUser(userWithShipping as never)

    expect(usersRepository.findAddressById).toHaveBeenCalledWith('addr-uuid')
    expect(result.shipping).toEqual(shippingAddr)
    expect(result.billing).toBeNull()
  })

  it('fetches both addresses when both IDs are set', async () => {
    const userWithBoth = { ...existingUser, shippingAddressId: 'ship-id', billingAddressId: 'bill-id' }
    vi.mocked(usersRepository.findAddressById)
      .mockResolvedValueOnce({ id: 'ship-id' } as never)
      .mockResolvedValueOnce({ id: 'bill-id' } as never)

    const result = await usersService.getAddressesForUser(userWithBoth as never)

    expect(result.shipping).toEqual({ id: 'ship-id' })
    expect(result.billing).toEqual({ id: 'bill-id' })
  })
})

describe('upsertAddressForUser', () => {
  const addressData = { country: 'CZ', city: 'Brno', postalCode: '60200', street: 'Main', houseNumber: '1' }
  const createdAddr = { id: 'new-addr-id', ...addressData, createdAt: new Date() }

  it('creates address and links it as shipping without a Clerk roundtrip', async () => {
    vi.mocked(usersRepository.createAddress).mockResolvedValue(createdAddr as never)
    vi.mocked(usersRepository.updateById).mockResolvedValue(existingUser as never)

    const result = await usersService.upsertAddressForUser('uuid', 'shipping', addressData)

    expect(usersRepository.createAddress).toHaveBeenCalledWith(addressData)
    expect(usersRepository.updateById).toHaveBeenCalledWith('uuid', { shippingAddressId: 'new-addr-id' })
    expect(usersRepository.findByClerkId).not.toHaveBeenCalled()
    expect(result).toEqual(createdAddr)
  })

  it('creates address and links it as billing', async () => {
    vi.mocked(usersRepository.createAddress).mockResolvedValue(createdAddr as never)
    vi.mocked(usersRepository.updateById).mockResolvedValue(existingUser as never)

    await usersService.upsertAddressForUser('uuid', 'billing', addressData)

    expect(usersRepository.updateById).toHaveBeenCalledWith('uuid', { billingAddressId: 'new-addr-id' })
  })
})
