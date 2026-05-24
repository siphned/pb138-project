import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { faker } from "@faker-js/faker";
import { logger } from "../utils/logger";
import {
  FALLBACK_EVENT_COMMENTS,
  FALLBACK_REVIEWS,
  FEATURED_USERS,
  SHOPS,
  STORY,
  SUPPORTING_CUSTOMERS,
  WINEMAKERS,
} from "./seed.demo.data";
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

faker.seed(42); // deterministic demo data

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val)
    throw new Error(`Missing env var: ${key}. Add to .env.local before running demo seed.`);
  return val;
}

function fakeClerkId() {
  return `user_demo_fake_${faker.string.alphanumeric(20)}`;
}

function czechAddress(city: string): AddressInput {
  return {
    city,
    country: "Czech Republic",
    houseNumber: faker.location.buildingNumber(),
    postalCode: `${faker.string.numeric(3)} ${faker.string.numeric(2)}`,
    street: faker.location.street(),
  };
}

function pick<T>(arr: readonly T[]): T {
  return faker.helpers.arrayElement(arr as T[]);
}

// ── Faker bulk data constants ────────────────────────────────────────────────

const CZECH_WINE_VARIETIES = [
  { variety: "Welschriesling", color: "white" as const, abv: "12.00" },
  { variety: "Müller-Thurgau", color: "white" as const, abv: "11.50" },
  { variety: "Pálava", color: "white" as const, abv: "13.50" },
  { variety: "Sauvignon", color: "white" as const, abv: "12.50" },
  { variety: "Chardonnay", color: "white" as const, abv: "13.00" },
  { variety: "Ryzlink vlašský", color: "white" as const, abv: "12.00" },
  { variety: "Rulandské šedé", color: "white" as const, abv: "13.50" },
  { variety: "Tramín červený", color: "white" as const, abv: "13.00" },
  { variety: "Neuburské", color: "white" as const, abv: "12.50" },
  { variety: "Veltlínské zelené", color: "white" as const, abv: "12.00" },
  { variety: "Frankovka", color: "red" as const, abv: "13.00" },
  { variety: "Zweigeltrebe", color: "red" as const, abv: "13.50" },
  { variety: "Cabernet Sauvignon", color: "red" as const, abv: "14.00" },
  { variety: "Modrý Portugal", color: "red" as const, abv: "12.00" },
  { variety: "Regent", color: "red" as const, abv: "13.00" },
  { variety: "André", color: "red" as const, abv: "12.50" },
  { variety: "Rulandské modré", color: "red" as const, abv: "14.00" },
  { variety: "Dornfelder", color: "red" as const, abv: "13.50" },
];

const CZECH_REGIONS = [
  "Mikulovská", "Velkopavlovická", "Znojemská", "Slovácká", "Čechy",
] as const;

const CZECH_WINERY_CITIES = [
  "Pavlov", "Valtice", "Znojmo", "Mikulov", "Hustopeče",
  "Velké Bílovice", "Bzenec", "Uherské Hradiště", "Mělník",
  "Roudnice nad Labem", "Nymburk", "Litoměřice",
] as const;

const CZECH_SHOP_CITIES = [
  "Praha", "Brno", "Ostrava", "Plzeň", "Olomouc",
  "Liberec", "Hradec Králové", "České Budějovice", "Zlín", "Pardubice",
] as const;

const FAKER_WM_COUNT = 12;
const FAKER_SHOP_COUNT = 10;

function copyImageAssets() {
  const seedDir = fileURLToPath(new URL(".", import.meta.url));
  const seedingDir = join(seedDir, "seeding_images");
  const uploadsDir = fileURLToPath(new URL("../../../uploads", import.meta.url));

  const imageUrls: string[] = [];
  for (const wm of WINEMAKERS) {
    if (wm.imageUrl) imageUrls.push(wm.imageUrl);
    for (const wine of wm.wines) {
      if (wine.imageUrl) imageUrls.push(wine.imageUrl);
    }
    for (const event of wm.events ?? []) {
      if (event.imageUrl) imageUrls.push(event.imageUrl);
    }
  }
  for (const shop of SHOPS) {
    if (shop.imageUrl) imageUrls.push(shop.imageUrl);
  }
  imageUrls.push("/uploads/wine/wine_placeholder.webp");
  imageUrls.push("/uploads/winemaker/winery_placeholder.webp");
  imageUrls.push("/uploads/shop/shop_placeholder.webp");
  imageUrls.push("/uploads/event/event_placeholder.webp");
  imageUrls.push("/uploads/user/user_placeholder.webp");

  const unique = [...new Set(imageUrls)];
  let copied = 0;

  for (const url of unique) {
    const parts = url.split("/");
    const type = parts[2];
    const filename = parts[3];
    if (!type || !filename) continue;

    const destDir = join(uploadsDir, type);
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

    const dest = join(destDir, filename);
    if (existsSync(dest)) continue;

    const srcRoot = join(seedingDir, filename);
    const srcPlaceholders = join(seedingDir, "placeholders", filename);

    if (existsSync(srcRoot)) {
      copyFileSync(srcRoot, dest);
      copied++;
    } else if (existsSync(srcPlaceholders)) {
      copyFileSync(srcPlaceholders, dest);
      copied++;
    } else {
      logger.warn(`Seed image not found: ${filename}`);
    }
  }

  if (copied > 0) logger.info(`Copied ${copied} seed images to uploads/`);
}

async function main() {
  copyImageAssets();
  await teardown();
  logger.info("Demo seed started");

  // ── Resolve real Clerk IDs ───────────────────────────────────────────────────
  const CLERK = {
    test_user: requireEnv("TEST_USER_CLERK_ID"),
  };

  // ── ID resolution maps ───────────────────────────────────────────────────────
  const userIdMap    = new Map<string, string>(); // key → DB user id
  const wmIdMap      = new Map<string, string>(); // wmKey → DB winemaker id
  const wineIdMap    = new Map<string, string>(); // "${wmKey}::${wineName}" → DB wine id
  const shopIdMap    = new Map<string, string>(); // shopKey → DB shop id
  const eventIdMap   = new Map<string, string>(); // "${wmKey}-${idx}" → DB event id
  // productKey = "${shopKey}::${wmKey}::${wineName}"
  const productMap   = new Map<string, { id: string; price: string; shopId: string }>();

  // ── Featured users ───────────────────────────────────────────────────────────
  logger.info("Inserting featured users...");
  const featuredAddrRows = await insertAddresses(
    Object.values(FEATURED_USERS).map((u) => czechAddress(u.city)),
  );
  const featuredKeys = Object.keys(FEATURED_USERS) as (keyof typeof FEATURED_USERS)[];
  const featuredUserInputs: UserInput[] = featuredKeys.map((key, i) => {
    const u = FEATURED_USERS[key];
    return {
      clerkId: CLERK[key as keyof typeof CLERK],
      email: u.email,
      fname: u.fname,
      lname: u.lname,
      shippingAddressId: featuredAddrRows[i]!.id,
    };
  });
  const insertedFeatured = await insertUsers(featuredUserInputs);
  featuredKeys.forEach((key, i) => userIdMap.set(key, insertedFeatured[i]!.id));
  logger.info(`Inserted ${insertedFeatured.length} featured users`);

  // ── Supporting customers (fake Clerk IDs) ────────────────────────────────────
  logger.info("Inserting supporting customers...");
  const supportAddrRows = await insertAddresses(
    SUPPORTING_CUSTOMERS.map((c) => czechAddress(c.city)),
  );
  const supportUserInputs: UserInput[] = SUPPORTING_CUSTOMERS.map((c, i) => ({
    clerkId: fakeClerkId(),
    email: c.email,
    fname: c.fname,
    lname: c.lname,
    shippingAddressId: supportAddrRows[i]!.id,
  }));
  const insertedSupport = await insertUsers(supportUserInputs);
  insertedSupport.forEach((u, i) => userIdMap.set(`support-${i}`, u.id));
  logger.info(`Inserted ${insertedSupport.length} supporting customers`);

  const userAddrMap = new Map<string, string>();
  insertedFeatured.forEach((u, i) => userAddrMap.set(u.id, featuredAddrRows[i]!.id));
  insertedSupport.forEach((u, i) => userAddrMap.set(u.id, supportAddrRows[i]!.id));

  // All customer IDs (for random interactions)
  const allCustomerIds = [
    userIdMap.get("test_user")!,
    ...insertedSupport.map((u) => u.id),
  ];

  // ── Winemakers + wines + events ──────────────────────────────────────────────
  logger.info("Inserting winemakers, wines and events...");
  type ImageEntry = { id: string; url?: string };
  const allWineImages: ImageEntry[] = [];
  const allEventImages: ImageEntry[] = [];
  const allWinemakerImages: ImageEntry[] = [];
  const allShopImages: ImageEntry[] = [];

  const winemakerReviewsToInsert: { winemakerId: string; rating: number; body: string; userId: string }[] = [];
  const wineReviewsToInsert: { wineId: string; rating: number; body: string; userId: string }[] = [];
  const eventCommentsToInsert: { eventId: string; body: string; userId: string }[] = [];

  for (const wm of WINEMAKERS) {
    // Create owner user if fake
    let ownerUserId: string;
    if (wm.ownerKey) {
      ownerUserId = userIdMap.get(wm.ownerKey)!;
    } else {
      const [fakeAddr] = await insertAddresses([czechAddress(wm.city)]);
      const [fakeUser] = await insertUsers([
        {
          clerkId: fakeClerkId(),
          email: wm.email.replace("info@", "owner@"),
          fname: faker.person.firstName().slice(0, 30),
          lname: faker.person.lastName().slice(0, 30),
          shippingAddressId: fakeAddr!.id,
        },
      ]);
      ownerUserId = fakeUser!.id;
      userIdMap.set(`wm-owner-${wm.key}`, ownerUserId);
    }

    const [wmAddr] = await insertAddresses([czechAddress(wm.city)]);
    const winemakerInput: WinemakerId = {
      userId: ownerUserId,
      name: wm.name,
      description: wm.description,
      addressId: wmAddr!.id,
      email: wm.email,
      phone: wm.phone,
      websiteUrl: wm.websiteUrl,
    };
    const [wmRow] = await insertWinemakers([winemakerInput]);
    const wmId = wmRow!.id;
    wmIdMap.set(wm.key, wmId);
    allWinemakerImages.push({ id: wmId, url: wm.imageUrl });

    // Winemaker Demo Reviews
    for (const r of wm.demoReviews ?? []) {
      winemakerReviewsToInsert.push({ winemakerId: wmId, rating: r.rating, body: r.body, userId: pick(allCustomerIds) });
    }

    // Wines
    const wineInputs: WineInput[] = wm.wines.map((w) => ({
      winemakerId: wmId,
      name: w.name,
      color: w.color,
      type: w.type,
      region: w.region,
      vintageYear: w.vintageYear,
      alcoholContent: w.alcoholContent,
      volumeMl: w.volumeMl,
      quantity: w.quantity,
      attribution: w.attribution,
      composition: w.composition,
      description: w.description,
    }));
    const insertedWines = await insertWines(wineInputs);
    insertedWines.forEach((row, i) => {
      const wineData = wm.wines[i]!;
      wineIdMap.set(`${wm.key}::${wineData.name}`, row.id);
      allWineImages.push({ id: row.id, url: wineData.imageUrl });

      // Wine Demo Reviews
      for (const r of wineData.demoReviews ?? []) {
        wineReviewsToInsert.push({ wineId: row.id, rating: r.rating, body: r.body, userId: pick(allCustomerIds) });
      }
    });

    // Events
    const now = Date.now();
    const eventAddrRows = await insertAddresses(wm.events.map(() => czechAddress(wm.city)));
    const eventInputs: EventInput[] = wm.events.map((ev, i) => {
      const startTime = new Date(now + ev.daysOffset * 86_400_000);
      return {
        winemakerId: wmId,
        addressId: eventAddrRows[i]!.id,
        name: ev.name,
        description: ev.description,
        startTime,
        endTime: new Date(startTime.getTime() + ev.durationHours * 3_600_000),
        capacity: ev.capacity,
        visibility: ev.visibility,
        inviteType: "open",
        status: "approved" as const,
      };
    });
    const insertedEvents = await insertEvents(eventInputs);
    insertedEvents.forEach((row, i) => {
      const eventData = wm.events[i]!;
      eventIdMap.set(`${wm.key}-${i}`, row.id);
      allEventImages.push({ id: row.id, url: eventData.imageUrl });

      // Event Demo Comments
      for (const body of eventData.demoComments ?? []) {
        eventCommentsToInsert.push({ eventId: row.id, body, userId: pick(allCustomerIds) });
      }
    });
  }
  logger.info(`Inserted ${wmIdMap.size} custom winemakers, ${allWineImages.length} wines, ${allEventImages.length} events`);

  // ── Faker winemakers (bulk) ──────────────────────────────────────────────────
  logger.info(`Inserting ${FAKER_WM_COUNT} faker winemakers...`);
  const fakerWmKeys: string[] = [];
  const fakerOwnerRoles: { userId: string; role: string }[] = [];

  for (let i = 0; i < FAKER_WM_COUNT; i++) {
    const wmKey = `faker-wm-${i}`;
    const city = pick(CZECH_WINERY_CITIES);
    const region = pick(CZECH_REGIONS);
    const lastName = faker.person.lastName();
    const wmName = pick([
      `Vinařství ${lastName}`,
      `Rodinné vinařství ${lastName}`,
      `Sklepy ${city}`,
      `Winery ${lastName}`,
    ]);

    const [fakeOwnerAddr] = await insertAddresses([czechAddress(city)]);
    const [fakeOwner] = await insertUsers([{
      clerkId: fakeClerkId(),
      email: faker.internet.email().slice(0, 60),
      fname: faker.person.firstName().slice(0, 30),
      lname: lastName.slice(0, 30),
      shippingAddressId: fakeOwnerAddr!.id,
    }]);
    userIdMap.set(`wm-owner-${wmKey}`, fakeOwner!.id);
    fakerOwnerRoles.push({ userId: fakeOwner!.id, role: "winemaker" });

    const [wmAddr] = await insertAddresses([czechAddress(city)]);
    const domain = faker.internet.domainName();
    const [wmRow] = await insertWinemakers([{
      userId: fakeOwner!.id,
      name: wmName,
      description: faker.lorem.sentences({ min: 2, max: 3 }),
      addressId: wmAddr!.id,
      email: `info@${domain}`,
      phone: `+420 ${faker.string.numeric(3)} ${faker.string.numeric(3)} ${faker.string.numeric(3)}`,
      websiteUrl: `https://${domain}`,
    }]);
    wmIdMap.set(wmKey, wmRow!.id);
    fakerWmKeys.push(wmKey);
    allWinemakerImages.push({ id: wmRow!.id, url: undefined });

    // 4-6 wines
    const wineCount = faker.number.int({ min: 4, max: 6 });
    const selectedVarieties = faker.helpers.arrayElements(CZECH_WINE_VARIETIES, wineCount);
    const fakerWineInputs: WineInput[] = selectedVarieties.map((v) => {
      const year = faker.number.int({ min: 2018, max: 2023 });
      return {
        winemakerId: wmRow!.id,
        name: `${v.variety} ${year}`,
        color: v.color,
        type: "still" as const,
        region,
        vintageYear: year,
        alcoholContent: v.abv,
        volumeMl: 750,
        quantity: faker.number.int({ min: 80, max: 300 }),
        attribution: pick(["Estate", "Reserve", "Single Vineyard"] as const),
        composition: `100% ${v.variety}`,
        description: faker.lorem.sentences({ min: 1, max: 2 }),
      };
    });
    const insertedFakerWines = await insertWines(fakerWineInputs);
    insertedFakerWines.forEach((row, idx) => {
      wineIdMap.set(`${wmKey}::${fakerWineInputs[idx]!.name}`, row.id);
      allWineImages.push({ id: row.id, url: undefined });
    });

    // 0 or 1 future event
    if (faker.datatype.boolean()) {
      const daysOffset = faker.number.int({ min: 14, max: 90 });
      const [evAddr] = await insertAddresses([czechAddress(city)]);
      const startTime = new Date(Date.now() + daysOffset * 86_400_000);
      const [evRow] = await insertEvents([{
        winemakerId: wmRow!.id,
        addressId: evAddr!.id,
        name: `${faker.helpers.arrayElement(["Premium", "Classic", "Harvest", "Seasonal", "Regional"])} Wine Experience`,
        description: faker.lorem.sentences(2),
        startTime,
        endTime: new Date(startTime.getTime() + 3 * 3_600_000),
        capacity: faker.number.int({ min: 20, max: 60 }),
        visibility: "public",
        inviteType: "open",
        status: "approved" as const,
      }]);
      eventIdMap.set(`${wmKey}-0`, evRow!.id);
      allEventImages.push({ id: evRow!.id, url: undefined });
    }
  }
  logger.info(`Inserted ${fakerWmKeys.length} faker winemakers`);

  // ── Shops + products + bundles ───────────────────────────────────────────────
  logger.info("Inserting shops, products and bundles...");
  const allProductIds: string[] = [];

  for (const shop of SHOPS) {
    // Create owner user if fake
    let shopOwnerUserId: string;
    if (shop.ownerKey) {
      shopOwnerUserId = userIdMap.get(shop.ownerKey)!;
    } else {
      const [fakeAddr] = await insertAddresses([czechAddress(shop.city)]);
      const [fakeUser] = await insertUsers([
        {
          clerkId: fakeClerkId(),
          email: shop.email.replace("info@", "owner@"),
          fname: faker.person.firstName().slice(0, 30),
          lname: faker.person.lastName().slice(0, 30),
          shippingAddressId: fakeAddr!.id,
        },
      ]);
      shopOwnerUserId = fakeUser!.id;
      userIdMap.set(`shop-owner-${shop.key}`, shopOwnerUserId);
    }

    const [shopAddr] = await insertAddresses([czechAddress(shop.city)]);
    const shopInput: ShopInput = {
      ownerUserId: shopOwnerUserId,
      name: shop.name,
      description: shop.description,
      addressId: shopAddr!.id,
    };
    const [shopRow] = await insertShops([shopInput]);
    shopIdMap.set(shop.key, shopRow!.id);
    allShopImages.push({ id: shopRow!.id, url: shop.imageUrl });

    // Products: all wines from source winemakers
    for (const wmKey of shop.sourceWinemakerKeys) {
      const wm = WINEMAKERS.find((w) => w.key === wmKey);
      if (!wm) continue;
      const productInputs: ProductInput[] = wm.wines.map((wine) => ({
        shopId: shopRow!.id,
        name: wine.name,
        price: (wine.basePrice * faker.number.float({ min: 0.9, max: 1.15, fractionDigits: 2 })).toFixed(2),
        quantity: faker.number.int({ min: 10, max: 80 }),
        isBundle: false,
        description: wine.description,
      }));
      const insertedProducts = await insertProducts(productInputs);
      await insertProductWines(
        insertedProducts.map((p, i) => ({
          productId: p.id,
          wineId: wineIdMap.get(`${wmKey}::${wm.wines[i]!.name}`)!,
          quantity: 1,
        })),
      );
      insertedProducts.forEach((p, i) => {
        const key = `${shop.key}::${wmKey}::${wm.wines[i]!.name}`;
        productMap.set(key, { id: p.id, price: p.price, shopId: shopRow!.id });
        allProductIds.push(p.id);
      });
    }

    // Bundles
    for (const bundle of shop.bundles) {
      const wineIds: string[] = [];
      for (const wmKey of shop.sourceWinemakerKeys) {
        for (const wineName of bundle.wineNames) {
          const id = wineIdMap.get(`${wmKey}::${wineName}`);
          if (id) wineIds.push(id);
        }
      }
      if (wineIds.length < 2) continue;
      const [bundleProduct] = await insertProducts([
        {
          shopId: shopRow!.id,
          name: bundle.name,
          price: bundle.price.toFixed(2),
          quantity: faker.number.int({ min: 5, max: 30 }),
          isBundle: true,
          description: bundle.description,
        },
      ]);
      await insertProductWines(
        wineIds.map((wineId) => ({ productId: bundleProduct!.id, wineId, quantity: 1 })),
      );
      allProductIds.push(bundleProduct!.id);
    }
  }
  logger.info(`Inserted ${shopIdMap.size} custom shops with ${allProductIds.length} products`);

  // ── Faker shops (bulk) ───────────────────────────────────────────────────────
  logger.info(`Inserting ${FAKER_SHOP_COUNT} faker shops...`);
  const fakerShopKeys: string[] = [];

  for (let i = 0; i < FAKER_SHOP_COUNT; i++) {
    const shopKey = `faker-shop-${i}`;
    const city = pick(CZECH_SHOP_CITIES);
    const shopName = pick([
      `Vinotéka ${faker.person.lastName()}`,
      `Vinárna ${city}`,
      `Víno ${faker.person.lastName()}`,
      `${city} Wine`,
      `Sklep ${faker.person.lastName()}`,
    ]);

    const [fakeOwnerAddr] = await insertAddresses([czechAddress(city)]);
    const [fakeShopOwner] = await insertUsers([{
      clerkId: fakeClerkId(),
      email: faker.internet.email().slice(0, 60),
      fname: faker.person.firstName().slice(0, 30),
      lname: faker.person.lastName().slice(0, 30),
      shippingAddressId: fakeOwnerAddr!.id,
    }]);
    userIdMap.set(`shop-owner-${shopKey}`, fakeShopOwner!.id);
    fakerOwnerRoles.push({ userId: fakeShopOwner!.id, role: "shop_owner" });

    const [shopAddr] = await insertAddresses([czechAddress(city)]);
    const [shopRow] = await insertShops([{
      ownerUserId: fakeShopOwner!.id,
      name: shopName,
      description: faker.lorem.sentences({ min: 2, max: 3 }),
      addressId: shopAddr!.id,
    }]);
    shopIdMap.set(shopKey, shopRow!.id);
    fakerShopKeys.push(shopKey);
    allShopImages.push({ id: shopRow!.id, url: undefined });

    // Source from 2 random faker winemakers
    const sourceWmKeys = faker.helpers.arrayElements(fakerWmKeys, 2);
    for (const wmKey of sourceWmKeys) {
      // faker winemakers are not in WINEMAKERS array — build product inputs from wineIdMap
      const wmWineEntries = [...wineIdMap.entries()]
        .filter(([k]) => k.startsWith(`${wmKey}::`));

      const productInputs: ProductInput[] = wmWineEntries.map(([k]) => {
        const wineName = k.split("::")[1]!;
        const basePrice = faker.number.float({ min: 10, max: 40, fractionDigits: 2 });
        return {
          shopId: shopRow!.id,
          name: wineName,
          price: (basePrice * faker.number.float({ min: 0.9, max: 1.15, fractionDigits: 2 })).toFixed(2),
          quantity: faker.number.int({ min: 10, max: 60 }),
          isBundle: false,
        };
      });
      if (productInputs.length === 0) continue;
      const insertedProducts = await insertProducts(productInputs);
      await insertProductWines(
        insertedProducts.map((p, idx) => ({
          productId: p.id,
          wineId: wmWineEntries[idx]![1],
          quantity: 1,
        })),
      );
      insertedProducts.forEach((p, idx) => {
        const wineName = wmWineEntries[idx]![0].split("::")[1]!;
        productMap.set(`${shopKey}::${wmKey}::${wineName}`, { id: p.id, price: p.price, shopId: shopRow!.id });
        allProductIds.push(p.id);
      });
    }

    // Supply agreements for faker shop
    await insertSupplyAgreements(
      sourceWmKeys.map((wmKey) => ({
        shopId: shopRow!.id,
        winemakerId: wmIdMap.get(wmKey)!,
        status: "approved" as const,
      })),
    );
  }
  logger.info(`Inserted ${fakerShopKeys.length} faker shops`);

  // ── User roles ───────────────────────────────────────────────────────────────
  logger.info("Inserting user roles...");
  const roleSet = new Set<string>(); // "userId::role"
  const addRole = (userId: string, role: string) => roleSet.add(`${userId}::${role}`);

  addRole(userIdMap.get("test_user")!, "admin"); // test_user is admin

  for (const wm of WINEMAKERS) {
    const ownerId = wm.ownerKey
      ? userIdMap.get(wm.ownerKey)!
      : userIdMap.get(`wm-owner-${wm.key}`)!;
    addRole(ownerId, "winemaker");
  }
  for (const shop of SHOPS) {
    const ownerId = shop.ownerKey
      ? userIdMap.get(shop.ownerKey)!
      : userIdMap.get(`shop-owner-${shop.key}`)!;
    addRole(ownerId, "shop_owner");
  }

  for (const r of fakerOwnerRoles) {
    addRole(r.userId, r.role);
  }

  const userRoleEntries = [...roleSet].map((s) => {
    const [userId, role] = s.split("::");
    return { userId: userId!, role: role! };
  });

  await insertUserRoles(userRoleEntries);
  logger.info(`Inserted ${userRoleEntries.length} user roles`);

  // ── Supply agreements ────────────────────────────────────────────────────────
  logger.info("Inserting supply agreements...");
  const supplyRows = SHOPS.flatMap((shop) =>
    shop.sourceWinemakerKeys.map((wmKey) => ({
      shopId: shopIdMap.get(shop.key)!,
      winemakerId: wmIdMap.get(wmKey)!,
      status: "approved" as const,
    })),
  );
  await insertSupplyAgreements(supplyRows);
  logger.info(`Inserted ${supplyRows.length} supply agreements`);

  // ── Availability ─────────────────────────────────────────────────────────────
  logger.info("Inserting availability...");
  const today = new Date();
  const validFrom = today.toISOString().slice(0, 10);
  const availRows: AvailabilityInput[] = [];
  const allShopKeys = [...SHOPS.map((s) => s.key), ...fakerShopKeys];
  for (const key of allShopKeys) {
    const shopId = shopIdMap.get(key)!;
    const openHour = faker.number.int({ min: 9, max: 10 });
    const closeHour = faker.number.int({ min: 17, max: 20 });
    const hasSaturday = Math.random() < 0.7;
    const hasSunday = Math.random() < 0.3;
    const slot = (dow: number, open: number, close: number): AvailabilityInput => {
      const s = new Date(today); s.setHours(open, 0, 0, 0);
      const e = new Date(today); e.setHours(close, 0, 0, 0);
      return { shopId, dow, startTime: s, endTime: e, type: "open", validFrom };
    };
    [1, 2, 3, 4, 5].forEach((dow) => availRows.push(slot(dow, openHour, closeHour)));
    if (hasSaturday) availRows.push(slot(6, openHour + 1, closeHour - 1));
    if (hasSunday) availRows.push(slot(0, 11, 16));
  }
  await insertAvailabilityRegular(availRows);

  // Availability exceptions: 2-3 upcoming closures across shops
  const exceptionInputs: AvailabilityExceptionInput[] = faker.helpers
    .arrayElements([...shopIdMap.values()], Math.ceil(shopIdMap.size * 0.6))
    .flatMap((shopId) => {
      const startsAt = faker.date.soon({ days: 60 });
      return [
        {
          shopId,
          startsAt,
          endsAt: new Date(startsAt.getTime() + faker.number.int({ min: 8, max: 48 }) * 3_600_000),
          action: pick(["closed", "modified_hours"] as const),
          reason: pick(["Public holiday", "Staff training", "Private event", "Renovation"] as const),
        },
      ];
    });
  await insertAvailabilityExceptions(exceptionInputs);
  logger.info(`Inserted ${availRows.length} availability rows, ${exceptionInputs.length} exceptions`);

  // ── Event registrations ──────────────────────────────────────────────────────
  logger.info("Inserting event registrations...");
  const regKeys = new Set<string>();
  const registrationInputs: { eventId: string; userId: string }[] = [];

  const addReg = (eventId: string, userId: string) => {
    const key = `${eventId}-${userId}`;
    if (!regKeys.has(key)) { regKeys.add(key); registrationInputs.push({ eventId, userId }); }
  };

  // Story registrations
  for (const evKey of STORY.jana.eventRegistrations) {
    const evId = eventIdMap.get(evKey);
    if (evId) addReg(evId, userIdMap.get("test_user")!);
  }
  for (const evKey of STORY.petr.eventRegistrations) {
    const evId = eventIdMap.get(evKey);
    if (evId) addReg(evId, userIdMap.get("test_user")!);
  }

  // Random supporting customers at events
  const eventIdList = [...eventIdMap.values()];
  const regPool = faker.helpers.arrayElements(insertedSupport, Math.floor(insertedSupport.length * 0.7));
  for (const user of regPool) {
    addReg(pick(eventIdList), user.id);
  }
  await insertEventRegistrations(registrationInputs);
  logger.info(`Inserted ${registrationInputs.length} event registrations`);

  // ── Event comments ───────────────────────────────────────────────────────────
  logger.info("Inserting event comments...");
  const finalEventCommentInputs: EventCommentInput[] = [...eventCommentsToInsert];

  // Add random ones to fill up
  for (const evId of eventIdList) {
    const currentCount = finalEventCommentInputs.filter(c => c.eventId === evId).length;
    const target = faker.number.int({ min: 8, max: 12 });
    for (let i = currentCount; i < target; i++) {
      finalEventCommentInputs.push({
        eventId: evId,
        userId: pick(allCustomerIds),
        body: pick(FALLBACK_EVENT_COMMENTS),
      });
    }
  }

  await insertEventComments(finalEventCommentInputs);
  logger.info(`Inserted ${finalEventCommentInputs.length} event comments`);

  // ── Reviews ──────────────────────────────────────────────────────────────────
  logger.info("Inserting reviews...");
  const reviewKeys = new Set<string>();
  const reviewInputs: ReviewInput[] = [];

  const addReview = (userId: string, entityType: string, entityId: string, rating: number, body: string) => {
    const key = `${userId}-${entityType}-${entityId}`;
    if (reviewKeys.has(key)) return;
    reviewKeys.add(key);
    reviewInputs.push({ userId, entityType, entityId, rating, body });
  };

  // Insert Demo Reviews
  for (const r of winemakerReviewsToInsert) {
    addReview(r.userId, "winemaker", r.winemakerId, r.rating, r.body);
  }
  for (const r of wineReviewsToInsert) {
    addReview(r.userId, "product", r.wineId, r.rating, r.body);
  }

  // Story reviews (Willy)
  for (const r of STORY.jana.productReviews) {
    const prodKey = `${r.shopKey}::${r.winemakerId}::${r.wineName}`;
    const prod = productMap.get(prodKey);
    if (prod) addReview(userIdMap.get("test_user")!, "product", prod.id, r.rating, r.body);
  }
  for (const r of STORY.jana.winemakerReviews) {
    const wmId = wmIdMap.get(r.winemakerId);
    if (wmId) addReview(userIdMap.get("test_user")!, "winemaker", wmId, r.rating, r.body);
  }
  for (const r of STORY.petr.productReviews) {
    const prodKey = `${r.shopKey}::${r.winemakerId}::${r.wineName}`;
    const prod = productMap.get(prodKey);
    if (prod) addReview(userIdMap.get("test_user")!, "product", prod.id, r.rating, r.body);
  }
  for (const r of STORY.petr.winemakerReviews) {
    const wmId = wmIdMap.get(r.winemakerId);
    if (wmId) addReview(userIdMap.get("test_user")!, "winemaker", wmId, r.rating, r.body);
  }

  // Bulk reviews for Faker Winemakers
  const wmIdArr = [...wmIdMap.values()];
  for (const wmId of wmIdArr) {
    const existing = reviewInputs.filter(r => r.entityId === wmId && r.entityType === "winemaker").length;
    if (existing < 3) {
      for (let i = existing; i < 3; i++) {
        addReview(pick(insertedSupport).id, "winemaker", wmId, pick([4, 5]), pick(FALLBACK_REVIEWS));
      }
    }
  }

  const insertedReviews = await insertReviews(reviewInputs);
  logger.info(`Inserted ${insertedReviews.length} reviews`);

  // ── Comments on reviews ──────────────────────────────────────────────────────
  logger.info("Inserting comments on reviews...");
  const commentInputs: CommentInput[] = faker.helpers
    .arrayElements(insertedReviews, Math.floor(insertedReviews.length * 0.35))
    .flatMap((review) =>
      Array.from({ length: faker.number.int({ min: 1, max: 2 }) }, () => ({
        reviewId: review.id,
        userId: pick(allCustomerIds),
        body: faker.lorem.sentences({ min: 1, max: 2 }),
      })),
    );
  await insertComments(commentInputs);
  logger.info(`Inserted ${commentInputs.length} comments`);

  // ── Orders + order items ─────────────────────────────────────────────────────
  logger.info("Inserting orders...");

  type PendingItem = { productId: string; shopId: string; quantity: number; unitPriceAtPurchase: string };
  type PendingOrder = { input: OrderInput; items: PendingItem[] };

  // Group products by shop
  const shopProductMap = new Map<string, { id: string; price: string }[]>();
  for (const [, prod] of productMap) {
    const existing = shopProductMap.get(prod.shopId) ?? [];
    existing.push({ id: prod.id, price: prod.price });
    shopProductMap.set(prod.shopId, existing);
  }
  const shopEntries = [...shopProductMap.entries()];

  const buildOrder = (userId: string, status: string, items: PendingItem[]): PendingOrder => {
    const addressId = userAddrMap.get(userId) ?? featuredAddrRows[0]!.id;
    const shippingFee = pick(["0.00", "4.90", "9.90"] as const);
    const itemsTotal = items.reduce((sum, it) => sum + it.quantity * Number.parseFloat(it.unitPriceAtPurchase), 0);
    const totalPrice = (itemsTotal + Number.parseFloat(shippingFee)).toFixed(2);
    let paymentStatus: "pending" | "captured" | "cancelled";
    if (status === "cancelled") {
      paymentStatus = "cancelled";
    } else if (status === "pending") {
      paymentStatus = "pending";
    } else {
      paymentStatus = "captured";
    }
    return {
      input: {
        userId,
        shippingAddressId: addressId,
        billingAddressId: addressId,
        status: status as any,
        deliveryType: pick(["pickup", "shipping"] as const),
        paymentMethod: pick(["card", "bank_transfer", "cash_on_delivery"] as const),
        paymentStatus,
        totalPrice,
        discount: "0.00",
        shippingFee,
      },
      items,
    };
  };

  const resolveStoryItems = (items: { wineName: string; winemakerId: string; quantity: number }[], shopKey: string): PendingItem[] => {
    return items.flatMap((it) => {
      const shop = SHOPS.find((s) => s.key === shopKey);
      if (!shop) return [];
      const shopId = shopIdMap.get(shopKey)!;
      const prod = productMap.get(`${shopKey}::${it.winemakerId}::${it.wineName}`);
      if (!prod) return [];
      return [{ productId: prod.id, shopId, quantity: it.quantity, unitPriceAtPurchase: prod.price }];
    });
  };

  const allPending: PendingOrder[] = [];

  // Story orders — Jana (mapped to test_user)
  for (const order of STORY.jana.orders) {
    const items = resolveStoryItems(order.items, order.shopKey);
    if (items.length > 0) allPending.push(buildOrder(userIdMap.get("test_user")!, order.status, items));
  }

  // Story orders — Petr (mapped to test_user)
  for (const order of STORY.petr.orders) {
    const items = resolveStoryItems(order.items, order.shopKey);
    if (items.length > 0) allPending.push(buildOrder(userIdMap.get("test_user")!, order.status, items));
  }

  // Random orders from supporting customers
  const orderingCustomers = faker.helpers.arrayElements(insertedSupport, Math.floor(insertedSupport.length * 0.75));
  for (const customer of orderingCustomers) {
    if (shopEntries.length === 0) break;
    const [shopId, shopProds] = pick(shopEntries);
    const itemCount = faker.number.int({ min: 1, max: 4 });
    const pickedProds = faker.helpers.arrayElements(shopProds, Math.min(itemCount, shopProds.length));
    const items: PendingItem[] = pickedProds.map((prod) => ({
      productId: prod.id,
      shopId,
      quantity: faker.number.int({ min: 1, max: 3 }),
      unitPriceAtPurchase: prod.price,
    }));
    const roll = Math.random();
    let status: string;
    if (roll < 0.15) {
      status = "pending";
    } else if (roll < 0.22) {
      status = "cancelled";
    } else {
      status = pick(["confirmed", "shipped", "delivered"] as const);
    }
    allPending.push(buildOrder(customer.id, status, items));
  }

  const insertedOrders = await insertOrders(allPending.map((p) => p.input));
  const orderItemInputs: OrderItemInput[] = insertedOrders.flatMap((order, i) =>
    (allPending[i]?.items ?? []).map((item) => ({ ...item, orderId: order.id })),
  );
  await insertOrderItems(orderItemInputs);
  logger.info(`Inserted ${insertedOrders.length} orders with ${orderItemInputs.length} order items`);

  // ── Role requests ────────────────────────────────────────────────────────────
  logger.info("Inserting role requests...");
  const assignedSet = new Set(userRoleEntries.map((r) => `${r.userId}-${r.role}`));
  const eligible = insertedSupport.filter(
    (u) => !assignedSet.has(`${u.id}-winemaker`) && !assignedSet.has(`${u.id}-shop_owner`),
  );
  const reqPool = faker.helpers.arrayElements(eligible, Math.min(5, eligible.length));
  await insertRoleRequests(
    reqPool.map((user) => ({
      userId: user.id,
      type: pick(["winemaker", "shop_owner"] as const),
      businessName: faker.company.name(),
      details: faker.lorem.sentence(),
    })),
  );
  logger.info(`Inserted ${reqPool.length} role requests`);

  // ── Images ───────────────────────────────────────────────────────────────────
  // Custom URLs from data file take priority. No global placeholders inserted;
  // frontend handles fallbacks via local assets.
  logger.info("Inserting images...");
  const imageInputs: ImageInput[] = [
    ...allWineImages
      .filter((img) => !!img.url)
      .map(({ id, url }) => ({
        entityType: "wine",
        entityId: id,
        url: url!,
      })),
    ...allEventImages
      .filter((img) => !!img.url)
      .map(({ id, url }) => ({
        entityType: "event",
        entityId: id,
        url: url!,
      })),
    ...allWinemakerImages
      .filter((img) => !!img.url)
      .map(({ id, url }) => ({
        entityType: "winemaker",
        entityId: id,
        url: url!,
      })),
    ...allShopImages
      .filter((img) => !!img.url)
      .map(({ id, url }) => ({
        entityType: "shop",
        entityId: id,
        url: url!,
      })),
  ];
  await insertImages(imageInputs);
  logger.info(`Inserted ${imageInputs.length} images`);

  logger.info("Demo seeding complete!");
  logger.info("─────────────────────────────────────────────────────────────────");
  logger.info("Demo account (log in via Clerk):");
  logger.info("  Willy the Kid: willy@winery.demo");
  logger.info("  (Controls: Lavicka winery, Vecerka Posledná Záchrana shop, Admin access)");
  logger.info("─────────────────────────────────────────────────────────────────");
}

main().catch((err) => {
  logger.error(err, "Demo seeding failed");
  process.exit(1);
});
