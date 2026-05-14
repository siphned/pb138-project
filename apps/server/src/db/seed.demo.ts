import { faker } from "@faker-js/faker";
import { logger } from "../utils/logger";
import {
  EVENT_COMMENT_BODIES,
  FEATURED_USERS,
  REVIEW_BODIES,
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

async function main() {
  await teardown();
  logger.info("Demo seed started");

  // ── Resolve real Clerk IDs ───────────────────────────────────────────────────
  const CLERK = {
    admin:    requireEnv("DEMO_ADMIN_CLERK_ID"),
    pavlov:   requireEnv("DEMO_WINEMAKER_CLERK_ID"),
    boutique: requireEnv("DEMO_SHOP_OWNER_CLERK_ID"),
    jana:     requireEnv("DEMO_CUSTOMER1_CLERK_ID"),
    petr:     requireEnv("DEMO_CUSTOMER2_CLERK_ID"),
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

  // All customer IDs (for random interactions)
  const allCustomerIds = [
    userIdMap.get("jana")!,
    userIdMap.get("petr")!,
    ...insertedSupport.map((u) => u.id),
  ];

  // ── Winemakers + wines + events ──────────────────────────────────────────────
  logger.info("Inserting winemakers, wines and events...");
  const allWineIds: string[] = [];
  const allEventIds: string[] = [];

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
    wmIdMap.set(wm.key, wmRow!.id);

    // Wines
    const wineInputs: WineInput[] = wm.wines.map((w) => ({
      winemakerId: wmRow!.id,
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
      wineIdMap.set(`${wm.key}::${wm.wines[i]!.name}`, row.id);
      allWineIds.push(row.id);
    });

    // Events
    const now = Date.now();
    const eventAddrRows = await insertAddresses(wm.events.map(() => czechAddress(wm.city)));
    const eventInputs: EventInput[] = wm.events.map((ev, i) => {
      const startTime = new Date(now + ev.daysOffset * 86_400_000);
      return {
        winemakerId: wmRow!.id,
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
      eventIdMap.set(`${wm.key}-${i}`, row.id);
      allEventIds.push(row.id);
    });
  }
  logger.info(`Inserted ${wmIdMap.size} winemakers, ${allWineIds.length} wines, ${allEventIds.length} events`);

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
  logger.info(`Inserted ${shopIdMap.size} shops with ${allProductIds.length} products`);

  // ── User roles ───────────────────────────────────────────────────────────────
  logger.info("Inserting user roles...");
  const userRoleEntries: { userId: string; role: string }[] = [
    { userId: userIdMap.get("admin")!, role: "admin" },
  ];
  for (const wm of WINEMAKERS) {
    const ownerId = wm.ownerKey
      ? userIdMap.get(wm.ownerKey)!
      : userIdMap.get(`wm-owner-${wm.key}`)!;
    if (!userRoleEntries.some((r) => r.userId === ownerId && r.role === "winemaker")) {
      userRoleEntries.push({ userId: ownerId, role: "winemaker" });
    }
  }
  for (const shop of SHOPS) {
    const ownerId = shop.ownerKey
      ? userIdMap.get(shop.ownerKey)!
      : userIdMap.get(`shop-owner-${shop.key}`)!;
    if (!userRoleEntries.some((r) => r.userId === ownerId && r.role === "shop_owner")) {
      userRoleEntries.push({ userId: ownerId, role: "shop_owner" });
    }
  }
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
  for (const shop of SHOPS) {
    const shopId = shopIdMap.get(shop.key)!;
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
    if (evId) addReg(evId, userIdMap.get("jana")!);
  }
  for (const evKey of STORY.petr.eventRegistrations) {
    const evId = eventIdMap.get(evKey);
    if (evId) addReg(evId, userIdMap.get("petr")!);
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
  const eventCommentInputs: EventCommentInput[] = eventIdList.flatMap((evId) => {
    const count = faker.number.int({ min: 2, max: 5 });
    return Array.from({ length: count }, () => ({
      eventId: evId,
      userId: pick(allCustomerIds),
      body: pick(EVENT_COMMENT_BODIES),
    }));
  });
  await insertEventComments(eventCommentInputs);
  logger.info(`Inserted ${eventCommentInputs.length} event comments`);

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

  // Jana's story reviews
  for (const r of STORY.jana.productReviews) {
    const prodKey = `${r.shopKey}::${r.winemakerId}::${r.wineName}`;
    const prod = productMap.get(prodKey);
    if (prod) addReview(userIdMap.get("jana")!, "product", prod.id, r.rating, r.body);
  }
  for (const r of STORY.jana.winemakerReviews) {
    const wmId = wmIdMap.get(r.winemakerId);
    if (wmId) addReview(userIdMap.get("jana")!, "winemaker", wmId, r.rating, r.body);
  }

  // Petr's story reviews
  for (const r of STORY.petr.productReviews) {
    const prodKey = `${r.shopKey}::${r.winemakerId}::${r.wineName}`;
    const prod = productMap.get(prodKey);
    if (prod) addReview(userIdMap.get("petr")!, "product", prod.id, r.rating, r.body);
  }
  for (const r of STORY.petr.winemakerReviews) {
    const wmId = wmIdMap.get(r.winemakerId);
    if (wmId) addReview(userIdMap.get("petr")!, "winemaker", wmId, r.rating, r.body);
  }

  // Supporting customer reviews (random products + winemakers)
  const allProductArr = [...productMap.values()];
  const wmIdArr = [...wmIdMap.values()];
  const reviewers = faker.helpers.arrayElements(insertedSupport, Math.floor(insertedSupport.length * 0.8));
  for (const user of reviewers) {
    const ratingRoll = Math.random();
    const rating = ratingRoll < 0.6 ? faker.number.int({ min: 4, max: 5 }) :
                   ratingRoll < 0.85 ? faker.number.int({ min: 3, max: 3 }) :
                   faker.number.int({ min: 1, max: 2 });
    const body = rating >= 4 ? pick(REVIEW_BODIES.positive) :
                 rating === 3 ? pick(REVIEW_BODIES.neutral) :
                 pick(REVIEW_BODIES.critical);

    if (Math.random() < 0.7 && allProductArr.length > 0) {
      const prod = pick(allProductArr);
      addReview(user.id, "product", prod.id, rating, body);
    } else {
      addReview(user.id, "winemaker", pick(wmIdArr), rating, body);
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

  const buildOrder = async (
    userId: string,
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled",
    items: PendingItem[],
  ): Promise<PendingOrder> => {
    const shippingFee = pick(["0.00", "5.00", "10.00"] as const);
    const itemsTotal = items.reduce((sum, it) => sum + it.quantity * Number.parseFloat(it.unitPriceAtPurchase), 0);
    const totalPrice = (itemsTotal + Number.parseFloat(shippingFee)).toFixed(2);
    const paymentStatus = status === "cancelled" ? "cancelled" as const
      : status === "pending" ? "pending" as const : "captured" as const;

    const addrRows = await insertAddresses([czechAddress(pick(["Praha", "Brno", "Ostrava", "Olomouc"])), czechAddress(pick(["Praha", "Brno"]))]);
    return {
      input: {
        userId,
        shippingAddressId: addrRows[0]!.id,
        billingAddressId: addrRows[1]!.id,
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
  };

  const resolveStoryItems = (
    storyItems: { wineName: string; winemakerId: string; quantity: number }[],
    shopKey: string,
  ): PendingItem[] => {
    const shopId = shopIdMap.get(shopKey)!;
    return storyItems.flatMap((it) => {
      const prod = productMap.get(`${shopKey}::${it.winemakerId}::${it.wineName}`);
      if (!prod) return [];
      return [{ productId: prod.id, shopId, quantity: it.quantity, unitPriceAtPurchase: prod.price }];
    });
  };

  const allPending: PendingOrder[] = [];

  // Story orders — Jana
  for (const order of STORY.jana.orders) {
    const items = resolveStoryItems(order.items, order.shopKey);
    if (items.length > 0) allPending.push(await buildOrder(userIdMap.get("jana")!, order.status, items));
  }

  // Story orders — Petr
  for (const order of STORY.petr.orders) {
    const items = resolveStoryItems(order.items, order.shopKey);
    if (items.length > 0) allPending.push(await buildOrder(userIdMap.get("petr")!, order.status, items));
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
    const status = roll < 0.15 ? "pending" : roll < 0.22 ? "cancelled" : pick(["confirmed", "shipped", "delivered"] as const);
    allPending.push(await buildOrder(customer.id, status, items));
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
  logger.info("Inserting images...");
  const imageInputs: ImageInput[] = [
    ...allWineIds.map((id) => ({ entityType: "wine", entityId: id, url: `https://picsum.photos/seed/${id}/800/600` })),
    ...allEventIds.map((id) => ({ entityType: "event", entityId: id, url: `https://picsum.photos/seed/${id}/1200/600` })),
  ];
  await insertImages(imageInputs);
  logger.info(`Inserted ${imageInputs.length} images`);

  logger.info("Demo seeding complete!");
  logger.info("─────────────────────────────────────────────────────────────────");
  logger.info("Demo accounts (log in via Clerk):");
  logger.info("  Admin:      admin@winery.demo");
  logger.info("  Winemaker:  pavlov@winery.demo   (Vinné sklepy Pavlov)");
  logger.info("  Shop owner: boutique@winery.demo  (Praha Wine Boutique)");
  logger.info("  Customer 1: jana@winery.demo      (active buyer + reviewer)");
  logger.info("  Customer 2: petr@winery.demo      (buyer, Brno)");
  logger.info("─────────────────────────────────────────────────────────────────");
}

main().catch((err) => {
  logger.error(err, "Demo seeding failed");
  process.exit(1);
});
