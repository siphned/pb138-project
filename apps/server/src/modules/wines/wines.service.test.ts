import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('./wines.repository', () => ({
  winesRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findWinemakerByUserId: vi.fn(),
    insert: vi.fn(),
    updateById: vi.fn(),
    softDelete: vi.fn(),
  },
}))

import { winesService } from './wines.service'
import { winesRepository } from './wines.repository'

const userId = '11111111-1111-1111-1111-111111111111'
const otherUserId = '22222222-2222-2222-2222-222222222222'
const winemakerId = '33333333-3333-3333-3333-333333333333'
const otherWinemakerId = '44444444-4444-4444-4444-444444444444'
const wineId = '55555555-5555-5555-5555-555555555555'

const mockWinemaker = {
  id: winemakerId,
  userId,
  name: 'Test Winery',
  description: 'A winery',
  websiteUrl: null,
  email: 'test@winery.com',
  phone: '+420123456789',
  addressId: '66666666-6666-6666-6666-666666666666',
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
}

const wineData = {
  name: 'Pinot Noir',
  description: 'A fine red wine',
  composition: '100% Pinot Noir',
  attribution: 'Estate grown',
  region: 'Burgundy',
  vintageYear: 2020,
  type: 'still' as const,
  color: 'red' as const,
  alcoholContent: '13.50',
  volumeMl: 750,
  quantity: 100,
}

const mockWine = {
  id: wineId,
  winemakerId,
  winemaker: { id: winemakerId, name: 'Test Winery' },
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...wineData,
}

beforeEach(() => vi.clearAllMocks())

describe('createWine', () => {
  it('resolves winemaker from userId and inserts wine', async () => {
    vi.mocked(winesRepository.findWinemakerByUserId).mockResolvedValue(mockWinemaker as never)
    vi.mocked(winesRepository.insert).mockResolvedValue(mockWine as never)
    vi.mocked(winesRepository.findById).mockResolvedValue(mockWine as never)

    await winesService.createWine(userId, wineData)

    expect(winesRepository.findWinemakerByUserId).toHaveBeenCalledWith(userId)
    expect(winesRepository.insert).toHaveBeenCalledWith(winemakerId, wineData)
  })

  it('throws NOT_FOUND when winemaker record does not exist', async () => {
    vi.mocked(winesRepository.findWinemakerByUserId).mockResolvedValue(undefined)

    await expect(winesService.createWine(userId, wineData)).rejects.toThrow('NOT_FOUND')
    expect(winesRepository.insert).not.toHaveBeenCalled()
  })
})

describe('getWine', () => {
  it('returns wine when found', async () => {
    vi.mocked(winesRepository.findById).mockResolvedValue(mockWine as never)

    const result = await winesService.getWine(wineId)

    expect(result).toEqual(mockWine)
  })

  it('throws NOT_FOUND when wine does not exist', async () => {
    vi.mocked(winesRepository.findById).mockResolvedValue(undefined)

    await expect(winesService.getWine(wineId)).rejects.toThrow('NOT_FOUND')
  })
})

describe('replaceWine', () => {
  it('allows admin to update any wine without ownership check', async () => {
    vi.mocked(winesRepository.findById).mockResolvedValue(mockWine as never)
    vi.mocked(winesRepository.updateById).mockResolvedValue(mockWine as never)

    await winesService.replaceWine(wineId, otherUserId, 'admin', wineData)

    expect(winesRepository.findWinemakerByUserId).not.toHaveBeenCalled()
    expect(winesRepository.updateById).toHaveBeenCalledWith(wineId, wineData)
  })

  it('allows winemaker to update own wine', async () => {
    vi.mocked(winesRepository.findById)
      .mockResolvedValueOnce(mockWine as never)  // ownership check
      .mockResolvedValueOnce(mockWine as never)  // re-fetch after update
    vi.mocked(winesRepository.findWinemakerByUserId).mockResolvedValue(mockWinemaker as never)
    vi.mocked(winesRepository.updateById).mockResolvedValue(mockWine as never)

    await winesService.replaceWine(wineId, userId, 'user', wineData)

    expect(winesRepository.updateById).toHaveBeenCalledWith(wineId, wineData)
  })

  it('throws FORBIDDEN when winemaker tries to update another winemakers wine', async () => {
    const otherWine = { ...mockWine, winemakerId: otherWinemakerId }
    vi.mocked(winesRepository.findById).mockResolvedValue(otherWine as never)
    vi.mocked(winesRepository.findWinemakerByUserId).mockResolvedValue(mockWinemaker as never)

    await expect(winesService.replaceWine(wineId, userId, 'user', wineData)).rejects.toThrow('FORBIDDEN')
    expect(winesRepository.updateById).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when wine does not exist', async () => {
    vi.mocked(winesRepository.findById).mockResolvedValue(undefined)

    await expect(winesService.replaceWine(wineId, userId, 'user', wineData)).rejects.toThrow('NOT_FOUND')
  })
})

describe('deleteWine', () => {
  it('soft deletes own wine', async () => {
    vi.mocked(winesRepository.findById).mockResolvedValue(mockWine as never)
    vi.mocked(winesRepository.findWinemakerByUserId).mockResolvedValue(mockWinemaker as never)

    await winesService.deleteWine(wineId, userId, 'user')

    expect(winesRepository.softDelete).toHaveBeenCalledWith(wineId)
  })

  it('allows admin to delete any wine', async () => {
    vi.mocked(winesRepository.findById).mockResolvedValue(mockWine as never)

    await winesService.deleteWine(wineId, otherUserId, 'admin')

    expect(winesRepository.findWinemakerByUserId).not.toHaveBeenCalled()
    expect(winesRepository.softDelete).toHaveBeenCalledWith(wineId)
  })

  it('throws FORBIDDEN when caller does not own the wine', async () => {
    const otherWine = { ...mockWine, winemakerId: otherWinemakerId }
    vi.mocked(winesRepository.findById).mockResolvedValue(otherWine as never)
    vi.mocked(winesRepository.findWinemakerByUserId).mockResolvedValue(mockWinemaker as never)

    await expect(winesService.deleteWine(wineId, userId, 'user')).rejects.toThrow('FORBIDDEN')
    expect(winesRepository.softDelete).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when wine does not exist', async () => {
    vi.mocked(winesRepository.findById).mockResolvedValue(undefined)

    await expect(winesService.deleteWine(wineId, userId, 'user')).rejects.toThrow('NOT_FOUND')
  })
})

describe('listWines', () => {
  it('delegates to repository with filters', async () => {
    vi.mocked(winesRepository.findAll).mockResolvedValue([mockWine] as never)

    const result = await winesService.listWines({ region: 'Burgundy', type: 'still' })

    expect(winesRepository.findAll).toHaveBeenCalledWith({ region: 'Burgundy', type: 'still' })
    expect(result).toEqual([mockWine])
  })
})
