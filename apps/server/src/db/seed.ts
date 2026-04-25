/**
 * Database seed script — populates the DB with randomised Faker data.
 *
 * Run with:  bun run db:seed
 *
 * Notes:
 *  - SEED_FAKER_SEED env var pins the random generator for reproducible runs (e.g. CI).
 *  - Users are inserted with synthetic clerkId values (format: user_seed_<uuid>).
 *    These do NOT correspond to real Clerk accounts. The seed is for local UI dev
 *    and query testing only — real auth still flows through Clerk's own sign-in.
 *  - Existing seed data is wiped before re-seeding (idempotent).
 *
 * Story seeded:
 *   Admin Alice          — platform admin
 *   Winemaker Victor     — produces 6 wines, hosts 2 events
 *   Winemaker + Shop Owner Daria — produces 3 wines, owns 2 shops
 *   Shop Owner Sophie    — owns 1 shop (sources from both Victor and Daria)
 *   Customers × 3       — have carts, orders, reviews
 */

import { faker } from "@faker-js/faker";
import { inArray } from "drizzle-orm";
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
  productReviews,
  products,
  productWines,
  roleRequests,
  shops,
  users,
  winemakerReviews,
  winemakers,
  wines,
} from "./schema";

// ─── Reproducibility ──────────────────────────────────────────────────────────

const seed = process.env.SEED_FAKER_SEED ? Number(process.env.SEED_FAKER_SEED) : undefined;
if (seed !== undefined) {
  faker.seed(seed);
  console.log(`Faker seed: ${seed}`);
} else {
  console.log("Faker seed: random (set SEED_FAKER_SEED=<number> for reproducible runs)");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clerkId() {
  // Synthetic Clerk-style ID — safe marker so they're identifiable
  return `user_seed_${faker.string.alphanumeric(24)}`;
}

function czechAddress() {
  return {
    country: "Czech Republic",
    city: faker.helpers.arrayElement([
      "Praha",
      "Brno",
      "Ostrava",
      "Olomouc",
      "Plzeň",
      "Liberec",
      "Zlín",
      "Znojmo",
      "Mikulov",
    ]),
    postalCode: `${faker.string.numeric({ length: 3 })} ${faker.string.numeric({ length: 2 })}`,
    street: faker.location.street(),
    houseNumber: faker.location.buildingNumber(),
  };
}

function wineRegion() {
  return faker.helpers.arrayElement([
    "Moravská zemská",
    "Česká zemská",
    "Znojemská",
    "Mikulovská",
    "Velkopavlovická",
    "Slovácká",
    "Litoměřická",
    "Mělnická",
  ]);
}

function pick<T>(arr: T[]): T {
  return faker.helpers.arrayElement(arr);
}

function pickN<T>(arr: T[], min: number, max: number): T[] {
  return faker.helpers.arrayElements(arr, { min, max });
}

// ─── Teardown (reverse dependency order) ──────────────────────────────────────

async function teardown() {
  console.log("Clearing existing seed data...");
  await db.delete(winemakerReviews);
  await db.delete(productReviews);
  await db.delete(comments);
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

// ─── Factories ────────────────────────────────────────────────────────────────

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
  if (!row) throw new Error("User insert returned no rows");
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
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number({ style: "international" }),
      websiteUrl: faker.internet.url(),
      addressId: addr.id,
    })
    .returning();
  if (!row) throw new Error("Winemaker insert returned no rows");
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
  if (!row) throw new Error("Shop insert returned no rows");
  return row;
}

async function insertWines(winemakerId: string, count: number) {
  const grapes = [
    "Welschriesling",
    "Müller-Thurgau",
    "Frankovka",
    "Dornfelder",
    "Rulandské modré",
    "Sauvignon",
    "Chardonnay",
    "Ryzlink vlašský",
    "Cabernet Moravia",
    "André",
    "Tramín červený",
  ];

  const rows = await db
    .insert(wines)
    .values(
      Array.from({ length: count }, () => ({
        winemakerId,
        name: `${pick(grapes)} ${faker.date.past({ years: 5 }).getFullYear()}`,
        description: faker.lorem.paragraph(),
        composition: pick(grapes),
        attribution: faker.lorem.sentence(),
        region: wineRegion(),
        vintageYear: faker.number.int({ min: 2018, max: 2024 }),
        type: pick(["still", "sparkling", "fortified", "dessert"] as const),
        color: pick(["red", "white", "rosé", "orange"] as const),
        alcoholContent: faker.number.float({ min: 9, max: 15, fractionDigits: 1 }).toFixed(2),
        volumeMl: pick([375, 500, 750, 1500]),
        quantity: faker.number.int({ min: 50, max: 500 }),
      }))
    )
    .returning();
  return rows;
}

async function insertProductsForShop(shopId: string, wineRows: (typeof wines.$inferSelect)[]) {
  const selected = pickN(wineRows, 2, Math.min(5, wineRows.length));
  const insertedProducts: (typeof products.$inferSelect)[] = [];

  for (const wine of selected) {
    const [product] = await db
      .insert(products)
      .values({
        shopId,
        name: wine.name,
        description: faker.commerce.productDescription(),
        price: faker.number.float({ min: 8, max: 60, fractionDigits: 2 }).toFixed(2),
        quantity: faker.number.int({ min: 5, max: 80 }),
        isBundle: false,
      })
      .returning();
    if (!product) continue;

    await db.insert(productWines).values({
      productId: product.id,
      wineId: wine.id,
      quantity: 1,
    });

    insertedProducts.push(product);
  }

  // One bundle per shop using 2-3 of the listed wines
  if (insertedProducts.length >= 2) {
    const bundleWines = pickN(insertedProducts, 2, Math.min(3, insertedProducts.length));
    const [bundle] = await db
      .insert(products)
      .values({
        shopId,
        name: `${faker.commerce.productAdjective()} Wine Bundle`,
        description: faker.lorem.sentence(),
        price: faker.number.float({ min: 25, max: 120, fractionDigits: 2 }).toFixed(2),
        quantity: faker.number.int({ min: 3, max: 20 }),
        isBundle: true,
      })
      .returning();
    if (bundle) {
      const bundleWineRows = await db
        .select()
        .from(productWines)
        .where(
          inArray(
            productWines.productId,
            bundleWines.map((p) => p.id)
          )
        );

      for (const pw of bundleWineRows) {
        await db.insert(productWines).values({
          productId: bundle.id,
          wineId: pw.wineId,
          quantity: 1,
        });
      }
      insertedProducts.push(bundle);
    }
  }

  return insertedProducts;
}

async function insertEvents(winemakerId: string, count: number) {
  const rows: (typeof events.$inferSelect)[] = [];
  for (let i = 0; i < count; i++) {
    const addr = await insertAddress();
    const start = faker.date.future({ years: 1 });
    const end = new Date(start.getTime() + faker.number.int({ min: 2, max: 8 }) * 3_600_000);
    const [row] = await db
      .insert(events)
      .values({
        winemakerId,
        name: `${faker.company.buzzAdjective()} Wine ${pick(["Tasting", "Festival", "Evening", "Tour", "Harvest"])}`,
        description: faker.lorem.paragraph(),
        addressId: addr.id,
        startTime: start,
        endTime: end,
        inviteType: pick(["open", "invite_only"]),
        visibility: pick(["public", "private"] as const),
      })
      .returning();
    if (row) rows.push(row);
  }
  return rows;
}

async function insertCart(userId: string, availableProducts: (typeof products.$inferSelect)[]) {
  const [cart] = await db.insert(carts).values({ userId }).returning();
  if (!cart || availableProducts.length === 0) return;

  const items = pickN(availableProducts, 1, Math.min(4, availableProducts.length));
  for (const product of items) {
    await db.insert(cartItems).values({
      cartId: cart.id,
      productId: product.id,
      quantity: faker.number.int({ min: 1, max: 3 }),
    });
  }
}

async function insertOrder(
  userId: string,
  shopId: string,
  shopProducts: (typeof products.$inferSelect)[]
) {
  if (shopProducts.length === 0) return;

  const addr = await insertAddress();
  const billing = await insertAddress();
  const selectedProducts = pickN(shopProducts, 1, Math.min(3, shopProducts.length));

  const total = selectedProducts.reduce((sum, p) => sum + Number.parseFloat(p.price), 0);

  const [order] = await db
    .insert(orders)
    .values({
      userId,
      shippingFee: "4.90",
      discount: "0.00",
      paymentStatus: pick(["captured", "pending"] as const),
      paymentMethod: pick(["card", "bank_transfer"] as const),
      totalPrice: (total + 4.9).toFixed(2),
      status: pick(["pending", "confirmed", "shipped", "delivered"] as const),
      deliveryType: pick(["shipping", "pickup"] as const),
      shippingAddressId: addr.id,
      billingAddressId: billing.id,
    })
    .returning();
  if (!order) return;

  for (const product of selectedProducts) {
    await db.insert(orderItems).values({
      orderId: order.id,
      shopId,
      productId: product.id,
      quantity: faker.number.int({ min: 1, max: 2 }),
      unitPriceAtPurchase: product.price,
    });
  }

  return order;
}

async function insertAvailability(shopId: string) {
  const days = faker.helpers.arrayElements([1, 2, 3, 4, 5, 6, 0], { min: 3, max: 6 });
  for (const dow of days) {
    const openHour = faker.number.int({ min: 9, max: 11 });
    const closeHour = faker.number.int({ min: 17, max: 20 });
    const base = new Date();
    const open = new Date(base);
    open.setHours(openHour, 0, 0, 0);
    const close = new Date(base);
    close.setHours(closeHour, 0, 0, 0);

    await db.insert(availabilityRegular).values({
      shopId,
      dow,
      startTime: open,
      endTime: close,
      validFrom: new Date().toISOString().slice(0, 10),
      type: "open",
    });
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await teardown();

  console.log("\nSeeding...");

  // ── Users ──────────────────────────────────────────────────────────────────
  const admin = await insertUser({ fname: "Alice", lname: "Admin" });
  const victorUser = await insertUser({ fname: "Victor", lname: faker.person.lastName() });
  const dariaUser = await insertUser({ fname: "Daria", lname: faker.person.lastName() });
  const sophieUser = await insertUser({ fname: "Sophie", lname: faker.person.lastName() });
  const customers = await Promise.all(
    Array.from({ length: 3 }, () =>
      insertUser({ fname: faker.person.firstName(), lname: faker.person.lastName() })
    )
  );

  console.log(`  Users: ${3 + customers.length + 1} created`);

  // ── Winemakers ─────────────────────────────────────────────────────────────
  const victorWinemaker = await insertWinemaker(victorUser.id);
  const dariaWinemaker = await insertWinemaker(dariaUser.id);

  console.log("  Winemakers: 2 created (Victor, Daria)");

  // ── Shops ──────────────────────────────────────────────────────────────────
  const dariaShop1 = await insertShop(dariaUser.id);
  const dariaShop2 = await insertShop(dariaUser.id);
  const sophieShop = await insertShop(sophieUser.id);

  await Promise.all([
    insertAvailability(dariaShop1.id),
    insertAvailability(dariaShop2.id),
    insertAvailability(sophieShop.id),
  ]);

  console.log("  Shops: 3 created (2 × Daria, 1 × Sophie)");

  // ── Wines ──────────────────────────────────────────────────────────────────
  const victorWines = await insertWines(victorWinemaker.id, 6);
  const dariaWines = await insertWines(dariaWinemaker.id, 3);
  const allWines = [...victorWines, ...dariaWines];

  console.log(`  Wines: ${allWines.length} created`);

  // ── Products ───────────────────────────────────────────────────────────────
  const dariaShop1Products = await insertProductsForShop(dariaShop1.id, victorWines);
  const dariaShop2Products = await insertProductsForShop(dariaShop2.id, dariaWines);
  const sophieShopProducts = await insertProductsForShop(sophieShop.id, allWines);
  const allProducts = [...dariaShop1Products, ...dariaShop2Products, ...sophieShopProducts];

  console.log(`  Products: ${allProducts.length} created (incl. bundles)`);

  // ── Events ─────────────────────────────────────────────────────────────────
  const victorEvents = await insertEvents(victorWinemaker.id, 2);
  const dariaEvents = await insertEvents(dariaWinemaker.id, 1);
  const allEvents = [...victorEvents, ...dariaEvents];

  console.log(`  Events: ${allEvents.length} created`);

  // ── Carts (one per customer) ────────────────────────────────────────────────
  for (const customer of customers) {
    if (faker.datatype.boolean()) {
      await insertCart(customer.id, allProducts);
    }
  }

  // ── Orders ─────────────────────────────────────────────────────────────────
  let orderCount = 0;
  for (const customer of customers) {
    const shopPairs: [string, (typeof products.$inferSelect)[]][] = [
      [dariaShop1.id, dariaShop1Products],
      [sophieShop.id, sophieShopProducts],
    ];
    for (const [shopId, shopProds] of pickN(shopPairs, 1, 2)) {
      const order = await insertOrder(customer.id, shopId, shopProds);
      if (order) orderCount++;
    }
  }

  console.log(`  Orders: ${orderCount} created`);

  // ── Reviews ────────────────────────────────────────────────────────────────
  let reviewCount = 0;
  for (const customer of customers) {
    for (const product of pickN(
      allProducts.filter((p) => !p.isBundle),
      1,
      3
    )) {
      await db.insert(productReviews).values({
        userId: customer.id,
        productId: product.id,
        rating: faker.number.int({ min: 1, max: 5 }),
        body: faker.helpers.maybe(() => faker.lorem.sentences(2)),
      });
      reviewCount++;
    }
    for (const winemaker of pickN([victorWinemaker, dariaWinemaker], 1, 2)) {
      await db.insert(winemakerReviews).values({
        userId: customer.id,
        winemakerId: winemaker.id,
        rating: faker.number.int({ min: 3, max: 5 }),
        body: faker.helpers.maybe(() => faker.lorem.sentences(2)),
      });
      reviewCount++;
    }
  }

  console.log(`  Reviews: ${reviewCount} created`);

  // ── Comments ───────────────────────────────────────────────────────────────
  let commentCount = 0;
  for (const event of allEvents) {
    for (const customer of pickN(customers, 1, customers.length)) {
      await db.insert(comments).values({
        eventId: event.id,
        userId: customer.id,
        body: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
      });
      commentCount++;
    }
  }

  console.log(`  Comments: ${commentCount} created`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log(`
Seed complete.

  Admin:     ${admin.fname} ${admin.lname} (${admin.email})
  Winemaker: ${victorUser.fname} ${victorUser.lname} — ${victorWinemaker.name}
  Winemaker + Shop Owner: ${dariaUser.fname} ${dariaUser.lname} — ${dariaWinemaker.name}
  Shop Owner: ${sophieUser.fname} ${sophieUser.lname} — ${sophieShop.name}
  Customers:  ${customers.map((c) => `${c.fname} ${c.lname}`).join(", ")}
`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
