import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import type { Address, Shop } from "../../db/schema";
import { addresses, shops } from "../../db/schema";

export type ShopWithAddress = Shop & { address: Address };

type AddressData = {
  country: string;
  city: string;
  postalCode: string;
  street: string;
  houseNumber: string;
};

export const shopsRepository = {
  async createShopWithAddress(
    shopData: { ownerUserId: string; name: string; description: string },
    addressData: AddressData
  ): Promise<Shop> {
    return await db.transaction(async (tx) => {
      const [address] = await tx.insert(addresses).values(addressData).returning();
      if (!address) throw new Error("Address insert returned no rows");

      const [shop] = await tx
        .insert(shops)
        .values({ ...shopData, addressId: address.id })
        .returning();
      if (!shop) throw new Error("Shop insert returned no rows");

      return shop;
    });
  },

  async findAll(): Promise<ShopWithAddress[]> {
    const results = await db.query.shops.findMany({
      where: isNull(shops.deletedAt),
      with: {
        address: true,
      },
    });

    return results.filter((s) => s.address && !s.address.deletedAt) as ShopWithAddress[];
  },

  findAllByOwnerUserId(ownerUserId: string): Promise<Shop[]> {
    return db.query.shops.findMany({
      where: and(eq(shops.ownerUserId, ownerUserId), isNull(shops.deletedAt)),
    });
  },

  async findById(id: string): Promise<ShopWithAddress | undefined> {
    const result = await db.query.shops.findFirst({
      where: and(eq(shops.id, id), isNull(shops.deletedAt)),
      with: {
        address: true,
      },
    });

    if (result?.address && !result.address.deletedAt) {
      return result as ShopWithAddress;
    }
    return undefined;
  },

  findByOwnerUserId(ownerUserId: string): Promise<Shop | undefined> {
    return db.query.shops.findFirst({
      where: and(eq(shops.ownerUserId, ownerUserId), isNull(shops.deletedAt)),
    });
  },

  async findAll(): Promise<ShopWithAddress[]> {
    const results = await db.query.shops.findMany({
      where: isNull(shops.deletedAt),
      with: {
        address: true,
      },
    });

    return results.filter((s) => s.address && !s.address.deletedAt) as ShopWithAddress[];
  },

  findAllByOwnerUserId(ownerUserId: string): Promise<Shop[]> {
    return db.query.shops.findMany({
      where: and(eq(shops.ownerUserId, ownerUserId), isNull(shops.deletedAt)),
    });
  },

  async findById(id: string): Promise<ShopWithAddress | undefined> {
    const result = await db.query.shops.findFirst({
      where: and(eq(shops.id, id), isNull(shops.deletedAt)),
      with: {
        address: true,
      },
    });

    if (result?.address && !result.address.deletedAt) {
      return result as ShopWithAddress;
    }
    return undefined;
  },

  findByOwnerUserId(ownerUserId: string): Promise<Shop | undefined> {
    return db.query.shops.findFirst({
      where: and(eq(shops.ownerUserId, ownerUserId), isNull(shops.deletedAt)),
    });
  },

  async insertAddress(data: AddressData): Promise<Address> {
    const [address] = await db.insert(addresses).values(data).returning();
    if (!address) throw new Error("Address insert returned no rows");
    return address;
  },

  async updateById(
    id: string,
    data: { name?: string; description?: string; addressId?: string }
  ): Promise<Shop> {
    const [updated] = await db
      .update(shops)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(shops.id, id))
      .returning();
    if (!updated) throw new Error("Shop not found");
    return updated;
  },
};
