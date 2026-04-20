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
  },
}))

import { usersService } from './users.service'
import { usersRepository } from './users.repository'
import type { ClerkPayload } from '../auth'

const clerkId = 'user_clerk_abc'
const existingUser = { id: 'uuid', clerkId, email: 'a@b.c', fname: 'A', lname: 'B', role: 'user' }
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
