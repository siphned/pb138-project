import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockUpdateUserMetadata = vi.hoisted(() => vi.fn())

vi.mock('@clerk/backend', () => ({
  createClerkClient: () => ({
    users: { updateUserMetadata: mockUpdateUserMetadata },
  }),
}))

vi.mock('./role-requests.repository', () => ({
  roleRequestsRepository: {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findPending: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
  },
}))

vi.mock('../users/users.repository', () => ({
  usersRepository: {
    findById: vi.fn(),
  },
}))

import { roleRequestsService } from './role-requests.service'
import { roleRequestsRepository } from './role-requests.repository'
import { usersRepository } from '../users/users.repository'

const userId = '11111111-1111-1111-1111-111111111111'
const adminId = '22222222-2222-2222-2222-222222222222'
const requestId = '33333333-3333-3333-3333-333333333333'
const clerkId = 'user_clerk_abc'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('submitRequest', () => {
  it('creates a new request when user has no existing requests', async () => {
    vi.mocked(roleRequestsRepository.findByUserId).mockResolvedValue([])
    vi.mocked(roleRequestsRepository.create).mockResolvedValue({ id: requestId } as never)

    await roleRequestsService.submitRequest(userId, 'winemaker', 'My Winery', 'details text')

    expect(roleRequestsRepository.create).toHaveBeenCalledWith({
      userId,
      requestedRole: 'winemaker',
      businessName: 'My Winery',
      details: 'details text',
    })
  })

  it('throws DUPLICATE_REQUEST when a pending request for the same role exists', async () => {
    vi.mocked(roleRequestsRepository.findByUserId).mockResolvedValue([
      { requestedRole: 'winemaker', status: 'pending' } as never,
    ])

    await expect(
      roleRequestsService.submitRequest(userId, 'winemaker', 'My Winery')
    ).rejects.toThrow('DUPLICATE_REQUEST')
    expect(roleRequestsRepository.create).not.toHaveBeenCalled()
  })

  it('allows a new request when the pending one is for a different role', async () => {
    vi.mocked(roleRequestsRepository.findByUserId).mockResolvedValue([
      { requestedRole: 'shop_owner', status: 'pending' } as never,
    ])
    vi.mocked(roleRequestsRepository.create).mockResolvedValue({ id: requestId } as never)

    await roleRequestsService.submitRequest(userId, 'winemaker', 'My Winery')

    expect(roleRequestsRepository.create).toHaveBeenCalled()
  })

  it('allows a new request when the previous one was rejected', async () => {
    vi.mocked(roleRequestsRepository.findByUserId).mockResolvedValue([
      { requestedRole: 'winemaker', status: 'rejected' } as never,
    ])
    vi.mocked(roleRequestsRepository.create).mockResolvedValue({ id: requestId } as never)

    await roleRequestsService.submitRequest(userId, 'winemaker', 'My Winery')

    expect(roleRequestsRepository.create).toHaveBeenCalled()
  })
})

describe('approve', () => {
  it('throws NOT_FOUND when the request does not exist', async () => {
    vi.mocked(roleRequestsRepository.findById).mockResolvedValue(undefined)

    await expect(roleRequestsService.approve(requestId, adminId)).rejects.toThrow('NOT_FOUND')
  })

  it('throws NOT_PENDING when the request is already approved or rejected', async () => {
    vi.mocked(roleRequestsRepository.findById).mockResolvedValue({
      status: 'approved',
      requestedRole: 'winemaker',
      userId,
    } as never)

    await expect(roleRequestsService.approve(requestId, adminId)).rejects.toThrow('NOT_PENDING')
  })

  it('throws USER_NOT_FOUND when the requesting user is missing', async () => {
    vi.mocked(roleRequestsRepository.findById).mockResolvedValue({
      status: 'pending',
      requestedRole: 'winemaker',
      userId,
    } as never)
    vi.mocked(usersRepository.findById).mockResolvedValue(undefined)

    await expect(roleRequestsService.approve(requestId, adminId)).rejects.toThrow('USER_NOT_FOUND')
  })

  it('sets is_winemaker in Clerk then marks the request approved', async () => {
    vi.mocked(roleRequestsRepository.findById).mockResolvedValue({
      status: 'pending',
      requestedRole: 'winemaker',
      userId,
    } as never)
    vi.mocked(usersRepository.findById).mockResolvedValue({ clerkId } as never)

    await roleRequestsService.approve(requestId, adminId)

    expect(mockUpdateUserMetadata).toHaveBeenCalledWith(clerkId, {
      publicMetadata: { is_winemaker: true },
    })
    expect(roleRequestsRepository.updateStatus).toHaveBeenCalledWith(requestId, 'approved', adminId)
  })

  it('sets is_shop_owner in Clerk for a shop_owner request', async () => {
    vi.mocked(roleRequestsRepository.findById).mockResolvedValue({
      status: 'pending',
      requestedRole: 'shop_owner',
      userId,
    } as never)
    vi.mocked(usersRepository.findById).mockResolvedValue({ clerkId } as never)

    await roleRequestsService.approve(requestId, adminId)

    expect(mockUpdateUserMetadata).toHaveBeenCalledWith(clerkId, {
      publicMetadata: { is_shop_owner: true },
    })
  })

  // Regression test for the Clerk-before-DB order fix.
  it('leaves the DB untouched when the Clerk update fails', async () => {
    vi.mocked(roleRequestsRepository.findById).mockResolvedValue({
      status: 'pending',
      requestedRole: 'winemaker',
      userId,
    } as never)
    vi.mocked(usersRepository.findById).mockResolvedValue({ clerkId } as never)
    mockUpdateUserMetadata.mockRejectedValueOnce(new Error('Clerk down'))

    await expect(roleRequestsService.approve(requestId, adminId)).rejects.toThrow('Clerk down')
    expect(roleRequestsRepository.updateStatus).not.toHaveBeenCalled()
  })
})

describe('reject', () => {
  it('marks the request rejected without touching Clerk', async () => {
    vi.mocked(roleRequestsRepository.findById).mockResolvedValue({
      status: 'pending',
      requestedRole: 'winemaker',
      userId,
    } as never)

    await roleRequestsService.reject(requestId, adminId)

    expect(roleRequestsRepository.updateStatus).toHaveBeenCalledWith(requestId, 'rejected', adminId)
    expect(mockUpdateUserMetadata).not.toHaveBeenCalled()
  })
})
