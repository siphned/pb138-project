/**
 * Database seed script — populates the DB with randomised Faker data.
 */

import { faker } from "@faker-js/faker";
import {
  addresses,
  availabilityRegular,
  cartItems,
  carts,
  comments,
  events,
  orderItems,
  orders,
  products,
  productWines,
  reviews,
  roleRequests,
  shops,
  users,
  winemakers,
  wines,
} from "@repo/shared/schemas";
import { logger } from "../utils/logger";
import { db } from "./index";

const seed = process.env.SEED_FAKER_SEED ? Number(process.env.SEED_FAKER_SEED) : undefined;
if (seed !== undefined) {
  faker.seed(seed);
}

function clerkId() {
  return `user_seed_${faker.string.alphanumeric(24)}`;
}

function czechAddress() {
  return {
    city: faker.helpers.arrayElement(["Praha", "Brno", "Ostrava", "Olomouc"]),
    country: "Czech Republic",
    houseNumber: faker.location.buildingNumber(),
    postalCode: `${faker.string.numeric(3)} ${faker.string.numeric(2)}`,
    street: faker.location.street(),
  };
}

function pick<T>(arr: T[]): T {
  return faker.helpers.arrayElement(arr);
}

async function teardown() {
  await db.delete(comments);
  await db.delete(reviews);
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(cartItems);
  await db.delete(carts);
  await db.delete(availabilityRegular);
  await db.delete(productWines);
  await db.delete(products);
  await db.delete(events);
  await db.delete(wines);
  await db.delete(roleRequests);
  await db.delete(shops);
  await db.delete(winemakers);
  await db.delete(users);
  await db.delete(addresses);
}

// Batch insert addresses
async function insertAddresses(count: number) {
  if (count === 0) return [];
  const rows = await db
    .insert(addresses)
    .values(Array.from({ length: count }, () => czechAddress()))
    .returning();
  return rows;
}

// Batch insert users with addresses
async function insertUsers(count: number) {
  const addrs = await insertAddresses(count);
  const userValues = Array.from({ length: count }, (_, i) => {
    const fname = faker.person.firstName().slice(0, 30);
    const lname = faker.person.lastName().slice(0, 30);
    return {
      clerkId: clerkId(),
      email: faker.internet.email({ firstName: fname, lastName: lname }).toLowerCase(),
      fname,
      lname,
      shippingAddressId: addrs[i]?.id || "",
    };
  });
  return await db.insert(users).values(userValues).returning();
}

// Batch insert winemakers with addresses
async function insertWinemakers(ownerIds: string[]) {
  if (ownerIds.length === 0) return [];
  const addrs = await insertAddresses(ownerIds.length);
  const wmValues = ownerIds.map((userId, i) => ({
    addressId: addrs[i]?.id || "",
    description: faker.lorem.paragraph(),
    email: faker.internet.email().toLowerCase(),
    name: `${faker.company.name()} Winery`,
    phone: faker.phone.number(),
    userId,
  }));
  return await db.insert(winemakers).values(wmValues).returning();
}

// Batch insert shops with addresses
async function insertShops(ownerIds: string[]) {
  if (ownerIds.length === 0) return [];
  const addrs = await insertAddresses(ownerIds.length);
  const shopValues = ownerIds.map((ownerUserId, i) => ({
    addressId: addrs[i]?.id || "",
    description: faker.lorem.paragraph(),
    name: `${faker.company.name()} Wine Shop`,
    ownerUserId,
  }));
  return await db.insert(shops).values(shopValues).returning();
}

async function insertWines(winemakerId: string, count: number) {
  return await db
    .insert(wines)
    .values(
      Array.from({ length: count }, () => ({
        alcoholContent: "12.5",
        attribution: "Estate",
        color: "red" as const,
        composition: "Grape",
        description: faker.lorem.paragraph(),
        name: `${faker.commerce.productName()}`,
        quantity: 100,
        region: "Moravia",
        type: "still" as const,
        vintageYear: 2022,
        volumeMl: 750,
        winemakerId,
      }))
    )
    .returning();
}

// Batch insert products and product-wine mappings
async function insertProductsForShop(shopId: string, wineRows: (typeof wines.$inferSelect)[]) {
  if (wineRows.length === 0) return [];

  const productValues = wineRows.map((wine) => ({
    isBundle: false,
    name: wine.name,
    price: "15.00",
    quantity: 50,
    shopId,
  }));
  const productsList = await db.insert(products).values(productValues).returning();

  const productWineValues = productsList.map((product, i) => ({
    productId: product.id,
    quantity: 1,
    wineId: wineRows[i]?.id || "",
  }));
  await db.insert(productWines).values(productWineValues);

  return productsList;
}

// Batch insert events with addresses
async function insertEvents(winemakerId: string, count: number) {
  if (count === 0) return [];
  const addrs = await insertAddresses(count);
  const eventValues = Array.from({ length: count }, (_, i) => ({
    addressId: addrs[i]?.id || "",
    capacity: 50,
    endTime: new Date(),
    inviteType: "open" as const,
    name: `Tasting ${i}`,
    startTime: new Date(),
    visibility: pick(["public", "private"] as const),
    winemakerId,
  }));
  return await db.insert(events).values(eventValues).returning();
}

async function seedWinesAndProducts(winemakerRows: (typeof winemakers.$inferSelect)[], shopRows: (typeof shops.$inferSelect)[], winesPerWinemaker: number, shopsPerWinemaker: number) {
  let wineCount = 0;
  for (let i = 0; i < winemakerRows.length; i++) {
    const wm = winemakerRows[i];
    if (!wm) continue;
    const wineRows = await insertWines(wm.id, winesPerWinemaker);
    wineCount += wineRows.length;
    const shop = shopRows[i * shopsPerWinemaker];
    if (shop) {
      await insertProductsForShop(shop.id, wineRows);
    }
    if ((i + 1) % 10 === 0) logger.info(`Processed wines/products for winemaker: ${i + 1}/${winemakerRows.length}`);
  }
  return wineCount;
}

async function main() {
  await teardown();

  const NUM_USERS = Number(process.env.SEED_NUM_USERS) || 100;
  const NUM_WINEMAKERS = Number(process.env.SEED_NUM_WINEMAKERS) || Math.max(1, Math.floor(NUM_USERS * 0.05));
  const TOTAL_WINES = Number(process.env.SEED_TOTAL_WINES) || 500;
  const WINES_PER_WINEMAKER = Number(process.env.SEED_WINES_PER_WINEMAKER) || Math.ceil(TOTAL_WINES / NUM_WINEMAKERS);
  const SHOPS_PER_WINEMAKER = Number(process.env.SEED_SHOPS_PER_WINEMAKER) || 1;
  const EVENTS_PER_WINEMAKER = Number(process.env.SEED_EVENTS_PER_WINEMAKER) || 1;

  logger.info({ NUM_USERS, NUM_WINEMAKERS, WINES_PER_WINEMAKER, SHOPS_PER_WINEMAKER, EVENTS_PER_WINEMAKER }, "Seeding counts");

  logger.info("Inserting users...");
  const customers = await insertUsers(NUM_USERS);
  logger.info(`Inserted ${customers.length} users`);

  logger.info("Inserting winemakers...");
  const wmOwners = Array.from({ length: NUM_WINEMAKERS }, () => pick(customers));
  const uniqueWmOwnerIds = Array.from(new Set(wmOwners.map((w) => w?.id).filter(Boolean))) as string[];
  const winemakerRows = await insertWinemakers(uniqueWmOwnerIds);
  logger.info(`Inserted ${winemakerRows.length} winemakers`);

  logger.info("Inserting shops...");
  const shopOwnerIds = wmOwners.flatMap((w) => Array(SHOPS_PER_WINEMAKER).fill(w?.id)).filter(Boolean) as string[];
  const shopRows = await insertShops(shopOwnerIds);
  logger.info(`Inserted ${shopRows.length} shops`);

  logger.info("Inserting wines and products...");
  const wineCount = await seedWinesAndProducts(winemakerRows, shopRows, WINES_PER_WINEMAKER, SHOPS_PER_WINEMAKER);
  logger.info(`Inserted ${wineCount} wines`);

  logger.info("Inserting events...");
  let eventCount = 0;
  for (const wm of winemakerRows) {
    const eventRows = await insertEvents(wm.id, EVENTS_PER_WINEMAKER);
    eventCount += eventRows.length;
  }
  logger.info(`Inserted ${eventCount} events`);

  logger.info("Seeding complete!");
}

main().catch((err) => {
  logger.error(err, "Seeding failed");
  process.exit(1);
});
