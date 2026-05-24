<<<<<<< HEAD
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { faker } from "@faker-js/faker";
import { logger } from "../utils/logger";
import {
  type AddressInput,
  type AvailabilityExceptionInput,
  type AvailabilityInput,
  type CommentInput,
  type EventCommentInput,
  type EventInput,
  type ImageInput,
  type OrderInput,
  type OrderItemInput,
  type ProductInput,
  type ReviewInput,
  type ShopInput,
  type UserInput,
  type WineInput,
  type WinemakerId,
  insertAddresses,
  insertAvailabilityExceptions,
  insertAvailabilityRegular,
  insertComments,
  insertEventComments,
  insertEventRegistrations,
  insertEvents,
  insertImages,
  insertOrderItems,
  insertOrders,
  insertProductWines,
  insertProducts,
  insertReviews,
  insertRoleRequests,
  insertShops,
  insertSupplyAgreements,
  insertUserRoles,
  insertUsers,
  insertWinemakers,
  insertWines,
  teardown,
} from "./seed.lib";

const seed = process.env.SEED_FAKER_SEED ? Number(process.env.SEED_FAKER_SEED) : undefined;
if (seed !== undefined) faker.seed(seed);
=======
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
import { db } from "./index";

const seed = process.env.SEED_FAKER_SEED ? Number(process.env.SEED_FAKER_SEED) : undefined;
if (seed !== undefined) {
  faker.seed(seed);
}
>>>>>>> origin/main

function clerkId() {
  return `user_seed_${faker.string.alphanumeric(24)}`;
}

<<<<<<< HEAD
function czechAddress(): AddressInput {
  return {
    city: faker.helpers.arrayElement(["Praha", "Brno", "Ostrava", "Olomouc", "Plzeň", "Liberec"]),
=======
function czechAddress() {
  return {
    city: faker.helpers.arrayElement(["Praha", "Brno", "Ostrava", "Olomouc"]),
>>>>>>> origin/main
    country: "Czech Republic",
    houseNumber: faker.location.buildingNumber(),
    postalCode: `${faker.string.numeric(3)} ${faker.string.numeric(2)}`,
    street: faker.location.street(),
  };
}

<<<<<<< HEAD
function pick<T>(arr: readonly T[]): T {
  return faker.helpers.arrayElement(arr as T[]);
}

const VARIETIES = [
  "Pálava",
  "Welschriesling",
  "Frankovka",
  "Müller-Thurgau",
  "Rulandské šedé",
  "Zweigeltrebe",
  "Sauvignon",
  "Neuburské",
  "Modrý Portugal",
  "Ryzlink vlašský",
  "Chardonnay",
  "Pinot Noir",
  "Cabernet Sauvignon",
  "Merlot",
  "Riesling",
  "Grüner Veltliner",
  "Syrah",
  "Sangiovese",
  "Hibernal",
  "André",
  "Dornfelder",
  "Regent",
  "Tramín červený",
  "Rulandské modré",
] as const;

const NAME_SUFFIXES = ["Estate", "Reserve", "Selection", "Classic", "Premium", "Old Vine"] as const;

function copyPlaceholders() {
  const seedDir = fileURLToPath(new URL(".", import.meta.url));
  const placeholdersDir = join(seedDir, "seeding_images", "placeholders");
  const uploadsDir = fileURLToPath(new URL("../../../uploads", import.meta.url));

  const placeholders = [
    { src: "wine_placeholder.webp", type: "wine" },
    { src: "winery_placeholder.webp", type: "winemaker" },
    { src: "shop_placeholder.webp", type: "shop" },
    { src: "event_placeholder.webp", type: "event" },
    { src: "user_placeholder.webp", type: "user" },
  ];

  for (const { src, type } of placeholders) {
    const destDir = join(uploadsDir, type);
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
    const dest = join(destDir, src);
    if (existsSync(dest)) continue;
    const srcPath = join(placeholdersDir, src);
    if (existsSync(srcPath)) copyFileSync(srcPath, dest);
  }
}

async function main() {
  copyPlaceholders();
  await teardown();

  const NUM_USERS = Number(process.env.SEED_NUM_USERS) || 100;
  const NUM_WINEMAKERS =
    Number(process.env.SEED_NUM_WINEMAKERS) || Math.max(1, Math.floor(NUM_USERS * 0.05));
  const TOTAL_WINES = Number(process.env.SEED_TOTAL_WINES) || 500;
  const WINES_PER_WINEMAKER =
    Number(process.env.SEED_WINES_PER_WINEMAKER) || Math.ceil(TOTAL_WINES / NUM_WINEMAKERS);
  const SHOPS_PER_WINEMAKER = Number(process.env.SEED_SHOPS_PER_WINEMAKER) || 1;
  const EVENTS_PER_WINEMAKER = Number(process.env.SEED_EVENTS_PER_WINEMAKER) || 1;

  logger.info(
    { NUM_USERS, NUM_WINEMAKERS, WINES_PER_WINEMAKER, SHOPS_PER_WINEMAKER, EVENTS_PER_WINEMAKER },
    "Seeding counts",
  );

  // ── Users ──────────────────────────────────────────────────────────────────
  logger.info("Inserting users...");
  const addrRows = await insertAddresses(
    Array.from({ length: NUM_USERS }, () => czechAddress()),
  );
  const userInputs: UserInput[] = Array.from({ length: NUM_USERS }, (_, i) => {
    const fname = faker.person.firstName().slice(0, 30);
    const lname = faker.person.lastName().slice(0, 30);
    return {
      clerkId: clerkId(),
      email: faker.internet.email({ firstName: fname, lastName: lname }).toLowerCase(),
      fname,
      lname,
      shippingAddressId: addrRows[i]?.id,
    };
  });
  const customers = await insertUsers(userInputs);
  logger.info(`Inserted ${customers.length} users`);

  // ── Winemakers ─────────────────────────────────────────────────────────────
  logger.info("Inserting winemakers...");
  const wmUserPool = Array.from({ length: NUM_WINEMAKERS }, () => pick(customers));
  const uniqueWmOwners = Array.from(new Map(wmUserPool.map((u) => [u.id, u])).values());
  const wmAddrRows = await insertAddresses(uniqueWmOwners.map(() => czechAddress()));
  const winemakerInputs: WinemakerId[] = uniqueWmOwners.map((user, i) => ({
    userId: user.id,
    name: `${faker.company.name()} Winery`,
    description: faker.lorem.paragraph(),
    addressId: wmAddrRows[i]!.id,
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number(),
  }));
  const winemakerRows = await insertWinemakers(winemakerInputs);
  logger.info(`Inserted ${winemakerRows.length} winemakers`);

  // ── Shops ──────────────────────────────────────────────────────────────────
  logger.info("Inserting shops...");
  const shopOwnerUsers = winemakerRows.flatMap((wm) =>
    Array.from({ length: SHOPS_PER_WINEMAKER }, () => {
      const owner = customers.find((u) => u.id === wm.userId);
      return owner ?? customers[0]!;
    }),
  );
  const shopAddrRows = await insertAddresses(shopOwnerUsers.map(() => czechAddress()));
  const shopInputs: ShopInput[] = shopOwnerUsers.map((owner, i) => ({
    ownerUserId: owner.id,
    name: `${faker.company.name()} Wine Shop`,
    description: faker.lorem.paragraph(),
    addressId: shopAddrRows[i]!.id,
  }));
  const shopRows = await insertShops(shopInputs);
  logger.info(`Inserted ${shopRows.length} shops`);

  // ── Wines & Products ───────────────────────────────────────────────────────
  logger.info("Inserting wines and products...");
  const COLORS = ["red", "white", "rosé", "orange"] as const;
  const TYPES = ["still", "sparkling", "fortified", "dessert"] as const;
  const REGIONS = [
    "Mikulovská",
    "Velkopavlovická",
    "Znojemská",
    "Slovácká",
    "Čechy",
    "Mělník",
    "Austria",
    "France",
    "Italy",
  ] as const;

  let totalWineCount = 0;
  const allProducts: { id: string; price: string; shopId: string }[] = [];
  const winemakerWinesMap = new Map<string, { id: string }[]>();
  const allWineIds: string[] = [];
  const allEventIds: string[] = [];

  for (let i = 0; i < winemakerRows.length; i++) {
    const wm = winemakerRows[i]!;

    // Fix 4: unique wine names per winemaker
    const usedNames = new Set<string>();
    const wineInputs: WineInput[] = Array.from({ length: WINES_PER_WINEMAKER }, () => {
      const variety = pick(VARIETIES);
      const vintageYear = faker.number.int({ min: 2015, max: 2023 });
      const isBlend = Math.random() < 0.25;
      let name = `${variety} ${vintageYear}`;
      if (usedNames.has(name)) {
        name = `${variety} ${pick(NAME_SUFFIXES)} ${vintageYear}`;
      }
      usedNames.add(name);
      return {
        winemakerId: wm.id,
        name,
        color: pick(COLORS),
        type: pick(TYPES),
        region: pick(REGIONS),
        vintageYear,
        alcoholContent: faker.number.float({ min: 9, max: 16, fractionDigits: 1 }).toFixed(2),
        volumeMl: pick([375, 750, 1500] as const),
        quantity: faker.number.int({ min: 10, max: 500 }),
        attribution: faker.helpers.arrayElement(["Estate", "Single Vineyard", "Reserve", "Grand Cru"]),
        composition: isBlend
          ? `${pick(VARIETIES)}, ${pick(VARIETIES)}`
          : `100% ${variety}`,
        description: faker.lorem.paragraph(),
      };
    });
    const insertedWines = await insertWines(wineInputs);
    totalWineCount += insertedWines.length;
    winemakerWinesMap.set(wm.id, insertedWines.map((w) => ({ id: w.id })));
    allWineIds.push(...insertedWines.map((w) => w.id));

    const shop = shopRows[i * SHOPS_PER_WINEMAKER];
    if (shop) {
      const productInputs: ProductInput[] = insertedWines.map((wine) => ({
        shopId: shop.id,
        name: wine.name,
        price: faker.commerce.price({ min: 8, max: 120 }),
        quantity: faker.number.int({ min: 5, max: 200 }),
        isBundle: Math.random() < 0.15,
        description: faker.lorem.sentence(),
      }));
      const insertedProducts = await insertProducts(productInputs);

      const productWineRows: { productId: string; wineId: string; quantity: number }[] = [];
      const wmWines = winemakerWinesMap.get(wm.id) ?? [];
      for (const [j, product] of insertedProducts.entries()) {
        const primaryWineId = insertedWines[j]!.id;
        productWineRows.push({ productId: product.id, wineId: primaryWineId, quantity: 1 });
        if (product.isBundle && wmWines.length > 1) {
          const extraCount = faker.number.int({ min: 1, max: Math.min(3, wmWines.length - 1) });
          const extras = faker.helpers.arrayElements(
            wmWines.filter((w) => w.id !== primaryWineId),
            extraCount,
          );
          for (const extra of extras) {
            productWineRows.push({ productId: product.id, wineId: extra.id, quantity: 1 });
          }
        }
      }
      await insertProductWines(productWineRows);
      allProducts.push(...insertedProducts.map((p) => ({ id: p.id, price: p.price, shopId: shop.id })));
    }

    if ((i + 1) % 10 === 0)
      logger.info(`Processed winemaker ${i + 1}/${winemakerRows.length}`);
  }
  logger.info(`Inserted ${totalWineCount} wines`);

  // ── Events ─────────────────────────────────────────────────────────────────
  logger.info("Inserting events...");
  const eventAddrRows = await insertAddresses(
    winemakerRows.flatMap(() =>
      Array.from({ length: EVENTS_PER_WINEMAKER }, () => czechAddress()),
    ),
  );
  const eventInputs: EventInput[] = winemakerRows.flatMap((wm, wmIdx) =>
    Array.from({ length: EVENTS_PER_WINEMAKER }, (_, evIdx) => {
      const addrIdx = wmIdx * EVENTS_PER_WINEMAKER + evIdx;
      const startTime = pick([
        faker.date.past(),
        faker.date.future(),
        faker.date.soon({ days: 30 }),
      ]);
      return {
        winemakerId: wm.id,
        addressId: eventAddrRows[addrIdx]!.id,
        name: `${faker.word.adjective()} Wine ${pick(["Evening", "Tasting", "Experience", "Tour"] as const)}`,
        description: faker.lorem.sentences(2),
        startTime,
        endTime: new Date(
          startTime.getTime() + faker.number.int({ min: 2, max: 5 }) * 3_600_000,
        ),
        capacity: faker.number.int({ min: 10, max: 100 }),
        visibility: pick(["public", "private"] as const),
        inviteType: "open",
        status: pick(["pending", "approved"] as const),
      };
    }),
  );
  const insertedEvents = await insertEvents(eventInputs);
  allEventIds.push(...insertedEvents.map((e) => e.id));
  logger.info(`Inserted ${insertedEvents.length} events`);

  // Fix 2: deduplicated event registrations
  if (insertedEvents.length > 0) {
    logger.info("Inserting event registrations...");
    const registrationPool = faker.helpers.arrayElements(
      customers,
      Math.floor(customers.length * 0.3),
    );
    const regKeys = new Set<string>();
    const registrationInputs = registrationPool
      .map((user) => ({ eventId: pick(insertedEvents).id, userId: user.id }))
      .filter(({ eventId, userId }) => {
        const key = `${eventId}-${userId}`;
        if (regKeys.has(key)) return false;
        regKeys.add(key);
        return true;
      });
    await insertEventRegistrations(registrationInputs);
    logger.info(`Inserted ${registrationInputs.length} event registrations`);

    // Event comments — ~40% of events get 2–6 comments from random users
    logger.info("Inserting event comments...");
    const commentableEvents = faker.helpers.arrayElements(
      insertedEvents,
      Math.ceil(insertedEvents.length * 0.4),
    );
    const eventCommentInputs: EventCommentInput[] = commentableEvents.flatMap((event) =>
      Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () => ({
        eventId: event.id,
        userId: pick(customers).id,
        body: faker.lorem.sentences({ min: 1, max: 3 }),
      })),
    );
    await insertEventComments(eventCommentInputs);
    logger.info(`Inserted ${eventCommentInputs.length} event comments`);
  }

  // ── UserRoles ──────────────────────────────────────────────────────────────
  logger.info("Inserting user roles...");
  const userRoleInputs: { userId: string; role: string }[] = [];
  for (const wm of winemakerRows) {
    userRoleInputs.push({ userId: wm.userId, role: "winemaker" });
  }
  for (const shop of shopRows) {
    if (!userRoleInputs.some((r) => r.userId === shop.ownerUserId && r.role === "shop_owner")) {
      userRoleInputs.push({ userId: shop.ownerUserId, role: "shop_owner" });
    }
  }
  await insertUserRoles(userRoleInputs);
  logger.info(`Inserted ${userRoleInputs.length} user roles`);

  // ── Availability ───────────────────────────────────────────────────────────
  logger.info("Inserting availability...");
  const today = new Date();
  const validFrom = today.toISOString().slice(0, 10);
  const availInputs: AvailabilityInput[] = shopRows.flatMap((shop) => {
    const openHour = faker.number.int({ min: 8, max: 10 });
    const closeHour = faker.number.int({ min: 17, max: 20 });
    const hasSaturday = Math.random() < 0.6;
    const hasSunday = Math.random() < 0.2;
    const makeSlot = (dow: number, open: number, close: number): AvailabilityInput => {
      const start = new Date(today);
      start.setHours(open, 0, 0, 0);
      const end = new Date(today);
      end.setHours(close, 0, 0, 0);
      return { shopId: shop.id, dow, startTime: start, endTime: end, type: "open", validFrom };
    };
    return [
      ...[1, 2, 3, 4, 5].map((dow) => makeSlot(dow, openHour, closeHour)),
      ...(hasSaturday ? [makeSlot(6, openHour + 1, closeHour - 1)] : []),
      ...(hasSunday ? [makeSlot(0, 10, 16)] : []),
    ];
  });
  await insertAvailabilityRegular(availInputs);
  logger.info(`Inserted ${availInputs.length} availability rows`);

  // Availability exceptions — ~50% of shops have 1–3 holiday/special closures
  const exceptionReasons = ["Public holiday", "Staff training", "Renovation", "Private event", "Inventory"] as const;
  const exceptionInputs: AvailabilityExceptionInput[] = shopRows.flatMap((shop) => {
    if (Math.random() < 0.5) return [];
    const count = faker.number.int({ min: 1, max: 3 });
    return Array.from({ length: count }, () => {
      const startsAt = faker.date.soon({ days: 90 });
      return {
        shopId: shop.id,
        startsAt,
        endsAt: new Date(startsAt.getTime() + faker.number.int({ min: 4, max: 24 }) * 3_600_000),
        action: pick(["closed", "modified_hours"] as const),
        reason: pick(exceptionReasons),
      };
    });
  });
  await insertAvailabilityExceptions(exceptionInputs);
  logger.info(`Inserted ${exceptionInputs.length} availability exceptions`);

  // ── Supply Agreements ──────────────────────────────────────────────────────
  // Fix 6: deduplicate shop-winemaker pairs
  logger.info("Inserting supply agreements...");
  const supplyKeys = new Set<string>();
  const supplyInputs = shopRows
    .map((shop) => ({
      shopId: shop.id,
      winemakerId: pick(winemakerRows).id,
      status: "approved" as const,
    }))
    .filter(({ shopId, winemakerId }) => {
      const key = `${shopId}-${winemakerId}`;
      if (supplyKeys.has(key)) return false;
      supplyKeys.add(key);
      return true;
    });
  await insertSupplyAgreements(supplyInputs);
  logger.info(`Inserted ${supplyInputs.length} supply agreements`);

  // ── Reviews ────────────────────────────────────────────────────────────────
  // Fix 1: deduplicate user-entity pairs (one review per user per entity)
  logger.info("Inserting reviews...");
  const reviewKeys = new Set<string>();
  const reviewInputs: ReviewInput[] = [];

  const productReviewers = faker.helpers.arrayElements(
    customers,
    Math.floor(customers.length * 0.4),
  );
  for (const reviewer of productReviewers) {
    const product = pick(allProducts);
    const key = `${reviewer.id}-product-${product.id}`;
    if (reviewKeys.has(key)) continue;
    reviewKeys.add(key);
    reviewInputs.push({
      userId: reviewer.id,
      entityType: "product",
      entityId: product.id,
      rating: faker.number.int({ min: 1, max: 5 }),
      body: faker.lorem.sentences({ min: 1, max: 3 }),
    });
  }
  const wmReviewers = faker.helpers.arrayElements(
    customers,
    Math.floor(customers.length * 0.2),
  );
  for (const reviewer of wmReviewers) {
    const wm = pick(winemakerRows);
    const key = `${reviewer.id}-winemaker-${wm.id}`;
    if (reviewKeys.has(key)) continue;
    reviewKeys.add(key);
    reviewInputs.push({
      userId: reviewer.id,
      entityType: "winemaker",
      entityId: wm.id,
      rating: faker.number.int({ min: 1, max: 5 }),
      body: faker.lorem.sentences({ min: 1, max: 3 }),
    });
  }
  const insertedReviews = await insertReviews(reviewInputs);
  logger.info(`Inserted ${insertedReviews.length} reviews`);

  // ── Comments ───────────────────────────────────────────────────────────────
  logger.info("Inserting comments...");
  const commentInputs: CommentInput[] = faker.helpers
    .arrayElements(insertedReviews, Math.floor(insertedReviews.length * 0.3))
    .flatMap((review) =>
      Array.from({ length: faker.number.int({ min: 1, max: 2 }) }, () => ({
        reviewId: review.id,
        userId: pick(customers).id,
        body: faker.lorem.sentences({ min: 1, max: 2 }),
      })),
    );
  await insertComments(commentInputs);
  logger.info(`Inserted ${commentInputs.length} comments`);

  // ── Orders + Order Items ───────────────────────────────────────────────────
  // Fix 5: realistic status distribution including pending and cancelled
  logger.info("Inserting orders and order items...");
  const shopProductMap = new Map<string, { id: string; price: string }[]>();
  for (const p of allProducts) {
    const existing = shopProductMap.get(p.shopId) ?? [];
    existing.push({ id: p.id, price: p.price });
    shopProductMap.set(p.shopId, existing);
  }
  const shopEntries = [...shopProductMap.entries()];

  if (shopEntries.length > 0) {
    const buyerPool = faker.helpers.arrayElements(
      customers,
      Math.floor(customers.length * 0.3),
    );
    const orderAddrRows = await insertAddresses(
      buyerPool.flatMap(() => [czechAddress(), czechAddress()]),
    );

    type PendingItem = { productId: string; shopId: string; quantity: number; unitPriceAtPurchase: string };
    type PendingOrder = { input: OrderInput; items: PendingItem[] };

    const pending: PendingOrder[] = buyerPool.map((buyer, i) => {
      const [shopId, shopProducts] = pick(shopEntries);
      const itemCount = faker.number.int({ min: 1, max: 4 });
      const pickedProds = faker.helpers.arrayElements(
        shopProducts,
        Math.min(itemCount, shopProducts.length),
      );
      const shippingFee = pick(["0.00", "5.00", "10.00"] as const);

      // Fix 5: realistic order status spread
      const roll = Math.random();
      const status =
        roll < 0.15 ? ("pending" as const) :
        roll < 0.25 ? ("cancelled" as const) :
        pick(["confirmed", "shipped", "delivered"] as const);
      const paymentStatus =
        status === "cancelled" ? ("cancelled" as const) :
        status === "pending"   ? ("pending" as const) :
        ("captured" as const);

      let itemsTotal = 0;
      const items: PendingItem[] = pickedProds.map((prod) => {
        const qty = faker.number.int({ min: 1, max: 3 });
        itemsTotal += qty * Number.parseFloat(prod.price);
        return { productId: prod.id, shopId, quantity: qty, unitPriceAtPurchase: prod.price };
      });
      const totalPrice = (itemsTotal + Number.parseFloat(shippingFee)).toFixed(2);

      return {
        input: {
          userId: buyer.id,
          shippingAddressId: orderAddrRows[i * 2]!.id,
          billingAddressId: orderAddrRows[i * 2 + 1]!.id,
          status,
          deliveryType: pick(["pickup", "shipping"] as const),
          paymentMethod: pick(["card", "bank_transfer", "cash_on_delivery"] as const),
          paymentStatus,
          totalPrice,
          discount: "0.00",
          shippingFee,
        },
        items,
      };
    });

    const insertedOrders = await insertOrders(pending.map((p) => p.input));
    const orderItemInputs: OrderItemInput[] = insertedOrders.flatMap((order, i) =>
      (pending[i]?.items ?? []).map((item) => ({ ...item, orderId: order.id })),
    );
    await insertOrderItems(orderItemInputs);
    logger.info(
      `Inserted ${insertedOrders.length} orders with ${orderItemInputs.length} order items`,
    );
  }

  // ── Role Requests ──────────────────────────────────────────────────────────
  // Fix 3: exclude users who already have the role they're requesting
  logger.info("Inserting role requests...");
  const assignedRoles = new Set(userRoleInputs.map((r) => `${r.userId}-${r.role}`));
  const eligibleForRoleReq = customers.filter(
    (u) =>
      !assignedRoles.has(`${u.id}-winemaker`) &&
      !assignedRoles.has(`${u.id}-shop_owner`),
  );
  if (eligibleForRoleReq.length > 0) {
    const roleReqPool = faker.helpers.arrayElements(
      eligibleForRoleReq,
      Math.min(10, eligibleForRoleReq.length),
    );
    await insertRoleRequests(
      roleReqPool.map((user) => ({
        userId: user.id,
        type: pick(["winemaker", "shop_owner"] as const),
        businessName: faker.company.name(),
        details: faker.lorem.sentence(),
      })),
    );
    logger.info(`Inserted ${roleReqPool.length} role requests`);
  }

  // ── Images ─────────────────────────────────────────────────────────────────
  logger.info("Inserting images...");
  const imageInputs: ImageInput[] = [
    ...allWineIds.map((id) => ({
      entityType: "wine",
      entityId: id,
      url: "/uploads/wine/wine_placeholder.webp",
    })),
    ...allEventIds.map((id) => ({
      entityType: "event",
      entityId: id,
      url: "/uploads/event/event_placeholder.webp",
    })),
  ];
  await insertImages(imageInputs);
  logger.info(`Inserted ${imageInputs.length} images`);

  logger.info("Dev seeding complete!");
}

main().catch((err) => {
  logger.error(err, "Seeding failed");
  process.exit(1);
});
=======
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
>>>>>>> origin/main
