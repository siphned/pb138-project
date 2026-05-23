import type { Shop } from "@repo/shared/schemas";
import { db } from "../../db";
import { ForbiddenShopActionError, ShopNotFoundError } from "./shops.errors";
import type { ShopWithAddress } from "./shops.repository";
import * as shopsRepo from "./shops.repository";

type AddressData = {
  country: string;
  city: string;
  postalCode: string;
  street: string;
  houseNumber: string;
};

type CreateShopData = {
  name: string;
  description: string;
  address: AddressData;
};

type UpdateShopData = {
  name?: string;
  description?: string;
  address?: Partial<AddressData>;
};

export class ShopsService {
  async createShop(ownerUserId: string, data: CreateShopData): Promise<ShopWithAddress> {
    const shop: Shop = await db.transaction(async (tx) => {
      const address = await shopsRepo.insertAddress(tx, data.address);
      return await shopsRepo.createShop(tx, {
        addressId: address.id,
        description: data.description,
        name: data.name,
        ownerUserId,
      });
    });

    const created = await shopsRepo.findById(db, shop.id);
    if (!created) throw new ShopNotFoundError(shop.id);
    return created;
  }

  async getShop(id: string): Promise<ShopWithAddress> {
    const shop = await shopsRepo.findById(db, id);
    if (!shop) throw new ShopNotFoundError(id);
    return shop;
  }

  listMyShops(ownerUserId: string): Promise<ShopWithAddress[]> {
    return shopsRepo.findAllByOwnerUserId(db, ownerUserId) as Promise<ShopWithAddress[]>;
  }

  listShops(
    filters: { q?: string; city?: string; ownerUserId?: string } = {}
  ): Promise<ShopWithAddress[]> {
    return shopsRepo.findAll(db, filters);
  }

  async deleteShop(shopId: string, requesterId: string): Promise<void> {
    const shop = await shopsRepo.findById(db, shopId);
    if (!shop) throw new ShopNotFoundError(shopId);
    if (shop.ownerUserId !== requesterId) throw new ForbiddenShopActionError();
    await shopsRepo.softDeleteById(db, shopId);
  }

  async updateShop(
    shopId: string,
    requesterId: string,
    data: UpdateShopData
  ): Promise<ShopWithAddress> {
    const shop = await shopsRepo.findById(db, shopId);
    if (!shop) throw new ShopNotFoundError(shopId);
    if (shop.ownerUserId !== requesterId) throw new ForbiddenShopActionError();

    const updates: { name?: string; description?: string; addressId?: string } = {};

    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;

    if (data.address && Object.keys(data.address).length > 0) {
      const currentAddress = shop.address;
      const mergedAddress: AddressData = {
        city: data.address.city ?? currentAddress.city,
        country: data.address.country ?? currentAddress.country,
        houseNumber: data.address.houseNumber ?? currentAddress.houseNumber,
        postalCode: data.address.postalCode ?? currentAddress.postalCode,
        street: data.address.street ?? currentAddress.street,
      };
      const newAddress = await shopsRepo.insertAddress(db, mergedAddress);
      updates.addressId = newAddress.id;
    }

    await shopsRepo.updateById(db, shopId, updates);
    const updated = await shopsRepo.findById(db, shopId);
    if (!updated) throw new ShopNotFoundError(shopId);
    return updated;
  }
}

export const shopsService = new ShopsService();
