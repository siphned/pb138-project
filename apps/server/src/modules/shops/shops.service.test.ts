import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('./shops.repository', () => ({
  shopsRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByOwnerUserId: vi.fn(),
    createShopWithAddress: vi.fn(),
    insertAddress: vi.fn(),
    updateById: vi.fn(),
  },
}))

import { shopsService } from './shops.service'
import { shopsRepository } from './shops.repository'

const ownerId = '11111111-1111-1111-1111-111111111111'
const otherId = '22222222-2222-2222-2222-222222222222'
const shopId = '33333333-3333-3333-3333-333333333333'
const addressId = '44444444-4444-4444-4444-444444444444'
const newAddressId = '55555555-5555-5555-5555-555555555555'

const mockAddress = {
  id: addressId,
  country: 'CZ',
  city: 'Brno',
  postalCode: '60200',
  street: 'Masarykova',
  houseNumber: '1',
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
}

const mockShop = {
  id: shopId,
  ownerUserId: ownerId,
  name: 'Test Shop',
  description: 'A description',
  addressId,
  address: mockAddress,
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createShop', () => {
  it('creates a shop when user has no existing shop', async () => {
    vi.mocked(shopsRepository.findByOwnerUserId).mockResolvedValue(undefined)
    vi.mocked(shopsRepository.createShopWithAddress).mockResolvedValue(mockShop as never)

    await shopsService.createShop(ownerId, {
      name: 'Test Shop',
      description: 'A description',
      address: { country: 'CZ', city: 'Brno', postalCode: '60200', street: 'Masarykova', houseNumber: '1' },
    })

    expect(shopsRepository.createShopWithAddress).toHaveBeenCalledWith(
      { ownerUserId: ownerId, name: 'Test Shop', description: 'A description' },
      { country: 'CZ', city: 'Brno', postalCode: '60200', street: 'Masarykova', houseNumber: '1' }
    )
  })

  it('throws ALREADY_HAS_SHOP when user already owns one', async () => {
    vi.mocked(shopsRepository.findByOwnerUserId).mockResolvedValue(mockShop as never)

    await expect(
      shopsService.createShop(ownerId, {
        name: 'Another Shop',
        description: 'desc',
        address: { country: 'CZ', city: 'Brno', postalCode: '60200', street: 'X', houseNumber: '1' },
      })
    ).rejects.toThrow('ALREADY_HAS_SHOP')

    expect(shopsRepository.createShopWithAddress).not.toHaveBeenCalled()
  })
})

describe('updateShop', () => {
  it('updates shop fields when caller is the owner', async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(mockShop as never)
    vi.mocked(shopsRepository.updateById).mockResolvedValue({ ...mockShop, name: 'New Name' } as never)

    await shopsService.updateShop(shopId, ownerId, { name: 'New Name' })

    expect(shopsRepository.updateById).toHaveBeenCalledWith(shopId, { name: 'New Name' })
  })

  it('throws FORBIDDEN when caller does not own the shop', async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(mockShop as never)

    await expect(shopsService.updateShop(shopId, otherId, { name: 'Hack' })).rejects.toThrow('FORBIDDEN')
    expect(shopsRepository.updateById).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when shop does not exist', async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(undefined)

    await expect(shopsService.updateShop(shopId, ownerId, { name: 'X' })).rejects.toThrow('NOT_FOUND')
  })

  it('creates a new address row and relinks shop when address is updated', async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(mockShop as never)
    vi.mocked(shopsRepository.insertAddress).mockResolvedValue({ ...mockAddress, id: newAddressId } as never)
    vi.mocked(shopsRepository.updateById).mockResolvedValue({ ...mockShop, addressId: newAddressId } as never)

    await shopsService.updateShop(shopId, ownerId, {
      address: { city: 'Prague' },
    })

    expect(shopsRepository.insertAddress).toHaveBeenCalledWith({
      country: 'CZ',
      city: 'Prague',
      postalCode: '60200',
      street: 'Masarykova',
      houseNumber: '1',
    })
    expect(shopsRepository.updateById).toHaveBeenCalledWith(shopId, { addressId: newAddressId })
  })
})
