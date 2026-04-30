import type { IShopsRepository, ShopWithAddress } from "./shops.repository";
import { shopsRepository } from "./shops.repository";

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
  constructor(private shopsRepo: IShopsRepository) {}

  async createShop(ownerUserId: string, data: CreateShopData): Promise<ShopWithAddress> {
    const shop = await this.shopsRepo.createShopWithAddress(
      { description: data.description, name: data.name, ownerUserId },
      data.address
    );
    const created = await this.shopsRepo.findById(shop.id);
    if (!created) throw new Error("NOT_FOUND");
    return created;
  }

  async getShop(id: string): Promise<ShopWithAddress> {
    const shop = await this.shopsRepo.findById(id);
    if (!shop) throw new Error("NOT_FOUND");
    return shop;
  }

  listMyShops(ownerUserId: string): Promise<ShopWithAddress[]> {
    return this.shopsRepo.findAllByOwnerUserId(ownerUserId) as Promise<ShopWithAddress[]>;
  }

  listShops(): Promise<ShopWithAddress[]> {
    return this.shopsRepo.findAll();
  }

  async updateShop(
    shopId: string,
    requesterId: string,
    data: UpdateShopData
  ): Promise<ShopWithAddress> {
    const shop = await this.shopsRepo.findById(shopId);
    if (!shop) throw new Error("NOT_FOUND");
    if (shop.ownerUserId !== requesterId) throw new Error("FORBIDDEN");

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
      const newAddress = await this.shopsRepo.insertAddress(mergedAddress);
      updates.addressId = newAddress.id;
    }

    await this.shopsRepo.updateById(shopId, updates);
    const updated = await this.shopsRepo.findById(shopId);
    if (!updated) throw new Error("NOT_FOUND");
    return updated;
  }
}

export const shopsService = new ShopsService(shopsRepository);
