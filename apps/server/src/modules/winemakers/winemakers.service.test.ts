import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('./winemakers.repository', () => ({
  winemakersRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByIdWithAddress: vi.fn(),
    findByUserId: vi.fn(),
    findWinesByWinemakerId: vi.fn(),
    findEventsByWinemakerId: vi.fn(),
    updateById: vi.fn(),
  },
}))

import { winemakersService } from './winemakers.service'
import { winemakersRepository } from './winemakers.repository'

const userId = '11111111-1111-1111-1111-111111111111'
const winemakerId = '22222222-2222-2222-2222-222222222222'
const addressId = '33333333-3333-3333-3333-333333333333'

const mockAddress = {
  id: addressId,
  country: 'CZ',
  city: 'Brno',
  postalCode: '60200',
  street: 'Vinařská',
  houseNumber: '1',
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
}

const mockWinemaker = {
  id: winemakerId,
  userId,
  name: 'Test Winery',
  description: 'A winery',
  websiteUrl: null,
  email: 'wine@test.com',
  phone: '+420123456789',
  addressId,
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
}

const mockWinemakerWithAddress = { ...mockWinemaker, address: mockAddress }

const mockWinemakerWithRelations = {
  ...mockWinemakerWithAddress,
  wines: [],
  events: [],
}

beforeEach(() => vi.clearAllMocks())

describe('listWinemakers', () => {
  it('returns all winemakers from repository', async () => {
    vi.mocked(winemakersRepository.findAll).mockResolvedValue([mockWinemakerWithAddress] as never)

    const result = await winemakersService.listWinemakers()

    expect(result).toEqual([mockWinemakerWithAddress])
    expect(winemakersRepository.findAll).toHaveBeenCalledOnce()
  })
})

describe('getWinemaker', () => {
  it('returns winemaker with wines and events', async () => {
    vi.mocked(winemakersRepository.findById).mockResolvedValue(mockWinemakerWithRelations as never)

    const result = await winemakersService.getWinemaker(winemakerId)

    expect(result).toEqual(mockWinemakerWithRelations)
  })

  it('throws NOT_FOUND when winemaker does not exist', async () => {
    vi.mocked(winemakersRepository.findById).mockResolvedValue(undefined)

    await expect(winemakersService.getWinemaker(winemakerId)).rejects.toThrow('NOT_FOUND')
  })
})

describe('updateMyProfile', () => {
  it('updates profile fields and re-fetches with address', async () => {
    const updated = { ...mockWinemakerWithAddress, name: 'New Name' }
    vi.mocked(winemakersRepository.findByUserId).mockResolvedValue(mockWinemaker as never)
    vi.mocked(winemakersRepository.updateById).mockResolvedValue({ ...mockWinemaker, name: 'New Name' } as never)
    vi.mocked(winemakersRepository.findByIdWithAddress).mockResolvedValue(updated as never)

    await winemakersService.updateMyProfile(userId, { name: 'New Name' })

    expect(winemakersRepository.updateById).toHaveBeenCalledWith(winemakerId, { name: 'New Name' })
    expect(winemakersRepository.findByIdWithAddress).toHaveBeenCalledWith(winemakerId)
  })

  it('throws NOT_FOUND when winemaker profile does not exist', async () => {
    vi.mocked(winemakersRepository.findByUserId).mockResolvedValue(undefined)

    await expect(winemakersService.updateMyProfile(userId, { name: 'X' })).rejects.toThrow('NOT_FOUND')
    expect(winemakersRepository.updateById).not.toHaveBeenCalled()
  })
})

describe('getWinemakerWines', () => {
  it('returns wines for the given winemaker', async () => {
    vi.mocked(winemakersRepository.findById).mockResolvedValue(mockWinemakerWithRelations as never)
    vi.mocked(winemakersRepository.findWinesByWinemakerId).mockResolvedValue([] as never)

    await winemakersService.getWinemakerWines(winemakerId)

    expect(winemakersRepository.findWinesByWinemakerId).toHaveBeenCalledWith(winemakerId)
  })

  it('throws NOT_FOUND when winemaker does not exist', async () => {
    vi.mocked(winemakersRepository.findById).mockResolvedValue(undefined)

    await expect(winemakersService.getWinemakerWines(winemakerId)).rejects.toThrow('NOT_FOUND')
  })
})

describe('getWinemakerEvents', () => {
  it('returns events for the given winemaker', async () => {
    vi.mocked(winemakersRepository.findById).mockResolvedValue(mockWinemakerWithRelations as never)
    vi.mocked(winemakersRepository.findEventsByWinemakerId).mockResolvedValue([] as never)

    await winemakersService.getWinemakerEvents(winemakerId)

    expect(winemakersRepository.findEventsByWinemakerId).toHaveBeenCalledWith(winemakerId)
  })

  it('throws NOT_FOUND when winemaker does not exist', async () => {
    vi.mocked(winemakersRepository.findById).mockResolvedValue(undefined)

    await expect(winemakersService.getWinemakerEvents(winemakerId)).rejects.toThrow('NOT_FOUND')
  })
})
