<<<<<<< HEAD
import type { Shop } from "@repo/shared/schemas";
import { db } from "../../db";
import { ForbiddenShopActionError, ShopNotFoundError } from "./shops.errors";
import type { ShopWithAddress } from "./shops.repository";
import * as shopsRepo from "./shops.repository";
=======
import type { IShopsRepository, ShopWithAddress } from "./shops.repository";
import { shopsRepository } from "./shops.repository";
>>>>>>> origin/main

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
<<<<<<< HEAD
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
=======
  constructor(private shopsRepo: IShopsRepository) {}

  async createShop(ownerUserId: string, data: CreateShopData): Promise<ShopWithAddress> {
    const shop = await this.shopsRepo.createShopWithAddress(
      { description: data.description, name: data.name, ownerUserId },
      data.address
    );
    const created = await this.shopsRepo.findById(shop.id);
    if (!created) throw new Error("NOT_FOUND");
>>>>>>> origin/main
    return created;
  }

  async getShop(id: string): Promise<ShopWithAddress> {
<<<<<<< HEAD
    const shop = await shopsRepo.findById(db, id);
    if (!shop) throw new ShopNotFoundError(id);
=======
    const shop = await this.shopsRepo.findById(id);
    if (!shop) throw new Error("NOT_FOUND");
>>>>>>> origin/main
    return shop;
  }

  listMyShops(ownerUserId: string): Promise<ShopWithAddress[]> {
<<<<<<< HEAD
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
=======
    return this.shopsRepo.findAllByOwnerUserId(ownerUserId) as Promise<ShopWithAddress[]>;
  }

  listShops(): Promise<ShopWithAddress[]> {
    return this.shopsRepo.findAll();
>>>>>>> origin/main
  }

  async updateShop(
    shopId: string,
    requesterId: string,
    data: UpdateShopData
  ): Promise<ShopWithAddress> {
<<<<<<< HEAD
    const shop = await shopsRepo.findById(db, shopId);
    if (!shop) throw new ShopNotFoundError(shopId);
    if (shop.ownerUserId !== requesterId) throw new ForbiddenShopActionError();
=======
    const shop = await this.shopsRepo.findById(shopId);
    if (!shop) throw new Error("NOT_FOUND");
    if (shop.ownerUserId !== requesterId) throw new Error("FORBIDDEN");
>>>>>>> origin/main

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
<<<<<<< HEAD
      const newAddress = await shopsRepo.insertAddress(db, mergedAddress);
      updates.addressId = newAddress.id;
    }

    await shopsRepo.updateById(db, shopId, updates);
    const updated = await shopsRepo.findById(db, shopId);
    if (!updated) throw new ShopNotFoundError(shopId);
=======
      const newAddress = await this.shopsRepo.insertAddress(mergedAddress);
      updates.addressId = newAddress.id;
    }

    await this.shopsRepo.updateById(shopId, updates);
    const updated = await this.shopsRepo.findById(shopId);
    if (!updated) throw new Error("NOT_FOUND");
>>>>>>> origin/main
    return updated;
  }
}

<<<<<<< HEAD
export const shopsService = new ShopsService();
=======
export const shopsService = new ShopsService(shopsRepository);
>>>>>>> origin/main
