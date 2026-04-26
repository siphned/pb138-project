/**
 * Database seed script — populates the DB with randomised Faker data.
 */

import { faker } from "@faker-js/faker";
import { db } from "./index";
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
} from "./schema";

const seed = process.env.SEED_FAKER_SEED ? Number(process.env.SEED_FAKER_SEED) : undefined;
if (seed !== undefined) {
  faker.seed(seed);
  console.log(`Faker seed: ${seed}`);
}

function clerkId() {
  return `user_seed_${faker.string.alphanumeric(24)}`;
}

function czechAddress() {
  return {
    country: "Czech Republic",
    city: faker.helpers.arrayElement(["Praha", "Brno", "Ostrava", "Olomouc"]),
    postalCode: `${faker.string.numeric(3)} ${faker.string.numeric(2)}`,
    street: faker.location.street(),
    houseNumber: faker.location.buildingNumber(),
  };
}

function pick<T>(arr: T[]): T {
  return faker.helpers.arrayElement(arr);
}

function _pickN<T>(arr: T[], min: number, max: number): T[] {
  return faker.helpers.arrayElements(arr, { min, max });
}

async function teardown() {
  console.log("Clearing existing seed data...");
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
  console.log("Done.");
}

async function insertAddress() {
  const [row] = await db.insert(addresses).values(czechAddress()).returning();
  if (!row) throw new Error("Address insert returned no rows");
  return row;
}

async function insertUser(override: { fname: string; lname: string }) {
  const addr = await insertAddress();
  const [row] = await db
    .insert(users)
    .values({
      clerkId: clerkId(),
      fname: override.fname,
      lname: override.lname,
      email: faker.internet
        .email({ firstName: override.fname, lastName: override.lname })
        .toLowerCase(),
      shippingAddressId: addr.id,
    })
    .returning();
  if (!row) throw new Error("User insert failed");
  return row;
}

async function insertWinemaker(userId: string) {
  const addr = await insertAddress();
  const [row] = await db
    .insert(winemakers)
    .values({
      userId,
      name: `${faker.company.name()} Winery`,
      description: faker.lorem.paragraph(),
      addressId: addr.id,
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number(),
    })
    .returning();
  if (!row) throw new Error("Winemaker insert failed");
  return row;
}

async function insertShop(ownerUserId: string) {
  const addr = await insertAddress();
  const [row] = await db
    .insert(shops)
    .values({
      ownerUserId,
      name: `${faker.company.name()} Wine Shop`,
      description: faker.lorem.paragraph(),
      addressId: addr.id,
    })
    .returning();
  if (!row) throw new Error("Shop insert failed");
  return row;
}

async function insertWines(winemakerId: string, count: number) {
  return await db
    .insert(wines)
    .values(
      Array.from({ length: count }, () => ({
        winemakerId,
        name: `${faker.commerce.productName()}`,
        description: faker.lorem.paragraph(),
        composition: "Grape",
        attribution: "Estate",
        region: "Moravia",
        vintageYear: 2022,
        type: "still" as const,
        color: "red" as const,
        alcoholContent: "12.5",
        volumeMl: 750,
        quantity: 100,
      }))
    )
    .returning();
}

async function insertProductsForShop(shopId: string, wineRows: (typeof wines.$inferSelect)[]) {
  const productsList = [];
  for (const wine of wineRows) {
    const [product] = await db
      .insert(products)
      .values({
        shopId,
        name: wine.name,
        price: "15.00",
        quantity: 50,
        isBundle: false,
      })
      .returning();
    if (product) {
      await db.insert(productWines).values({ productId: product.id, wineId: wine.id, quantity: 1 });
      productsList.push(product);
    }
  }
  return productsList;
}

async function insertEvents(winemakerId: string, count: number) {
  const rows = [];
  for (let i = 0; i < count; i++) {
    const addr = await insertAddress();
    const [row] = await db
      .insert(events)
      .values({
        winemakerId,
        name: `Tasting ${i}`,
        startTime: new Date(),
        endTime: new Date(),
        visibility: pick(["public", "private"] as const),
        inviteType: "open",
        addressId: addr.id,
        capacity: 50,
      })
      .returning();
    if (row) rows.push(row);
  }
  return rows;
}

async function main() {
  await teardown();

  const customers = await Promise.all(
    Array.from({ length: 2 }, () =>
      insertUser({ fname: faker.person.firstName(), lname: faker.person.lastName() })
    )
  );
  const victor = await insertUser({ fname: "Victor", lname: "W" });
  const wm = await insertWinemaker(victor.id);
  const shop = await insertShop(victor.id);
  const wineRows = await insertWines(wm.id, 2);
  const prodRows = await insertProductsForShop(shop.id, wineRows);
  await insertEvents(wm.id, 1);

  const firstProd = prodRows[0];
  if (firstProd) {
    for (const customer of customers) {
      const [review] = await db
        .insert(reviews)
        .values({
          userId: customer.id,
          entityId: firstProd.id,
          entityType: "product",
          rating: 5,
          body: "Nice",
        })
        .returning();
      if (review) {
        await db.insert(comments).values({
          userId: victor.id,
          reviewId: review.id,
          body: "Thanks!",
        });
      }
    }
  }
}

main().catch(console.error);
