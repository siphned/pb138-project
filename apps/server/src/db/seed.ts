import { faker } from "@faker-js/faker";
import { logger } from "../utils/logger";
import {
  type AddressInput,
  type AvailabilityInput,
  type CommentInput,
  type EventInput,
  type OrderInput,
  type ProductInput,
  type ReviewInput,
  type ShopInput,
  type UserInput,
  type WineInput,
  type WinemakerId,
  insertAddresses,
  insertAvailabilityRegular,
  insertComments,
  insertEvents,
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

function clerkId() {
  return `user_seed_${faker.string.alphanumeric(24)}`;
}

function czechAddress(): AddressInput {
  return {
    city: faker.helpers.arrayElement(["Praha", "Brno", "Ostrava", "Olomouc", "Plzeň", "Liberec"]),
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
  const allProducts: { id: string }[] = [];
  for (let i = 0; i < winemakerRows.length; i++) {
    const wm = winemakerRows[i]!;
    const wineInputs: WineInput[] = Array.from({ length: WINES_PER_WINEMAKER }, () => ({
      winemakerId: wm.id,
      name: faker.commerce.productName(),
      color: pick(COLORS),
      type: pick(TYPES),
      region: pick(REGIONS),
      vintageYear: faker.number.int({ min: 2015, max: 2023 }),
      alcoholContent: faker.number.float({ min: 9, max: 16, fractionDigits: 1 }).toFixed(2),
      volumeMl: pick([375, 750, 1500] as const),
      quantity: faker.number.int({ min: 10, max: 500 }),
      attribution: faker.helpers.arrayElement(["Estate", "Single Vineyard", "Reserve", "Grand Cru"]),
      composition: faker.helpers.arrayElement(["100% Cabernet", "Blend", "Single varietal", "Mixed"]),
      description: faker.lorem.paragraph(),
    }));
    const insertedWines = await insertWines(wineInputs);
    totalWineCount += insertedWines.length;

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
      await insertProductWines(
        insertedProducts.map((product, j) => ({
          productId: product.id,
          wineId: insertedWines[j]!.id,
          quantity: 1,
        })),
      );
      allProducts.push(...insertedProducts);
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
  await insertEvents(eventInputs);
  logger.info(`Inserted ${eventInputs.length} events`);

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
  const availInputs: AvailabilityInput[] = shopRows.flatMap((shop) =>
    [1, 2, 3, 4, 5].map((dow) => {
      const start = new Date(today);
      start.setHours(9, 0, 0, 0);
      const end = new Date(today);
      end.setHours(18, 0, 0, 0);
      return { shopId: shop.id, dow, startTime: start, endTime: end, type: "open", validFrom };
    }),
  );
  await insertAvailabilityRegular(availInputs);
  logger.info(`Inserted ${availInputs.length} availability rows`);

  // ── Supply Agreements ──────────────────────────────────────────────────────
  logger.info("Inserting supply agreements...");
  const supplyInputs = shopRows.map((shop) => ({
    shopId: shop.id,
    winemakerId: pick(winemakerRows).id,
    status: "approved" as const,
  }));
  await insertSupplyAgreements(supplyInputs);
  logger.info(`Inserted ${supplyInputs.length} supply agreements`);

  // ── Reviews ────────────────────────────────────────────────────────────────
  logger.info("Inserting reviews...");
  const reviewInputs: ReviewInput[] = [];
  const productReviewers = faker.helpers.arrayElements(
    customers,
    Math.floor(customers.length * 0.4),
  );
  for (const reviewer of productReviewers) {
    const product = pick(allProducts);
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
    reviewInputs.push({
      userId: reviewer.id,
      entityType: "winemaker",
      entityId: pick(winemakerRows).id,
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

  // ── Orders ─────────────────────────────────────────────────────────────────
  logger.info("Inserting orders...");
  const buyerPool = faker.helpers.arrayElements(
    customers,
    Math.floor(customers.length * 0.3),
  );
  const orderAddrRows = await insertAddresses(
    buyerPool.flatMap(() => [czechAddress(), czechAddress()]),
  );
  const orderInputs: OrderInput[] = buyerPool.map((buyer, i) => ({
    userId: buyer.id,
    shippingAddressId: orderAddrRows[i * 2]!.id,
    billingAddressId: orderAddrRows[i * 2 + 1]!.id,
    status: pick(["confirmed", "shipped", "delivered"] as const),
    deliveryType: pick(["pickup", "shipping"] as const),
    paymentMethod: pick(["card", "bank_transfer", "cash_on_delivery"] as const),
    paymentStatus: "captured" as const,
    totalPrice: faker.commerce.price({ min: 15, max: 300 }),
    discount: "0.00",
    shippingFee: pick(["0.00", "5.00", "10.00"] as const),
  }));
  const insertedOrders = await insertOrders(orderInputs);
  logger.info(`Inserted ${insertedOrders.length} orders`);

  // ── Role Requests ──────────────────────────────────────────────────────────
  logger.info("Inserting role requests...");
  const roleReqPool = faker.helpers.arrayElements(customers, Math.min(10, customers.length));
  await insertRoleRequests(
    roleReqPool.map((user) => ({
      userId: user.id,
      type: pick(["winemaker", "shop_owner"] as const),
      businessName: faker.company.name(),
      details: faker.lorem.sentence(),
    })),
  );

  logger.info("Dev seeding complete!");
}

main().catch((err) => {
  logger.error(err, "Seeding failed");
  process.exit(1);
});
