import { shopsRepository } from './shops.repository'
import type { ShopWithAddress } from './shops.repository'
import type { Shop } from '../../db/schema'

type AddressData = {
  country: string
  city: string
  postalCode: string
  street: string
  houseNumber: string
}

type CreateShopData = {
  name: string
  description: string
  address: AddressData
}

type UpdateShopData = {
  name?: string
  description?: string
  address?: Partial<AddressData>
}

export const shopsService = {
  listShops(): Promise<ShopWithAddress[]> {
    return shopsRepository.findAll()
  },

  async getShop(id: string): Promise<ShopWithAddress> {
    const shop = await shopsRepository.findById(id)
    if (!shop) throw new Error('NOT_FOUND')
    return shop
  },

  async createShop(ownerUserId: string, data: CreateShopData): Promise<Shop> {
    const existing = await shopsRepository.findByOwnerUserId(ownerUserId)
    if (existing) throw new Error('ALREADY_HAS_SHOP')

    return shopsRepository.createShopWithAddress(
      { ownerUserId, name: data.name, description: data.description },
      data.address
    )
  },

  async updateShop(shopId: string, requesterId: string, data: UpdateShopData): Promise<Shop> {
    const shop = await shopsRepository.findById(shopId)
    if (!shop) throw new Error('NOT_FOUND')
    if (shop.ownerUserId !== requesterId) throw new Error('FORBIDDEN')

    const updates: { name?: string; description?: string; addressId?: string } = {}

    if (data.name !== undefined) updates.name = data.name
    if (data.description !== undefined) updates.description = data.description

    if (data.address && Object.keys(data.address).length > 0) {
      const currentAddress = shop.address
      const mergedAddress: AddressData = {
        country: data.address.country ?? currentAddress.country,
        city: data.address.city ?? currentAddress.city,
        postalCode: data.address.postalCode ?? currentAddress.postalCode,
        street: data.address.street ?? currentAddress.street,
        houseNumber: data.address.houseNumber ?? currentAddress.houseNumber,
      }
      const newAddress = await shopsRepository.insertAddress(mergedAddress)
      updates.addressId = newAddress.id
    }

    return shopsRepository.updateById(shopId, updates)
  },
}
