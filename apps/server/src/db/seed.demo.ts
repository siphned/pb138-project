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
  insertEventRegistrations,
  insertEvents,
  insertOrderItems,
  insertOrders,
  insertProductWines,
  insertProducts,
  insertReviews,
  insertShops,
  insertSupplyAgreements,
  insertUserRoles,
  insertUsers,
  insertWinemakers,
  insertWines,
  teardown,
} from "./seed.lib";

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(
      `Missing required env var: ${key}. Add it to .env.local before running demo seed.`,
    );
  }
  return val;
}

function must<T>(val: T | undefined, name: string): T {
  if (val === undefined) throw new Error(`Seed: ${name} is undefined — insert failed`);
  return val;
}

const CLERK = {
  admin: requireEnv("DEMO_ADMIN_CLERK_ID"),
  winemaker: requireEnv("DEMO_WINEMAKER_CLERK_ID"),
  shopOwner: requireEnv("DEMO_SHOP_OWNER_CLERK_ID"),
  customer: requireEnv("DEMO_CUSTOMER_CLERK_ID"),
};

async function main() {
  await teardown();
  logger.info("Demo seed started");

  // ── Addresses ──────────────────────────────────────────────────────────────
  const addrInputs: AddressInput[] = [
    // 0: admin
    {
      city: "Praha",
      country: "Czech Republic",
      houseNumber: "12",
      postalCode: "110 00",
      street: "Václavské náměstí",
    },
    // 1: winemaker Pavlov
    {
      city: "Pavlov",
      country: "Czech Republic",
      houseNumber: "5",
      postalCode: "692 01",
      street: "Vinařská",
    },
    // 2: winemaker Valtice
    {
      city: "Valtice",
      country: "Czech Republic",
      houseNumber: "1",
      postalCode: "691 42",
      street: "Náměstí Svobody",
    },
    // 3: shop Praha
    {
      city: "Praha",
      country: "Czech Republic",
      houseNumber: "8",
      postalCode: "110 00",
      street: "Dlouhá",
    },
    // 4: shop Brno
    {
      city: "Brno",
      country: "Czech Republic",
      houseNumber: "22",
      postalCode: "602 00",
      street: "Náměstí Svobody",
    },
    // 5: shop owner
    {
      city: "Praha",
      country: "Czech Republic",
      houseNumber: "3",
      postalCode: "120 00",
      street: "Mánesova",
    },
    // 6: customer
    {
      city: "Praha",
      country: "Czech Republic",
      houseNumber: "7",
      postalCode: "130 00",
      street: "Korunní",
    },
    // 7: unused padding slot (keeps index stable)
    {
      city: "Praha",
      country: "Czech Republic",
      houseNumber: "7",
      postalCode: "130 00",
      street: "Korunní",
    },
    // 8: event 1
    {
      city: "Pavlov",
      country: "Czech Republic",
      houseNumber: "5",
      postalCode: "692 01",
      street: "Vinařská",
    },
    // 9: event 2
    {
      city: "Brno",
      country: "Czech Republic",
      houseNumber: "22",
      postalCode: "602 00",
      street: "Náměstí Svobody",
    },
  ];
  const addrRows = await insertAddresses(addrInputs);

  // ── Users ──────────────────────────────────────────────────────────────────
  const userInputs: UserInput[] = [
    {
      clerkId: CLERK.admin,
      email: "admin@winery.demo",
      fname: "Adam",
      lname: "Admin",
      shippingAddressId: addrRows[0]!.id,
    },
    {
      clerkId: CLERK.winemaker,
      email: "vinohrady@winery.demo",
      fname: "Jakub",
      lname: "Vinař",
      shippingAddressId: addrRows[1]!.id,
    },
    {
      clerkId: CLERK.shopOwner,
      email: "obchod@winery.demo",
      fname: "Pavel",
      lname: "Obchodník",
      shippingAddressId: addrRows[5]!.id,
    },
    {
      clerkId: CLERK.customer,
      email: "zakaznik@winery.demo",
      fname: "Jana",
      lname: "Zákazník",
      shippingAddressId: addrRows[6]!.id,
    },
  ];
  const insertedUsers = await insertUsers(userInputs);
  const adminUser = must(insertedUsers[0], "adminUser");
  const winemakerUser = must(insertedUsers[1], "winemakerUser");
  const shopOwnerUser = must(insertedUsers[2], "shopOwnerUser");
  const customerUser = must(insertedUsers[3], "customerUser");

  await insertUserRoles([
    { userId: adminUser.id, role: "admin" },
    { userId: winemakerUser.id, role: "winemaker" },
    { userId: shopOwnerUser.id, role: "shop_owner" },
    { userId: customerUser.id, role: "customer" },
  ]);

  // ── Winemakers ─────────────────────────────────────────────────────────────
  const winemakerInputs: WinemakerId[] = [
    {
      userId: winemakerUser.id,
      name: "Vinné sklepy Pavlov",
      description:
        "Rodinné vinné sklepy v srdci Mikulovské vinařské oblasti. Specialitou jsou bílá vína z odrůdy Pálava a Welschriesling.",
      addressId: addrRows[1]!.id,
      email: "info@vinnesklepypavlov.cz",
      phone: "+420 519 430 111",
      websiteUrl: "https://vinnesklepypavlov.cz",
    },
    {
      userId: adminUser.id,
      name: "Chateau Valtice",
      description:
        "Prestižní vinařství sídlící v historickém Valticském zámku. Specializuje se na prémiová červená vína a výběry z bobulí.",
      addressId: addrRows[2]!.id,
      email: "info@chateauvaltice.cz",
      phone: "+420 519 352 422",
      websiteUrl: "https://chateauvaltice.cz",
    },
  ];
  const winemakerRows = await insertWinemakers(winemakerInputs);
  const wm1 = must(winemakerRows[0], "wm1");
  const wm2 = must(winemakerRows[1], "wm2");

  // ── Shops ──────────────────────────────────────────────────────────────────
  const shopInputs: ShopInput[] = [
    {
      ownerUserId: shopOwnerUser.id,
      name: "Praha Wine Boutique",
      description:
        "Specializovaná prodejna moravských vín v centru Prahy. Nabízíme pečlivě vybraná vína od lokálních vinařů.",
      addressId: addrRows[3]!.id,
    },
    {
      ownerUserId: shopOwnerUser.id,
      name: "Vinárna Brno",
      description:
        "Útulná vinárna a vinotéka v centru Brna. Každý měsíc pořádáme degustace a tematické večery.",
      addressId: addrRows[4]!.id,
    },
  ];
  const shopRows = await insertShops(shopInputs);
  const shop1 = must(shopRows[0], "shop1");
  const shop2 = must(shopRows[1], "shop2");

  // ── Wines ──────────────────────────────────────────────────────────────────
  const wineInputs: WineInput[] = [
    // Vinné sklepy Pavlov (indices 0–6)
    {
      winemakerId: wm1.id,
      name: "Pálava 2022",
      color: "white",
      type: "still",
      region: "Mikulovská",
      vintageYear: 2022,
      alcoholContent: "13.50",
      volumeMl: 750,
      quantity: 120,
      attribution: "Estate",
      composition: "100% Pálava",
      description:
        "Aromatické bílé víno s tóny broskví, meruněk a lístků růže. Sametová chuť s příjemnou sladkostí a svěží kyselinou.",
    },
    {
      winemakerId: wm1.id,
      name: "Frankovka 2020",
      color: "red",
      type: "still",
      region: "Velkopavlovická",
      vintageYear: 2020,
      alcoholContent: "13.00",
      volumeMl: 750,
      quantity: 85,
      attribution: "Estate",
      composition: "100% Frankovka",
      description:
        "Plné červené víno s tóny třešní, švestek a jemného koření. Taniny jsou zralé a příjemné.",
    },
    {
      winemakerId: wm1.id,
      name: "Veltlínské zelené 2023",
      color: "white",
      type: "still",
      region: "Znojemská",
      vintageYear: 2023,
      alcoholContent: "12.00",
      volumeMl: 750,
      quantity: 200,
      attribution: "Single Vineyard",
      composition: "100% Veltlínské zelené",
      description: "Svěží suché bílé víno s charakteristickými tóny pepře, citrusů a bylinek.",
    },
    {
      winemakerId: wm1.id,
      name: "Müller-Thurgau 2022",
      color: "white",
      type: "still",
      region: "Mikulovská",
      vintageYear: 2022,
      alcoholContent: "11.50",
      volumeMl: 750,
      quantity: 150,
      attribution: "Estate",
      composition: "100% Müller-Thurgau",
      description:
        "Lehké, svěží víno s delikátními tóny muškátu a citronové kůry. Ideální jako aperitiv.",
    },
    {
      winemakerId: wm1.id,
      name: "Rulandské šedé 2021",
      color: "white",
      type: "still",
      region: "Slovácká",
      vintageYear: 2021,
      alcoholContent: "14.00",
      volumeMl: 750,
      quantity: 60,
      attribution: "Reserve",
      composition: "100% Rulandské šedé",
      description:
        "Elegantní víno s bohatou texturou, tóny hrušek, vanilky a jemného toastu. Dlouhý finiš.",
    },
    {
      winemakerId: wm1.id,
      name: "Rosé Cuvée 2022",
      color: "rosé",
      type: "still",
      region: "Slovácká",
      vintageYear: 2022,
      alcoholContent: "12.50",
      volumeMl: 750,
      quantity: 90,
      attribution: "Estate",
      composition: "Frankovka, Zweigeltrebe",
      description:
        "Svěží rosé s živými tóny jahod, malin a červeného grapefruitu. Perfektní letní víno.",
    },
    {
      winemakerId: wm1.id,
      name: "Pálava Sekt 2022",
      color: "white",
      type: "sparkling",
      region: "Mikulovská",
      vintageYear: 2022,
      alcoholContent: "12.00",
      volumeMl: 750,
      quantity: 45,
      attribution: "Estate",
      composition: "100% Pálava",
      description:
        "Elegantní sekt s jemnými bublinkami a aroma čerstvých hroznů, broskví a citrusových květů.",
    },
    // Chateau Valtice (indices 7–14)
    {
      winemakerId: wm2.id,
      name: "Zweigeltrebe 2019",
      color: "red",
      type: "still",
      region: "Velkopavlovická",
      vintageYear: 2019,
      alcoholContent: "13.50",
      volumeMl: 750,
      quantity: 70,
      attribution: "Grand Cru",
      composition: "100% Zweigeltrebe",
      description:
        "Charakterní víno s intenzivními tóny tmavého ovoce, tabáku a vanilky. Harmonické taniny.",
    },
    {
      winemakerId: wm2.id,
      name: "Sauvignon 2023",
      color: "white",
      type: "still",
      region: "Znojemská",
      vintageYear: 2023,
      alcoholContent: "12.50",
      volumeMl: 750,
      quantity: 180,
      attribution: "Estate",
      composition: "100% Sauvignon",
      description:
        "Výrazné víno s tóny černého rybízu, kopřiv a tropického ovoce. Osvěžující kyselina a čistý projev.",
    },
    {
      winemakerId: wm2.id,
      name: "Neuburské 2021",
      color: "white",
      type: "still",
      region: "Mikulovská",
      vintageYear: 2021,
      alcoholContent: "13.00",
      volumeMl: 750,
      quantity: 55,
      attribution: "Single Vineyard",
      composition: "100% Neuburské",
      description:
        "Plné, aromatické víno s okvětními tóny, medem a suchým ovocem. Typická odrůdová výraznost.",
    },
    {
      winemakerId: wm2.id,
      name: "Modrý Portugal 2020",
      color: "red",
      type: "still",
      region: "Slovácká",
      vintageYear: 2020,
      alcoholContent: "12.00",
      volumeMl: 750,
      quantity: 110,
      attribution: "Estate",
      composition: "100% Modrý Portugal",
      description:
        "Lehčí červené víno s příjemnými tóny červeného ovoce a jemnými taniny. Vhodné k dennímu pití.",
    },
    {
      winemakerId: wm2.id,
      name: "Rulandské modré 2018",
      color: "red",
      type: "still",
      region: "Velkopavlovická",
      vintageYear: 2018,
      alcoholContent: "14.50",
      volumeMl: 750,
      quantity: 30,
      attribution: "Reserve",
      composition: "100% Rulandské modré",
      description:
        "Prémiové červené víno s komplexními tóny třešní, vanilky a dubového sudu. Elegantní a vyrovnané.",
    },
    {
      winemakerId: wm2.id,
      name: "Ryzlink vlašský 2022",
      color: "white",
      type: "still",
      region: "Mikulovská",
      vintageYear: 2022,
      alcoholContent: "12.00",
      volumeMl: 750,
      quantity: 140,
      attribution: "Estate",
      composition: "100% Ryzlink vlašský",
      description:
        "Svěží a ovocné víno s tóny citrusů, zeleného jablka a jemné minerality. Klasika moravských vín.",
    },
    {
      winemakerId: wm2.id,
      name: "Cabernet Sauvignon 2019",
      color: "red",
      type: "still",
      region: "Znojemská",
      vintageYear: 2019,
      alcoholContent: "14.00",
      volumeMl: 750,
      quantity: 40,
      attribution: "Grand Cru",
      composition: "100% Cabernet Sauvignon",
      description:
        "Výjimečné červené víno s plnými tóny černého rybízu, cédru a koření. Strukturované taniny a dlouhý finiš.",
    },
    {
      winemakerId: wm2.id,
      name: "Hibernal 2023",
      color: "white",
      type: "still",
      region: "Čechy",
      vintageYear: 2023,
      alcoholContent: "11.50",
      volumeMl: 750,
      quantity: 75,
      attribution: "Estate",
      composition: "100% Hibernal",
      description:
        "Odolná odrůda pěstovaná v Čechách. Svěží víno s tóny hroznů, citrusů a jemné minerality.",
    },
  ];
  const wineRows = await insertWines(wineInputs);
  logger.info(`Inserted ${wineRows.length} wines`);

  // ── Products ───────────────────────────────────────────────────────────────
  const pricesMap: Record<string, string> = {
    "Pálava 2022": "18.00",
    "Frankovka 2020": "22.00",
    "Veltlínské zelené 2023": "16.00",
    "Müller-Thurgau 2022": "14.00",
    "Rulandské šedé 2021": "24.00",
    "Rosé Cuvée 2022": "20.00",
    "Pálava Sekt 2022": "32.00",
    "Zweigeltrebe 2019": "28.00",
    "Sauvignon 2023": "21.00",
    "Neuburské 2021": "19.00",
    "Modrý Portugal 2020": "17.00",
    "Rulandské modré 2018": "45.00",
    "Ryzlink vlašský 2022": "15.00",
    "Cabernet Sauvignon 2019": "38.00",
    "Hibernal 2023": "22.00",
  };

  // Shop 1 (Praha): wm1 wines + Zweigeltrebe + Sauvignon from wm2
  const shop1WineIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  // Shop 2 (Brno): cross-winery selection
  const shop2WineIndices = [0, 1, 5, 7, 9, 10, 11, 12];

  const productInputs1: ProductInput[] = shop1WineIndices.map((idx) => ({
    shopId: shop1.id,
    name: wineRows[idx]!.name,
    price: pricesMap[wineRows[idx]!.name] ?? "20.00",
    quantity: 50,
    isBundle: false,
  }));
  const insertedProducts1 = await insertProducts(productInputs1);
  await insertProductWines(
    insertedProducts1.map((p, i) => ({
      productId: p.id,
      wineId: wineRows[shop1WineIndices[i]!]!.id,
      quantity: 1,
    }))
  );

  const productInputs2: ProductInput[] = shop2WineIndices.map((idx) => ({
    shopId: shop2.id,
    name: wineRows[idx]!.name,
    price: pricesMap[wineRows[idx]!.name] ?? "20.00",
    quantity: 40,
    isBundle: false,
  }));
  const insertedProducts2 = await insertProducts(productInputs2);
  await insertProductWines(
    insertedProducts2.map((p, i) => ({
      productId: p.id,
      wineId: wineRows[shop2WineIndices[i]!]!.id,
      quantity: 1,
    }))
  );

  logger.info(`Inserted ${insertedProducts1.length + insertedProducts2.length} products`);

  // ── Events ─────────────────────────────────────────────────────────────────
  const now = Date.now();
  const event1Start = new Date(now + 21 * 86_400_000);
  const event2Start = new Date(now + 42 * 86_400_000);

  const eventInputs: EventInput[] = [
    {
      winemakerId: wm1.id,
      addressId: addrRows[8]!.id,
      name: "Velká degustace Mikulov 2026",
      description:
        "Slavnostní degustace nejlepších vín z Mikulovské oblasti. Ochutnáte 12 vín s odborným výkladem sommeliera. Součástí je prohlídka historických sklepů.",
      startTime: event1Start,
      endTime: new Date(event1Start.getTime() + 3 * 3_600_000),
      capacity: 40,
      visibility: "public",
      inviteType: "open",
      status: "approved",
    },
    {
      winemakerId: wm2.id,
      addressId: addrRows[9]!.id,
      name: "Podzimní ochutnávka Brno",
      description:
        "Večerní degustace podzimních novinek od Chateau Valtice. V nabídce budou letošní přívlastková vína a pozdní sběry.",
      startTime: event2Start,
      endTime: new Date(event2Start.getTime() + 2.5 * 3_600_000),
      capacity: 25,
      visibility: "public",
      inviteType: "open",
      status: "approved",
    },
  ];
  const eventRows = await insertEvents(eventInputs);
  await insertEventRegistrations([
    { eventId: eventRows[0]!.id, userId: customerUser.id },
    { eventId: eventRows[1]!.id, userId: customerUser.id },
  ]);
  logger.info(`Inserted ${eventRows.length} events with registrations`);

  // ── Availability ───────────────────────────────────────────────────────────
  const today = new Date();
  const validFrom = today.toISOString().slice(0, 10);
  const h = (hour: number) => {
    const d = new Date(today);
    d.setHours(hour, 0, 0, 0);
    return d;
  };
  const availInputs: AvailabilityInput[] = [
    ...[1, 2, 3, 4, 5].map((dow) => ({
      shopId: shop1.id,
      dow,
      startTime: h(9),
      endTime: h(19),
      type: "open",
      validFrom,
    })),
    { shopId: shop1.id, dow: 6, startTime: h(10), endTime: h(17), type: "open", validFrom },
    ...[1, 2, 3, 4, 5].map((dow) => ({
      shopId: shop2.id,
      dow,
      startTime: h(10),
      endTime: h(20),
      type: "open",
      validFrom,
    })),
  ];
  await insertAvailabilityRegular(availInputs);

  // ── Supply Agreements ──────────────────────────────────────────────────────
  await insertSupplyAgreements([
    { shopId: shop1.id, winemakerId: wm1.id, status: "approved" },
    { shopId: shop1.id, winemakerId: wm2.id, status: "approved" },
    { shopId: shop2.id, winemakerId: wm1.id, status: "approved" },
  ]);

  // ── Order ──────────────────────────────────────────────────────────────────
  // Fresh frozen address rows per order (business rule)
  const orderShipAddrs = await insertAddresses([{ city: "Praha", country: "Czech Republic", houseNumber: "7", postalCode: "130 00", street: "Korunní" }]);
  const orderBillAddrs = await insertAddresses([{ city: "Praha", country: "Czech Republic", houseNumber: "7", postalCode: "130 00", street: "Korunní" }]);
  const orderShipAddr = must(orderShipAddrs[0], "orderShipAddr");
  const orderBillAddr = must(orderBillAddrs[0], "orderBillAddr");

  const orderInput: OrderInput = {
    userId: customerUser.id,
    shippingAddressId: orderShipAddr.id,
    billingAddressId: orderBillAddr.id,
    status: "delivered",
    deliveryType: "shipping",
    paymentMethod: "card",
    paymentStatus: "captured",
    totalPrice: "87.00",
    discount: "0.00",
    shippingFee: "5.00",
  };
  const insertedOrders = await insertOrders([orderInput]);
  const completedOrder = must(insertedOrders[0], "completedOrder");

  // Pálava 2022 ×2 (€18×2) + Frankovka 2020 ×1 (€22) + Rulandské šedé 2021 ×1 (€24) + shipping €5 = €87
  const palavaProd = must(insertedProducts1[0], "palavaProd");
  const frankovkaProd = must(insertedProducts1[1], "frankovkaProd");
  const rulanskeProd = must(insertedProducts1[4], "rulanskeProd");
  await insertOrderItems([
    {
      orderId: completedOrder.id,
      productId: palavaProd.id,
      shopId: shop1.id,
      quantity: 2,
      unitPriceAtPurchase: "18.00",
    },
    {
      orderId: completedOrder.id,
      productId: frankovkaProd.id,
      shopId: shop1.id,
      quantity: 1,
      unitPriceAtPurchase: "22.00",
    },
    {
      orderId: completedOrder.id,
      productId: rulanskeProd.id,
      shopId: shop1.id,
      quantity: 1,
      unitPriceAtPurchase: "24.00",
    },
  ]);
  logger.info("Inserted 1 completed order (3 items)");

  // ── Reviews ────────────────────────────────────────────────────────────────
  const reviewInputs: ReviewInput[] = [
    {
      userId: customerUser.id,
      entityType: "product",
      entityId: palavaProd.id,
      rating: 5,
      body: "Absolutně úžasná Pálava! Intenzivní vůně, skvělá rovnováha mezi sladkostí a kyselinou. Toto víno budu objednávat pravidelně.",
    },
    {
      userId: customerUser.id,
      entityType: "product",
      entityId: frankovkaProd.id,
      rating: 4,
      body: "Výborná Frankovka s typickým charakterem. Plná chuť s příjemnými třešňovými tóny. Skvělá k červenému masu.",
    },
    {
      userId: customerUser.id,
      entityType: "winemaker",
      entityId: wm1.id,
      rating: 5,
      body: "Vinné sklepy Pavlov jsou jedním z nejlepších moravských vinařství. Každé víno, které jsem od nich ochutnal, bylo výjimečné.",
    },
    {
      userId: customerUser.id,
      entityType: "winemaker",
      entityId: wm2.id,
      rating: 4,
      body: "Chateau Valtice produkuje prémiová vína s konzistentní kvalitou. Zvláště doporučuji jejich Rulandské modré.",
    },
  ];
  const insertedReviews = await insertReviews(reviewInputs);

  const commentInputs: CommentInput[] = [
    {
      reviewId: insertedReviews[0]!.id,
      userId: customerUser.id,
      body: "Souhlasím, tato Pálava je opravdu výjimečná. Přímo z vinice má ještě lepší charakter.",
    },
    {
      reviewId: insertedReviews[2]!.id,
      userId: customerUser.id,
      body: "Byl jsem tam osobně navštívit sklepy — nádherné místo a přátelský personál.",
    },
  ];
  await insertComments(commentInputs);
  logger.info(`Inserted ${insertedReviews.length} reviews and ${commentInputs.length} comments`);

  logger.info("Demo seeding complete!");
  logger.info("─────────────────────────────────────────────────");
  logger.info("Demo accounts (log in via Clerk):");
  logger.info("  Admin:      admin@winery.demo");
  logger.info("  Winemaker:  vinohrady@winery.demo");
  logger.info("  Shop Owner: obchod@winery.demo");
  logger.info("  Customer:   zakaznik@winery.demo");
  logger.info("─────────────────────────────────────────────────");
}

main().catch((err) => {
  logger.error(err, "Demo seeding failed");
  process.exit(1);
});
