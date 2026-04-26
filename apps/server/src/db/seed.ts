/**
 * Database seed script — populates the DB with randomised Faker data.
 */

import { faker } from "@faker-js/faker";
import { userRolesRepository } from "../modules/users/user-roles.repository";
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
      email: faker.internet
        .email({ firstName: override.fname, lastName: override.lname })
        .toLowerCase(),
      fname: override.fname,
      lname: override.lname,
      shippingAddressId: addr.id,
    })
    .returning();
  if (!row) throw new Error("User insert failed");
  // Assign customer role to all seeded users
  await userRolesRepository.addRole(row.id, "customer");
  return row;
}

async function insertWinemaker(userId: string) {
  const addr = await insertAddress();
  const [row] = await db
    .insert(winemakers)
    .values({
      addressId: addr.id,
      description: faker.lorem.paragraph(),
      email: faker.internet.email().toLowerCase(),
      name: `${faker.company.name()} Winery`,
      phone: faker.phone.number(),
      userId,
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
      addressId: addr.id,
      description: faker.lorem.paragraph(),
      name: `${faker.company.name()} Wine Shop`,
      ownerUserId,
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

async function insertProductsForShop(shopId: string, wineRows: (typeof wines.$inferSelect)[]) {
  const productsList = [];
  for (const wine of wineRows) {
    const [product] = await db
      .insert(products)
      .values({
        isBundle: false,
        name: wine.name,
        price: "15.00",
        quantity: 50,
        shopId,
      })
      .returning();
    if (product) {
      await db.insert(productWines).values({ productId: product.id, quantity: 1, wineId: wine.id });
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
        addressId: addr.id,
        capacity: 50,
        endTime: new Date(),
        inviteType: "open",
        name: `Tasting ${i}`,
        startTime: new Date(),
        visibility: pick(["public", "private"] as const),
        winemakerId,
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
          body: "Nice",
          entityId: firstProd.id,
          entityType: "product",
          rating: 5,
          userId: customer.id,
        })
        .returning();
      if (review) {
        await db.insert(comments).values({
          body: "Thanks!",
          reviewId: review.id,
          userId: victor.id,
        });
      }
    }
  }
}

// biome-ignore lint/suspicious/noConsole: entry point needs to log errors
main().catch(console.error);
