import { faker } from "@faker-js/faker";
import {
  addresses,
  availabilityExceptions,
  availabilityRegular,
  cartItems,
  carts,
  comments,
  eventComments,
  eventRegistrations,
  events,
  images,
  orderItems,
  orders,
  products,
  productWines,
  reviews,
  roleRequests,
  shops,
  supplyAgreements,
  userRoles,
  users,
  winemakers,
  wines,
} from "@repo/shared/schemas";
import { db } from "./index";

export async function teardown() {
  await db.delete(images);
  await db.delete(comments);
  await db.delete(reviews);
  await db.delete(eventComments);
  await db.delete(eventRegistrations);
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(cartItems);
  await db.delete(carts);
  await db.delete(availabilityExceptions);
  await db.delete(availabilityRegular);
  await db.delete(supplyAgreements);
  await db.delete(productWines);
  await db.delete(products);
  await db.delete(events);
  await db.delete(wines);
  await db.delete(roleRequests);
  await db.delete(userRoles);
  await db.delete(shops);
  await db.delete(winemakers);
  await db.delete(users);
  await db.delete(addresses);
}

export type AddressInput = {
  city: string;
  country: string;
  houseNumber: string;
  postalCode: string;
  street: string;
};

export async function insertAddresses(data: AddressInput[]) {
  if (data.length === 0) return [];
  return await db.insert(addresses).values(data).returning();
}

// Real, central street names per city — each verified to resolve in OpenStreetMap
// (Nominatim) when queried as "<street> 1, <city>, Czech Republic". The map embeds
// on the shop and event pages geocode the stored address at render time, so seeded
// addresses must point at places that actually exist or the map stays blank.
const STREETS_BY_CITY: Record<string, readonly string[]> = {
  Brno: ["náměstí Svobody", "Masarykova", "Zelný trh"],
  Bzenec: ["náměstí Svobody"],
  "Hradec Králové": ["Velké náměstí"],
  Hustopeče: ["Nádražní", "Mrštíkova"],
  Liberec: ["náměstí Dr. E. Beneše", "Pražská", "Moskevská"],
  Litoměřice: ["Mírové náměstí"],
  Mikulov: ["Náměstí"],
  Mělník: ["náměstí Míru"],
  Nymburk: ["náměstí Přemyslovců"],
  Olomouc: ["Horní náměstí", "Dolní náměstí"],
  Ostrava: ["Masarykovo náměstí", "Stodolní", "Nádražní"],
  Pardubice: ["Pernštýnské náměstí"],
  Pavlov: ["Klentnická", "Na Návsi"],
  Plzeň: ["náměstí Republiky", "Klatovská třída", "Americká"],
  Praha: ["Václavské náměstí", "Staroměstské náměstí", "Národní"],
  "Roudnice nad Labem": ["Karlovo náměstí"],
  "Uherské Hradiště": ["Masarykovo náměstí"],
  Valtice: ["náměstí Svobody"],
  "Velké Bílovice": ["Fabián"],
  Zlín: ["náměstí Míru"],
  Znojmo: ["Václavské náměstí"],
  "České Budějovice": ["náměstí Přemysla Otakara II."],
};

// Cities outside the verified set (e.g. customer-only towns that never render a map)
// fall back to a generic central street so addresses stay plausible.
const FALLBACK_STREETS = ["Hlavní", "Náměstí"] as const;

// Builds a geocodable Czech address for a city. The city is normalised first
// ("Brno - Spielberk Tower" → "Brno") because some demo entries tack a venue label
// onto the city, which both breaks geocoding and is wrong for an address field.
export function realCzechAddress(rawCity: string): AddressInput {
  const city = (rawCity.split(" - ")[0] ?? rawCity).trim();
  const streets = STREETS_BY_CITY[city] ?? FALLBACK_STREETS;
  return {
    city,
    country: "Czech Republic",
    houseNumber: "1",
    postalCode: `${faker.string.numeric(3)} ${faker.string.numeric(2)}`,
    street: faker.helpers.arrayElement([...streets]),
  };
}

export type UserInput = {
  clerkId: string;
  email: string;
  fname: string;
  lname: string;
  shippingAddressId?: string;
};

export async function insertUsers(data: UserInput[]) {
  if (data.length === 0) return [];
  return await db.insert(users).values(data).returning();
}

export async function insertUserRoles(data: { userId: string; role: string }[]) {
  if (data.length === 0) return;
  await db.insert(userRoles).values(data);
}

export type WinemakerId = {
  userId: string;
  name: string;
  description: string;
  addressId: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
};

export async function insertWinemakers(data: WinemakerId[]) {
  if (data.length === 0) return [];
  return await db.insert(winemakers).values(data).returning();
}

export type ShopInput = {
  ownerUserId: string;
  name: string;
  description: string;
  addressId: string;
};

export async function insertShops(data: ShopInput[]) {
  if (data.length === 0) return [];
  return await db.insert(shops).values(data).returning();
}

export type WineInput = {
  winemakerId: string;
  name: string;
  color: "red" | "white" | "rosé" | "orange" | "gray" | "tawny" | "yellow";
  type: "still" | "sparkling" | "fortified" | "dessert";
  region: string;
  vintageYear: number;
  alcoholContent: string;
  volumeMl: number;
  quantity: number;
  attribution: string;
  composition: string;
  description: string;
};

export async function insertWines(data: WineInput[]) {
  if (data.length === 0) return [];
  return await db.insert(wines).values(data).returning();
}

export type ProductInput = {
  shopId: string;
  name: string;
  price: string;
  quantity: number;
  isBundle: boolean;
  description?: string;
};

export async function insertProducts(data: ProductInput[]) {
  if (data.length === 0) return [];
  return await db.insert(products).values(data).returning();
}

export async function insertProductWines(
  data: { productId: string; wineId: string; quantity: number }[]
) {
  if (data.length === 0) return;
  await db.insert(productWines).values(data);
}

export type EventInput = {
  winemakerId: string;
  addressId: string;
  name: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
  visibility: "public" | "private";
  inviteType: string;
  status: "pending" | "approved" | "rejected";
};

export async function insertEvents(data: EventInput[]) {
  if (data.length === 0) return [];
  return await db.insert(events).values(data).returning();
}

export async function insertEventRegistrations(data: { eventId: string; userId: string }[]) {
  if (data.length === 0) return;
  await db.insert(eventRegistrations).values(data);
}

export type ReviewInput = {
  userId: string;
  entityType: string;
  entityId: string;
  rating: number;
  body?: string;
};

export async function insertReviews(data: ReviewInput[]) {
  if (data.length === 0) return [];
  return await db.insert(reviews).values(data).returning();
}

export type CommentInput = {
  reviewId: string;
  userId: string;
  body: string;
};

export async function insertComments(data: CommentInput[]) {
  if (data.length === 0) return;
  await db.insert(comments).values(data);
}

export type OrderInput = {
  userId: string;
  shippingAddressId: string;
  billingAddressId: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  deliveryType: "pickup" | "shipping";
  paymentMethod: "card" | "bank_transfer" | "cash_on_delivery";
  paymentStatus:
    | "pending"
    | "authorized"
    | "captured"
    | "failed"
    | "cancelled"
    | "refunded"
    | "partially_refunded";
  totalPrice: string;
  discount: string;
  shippingFee: string;
};

export async function insertOrders(data: OrderInput[]) {
  if (data.length === 0) return [];
  return await db.insert(orders).values(data).returning();
}

export type OrderItemInput = {
  orderId: string;
  productId: string;
  shopId: string;
  quantity: number;
  unitPriceAtPurchase: string;
};

export async function insertOrderItems(data: OrderItemInput[]) {
  if (data.length === 0) return;
  await db.insert(orderItems).values(data);
}

export async function insertSupplyAgreements(
  data: { shopId: string; winemakerId: string; status: "pending" | "approved" | "rejected" }[]
) {
  if (data.length === 0) return;
  await db.insert(supplyAgreements).values(data);
}

export type AvailabilityInput = {
  shopId: string;
  winemakerId?: string;
  dow: number;
  startTime: Date;
  endTime: Date;
  type: string;
  validFrom: string;
  validTo?: string;
};

export async function insertAvailabilityRegular(data: AvailabilityInput[]) {
  if (data.length === 0) return;
  await db.insert(availabilityRegular).values(data);
}

export async function insertRoleRequests(
  data: {
    userId: string;
    type: "winemaker" | "shop_owner";
    businessName: string;
    details?: string;
  }[]
) {
  if (data.length === 0) return;
  await db.insert(roleRequests).values(data);
}

export type ImageInput = {
  entityType: string;
  entityId: string;
  url: string;
};

export async function insertImages(data: ImageInput[]) {
  if (data.length === 0) return;
  await db.insert(images).values(data);
}

export type EventCommentInput = {
  eventId: string;
  userId: string;
  body: string;
};

export async function insertEventComments(data: EventCommentInput[]) {
  if (data.length === 0) return;
  await db.insert(eventComments).values(data);
}

export type AvailabilityExceptionInput = {
  shopId: string;
  winemakerId?: string;
  startsAt: Date;
  endsAt: Date;
  action: string;
  reason?: string;
};

export async function insertAvailabilityExceptions(data: AvailabilityExceptionInput[]) {
  if (data.length === 0) return;
  await db.insert(availabilityExceptions).values(data);
}
