export function mockUser(overrides: Record<string, unknown> = {}) {
  return {
    clerkId: "clerk-u1",
    createdAt: new Date("2025-01-01"),
    deletedAt: null,
    email: "test@example.com",
    id: "u1",
    name: "Test User",
    role: "customer",
    updatedAt: null,
    ...overrides,
  };
}

export function mockWine(overrides: Record<string, unknown> = {}) {
  return {
    color: "red",
    createdAt: new Date("2025-01-01"),
    deletedAt: null,
    description: "A test wine",
    id: "w1",
    name: "Test Wine",
    region: "Moravia",
    type: "dry",
    updatedAt: null,
    winemakerId: "wm1",
    year: 2020,
    ...overrides,
  };
}

export function mockWinemaker(overrides: Record<string, unknown> = {}) {
  return {
    bio: "Test bio",
    createdAt: new Date("2025-01-01"),
    deletedAt: null,
    id: "wm1",
    location: "Brno",
    name: "Test Winery",
    updatedAt: null,
    userId: "u1",
    ...overrides,
  };
}

export function mockShop(overrides: Record<string, unknown> = {}) {
  return {
    city: "Brno",
    country: "CZ",
    createdAt: new Date("2025-01-01"),
    deletedAt: null,
    description: "A test shop",
    houseNumber: "1",
    id: "s1",
    name: "Test Shop",
    ownerUserId: "u1",
    postalCode: "60200",
    street: "Test Street",
    updatedAt: null,
    ...overrides,
  };
}

export function mockProduct(overrides: Record<string, unknown> = {}) {
  return {
    createdAt: new Date("2025-01-01"),
    deletedAt: null,
    id: "p1",
    price: "150.00",
    shopId: "s1",
    stock: 10,
    updatedAt: null,
    wineId: "w1",
    ...overrides,
  };
}

export function mockEvent(overrides: Record<string, unknown> = {}) {
  return {
    capacity: 50,
    createdAt: new Date("2025-01-01"),
    date: new Date("2025-12-01"),
    deletedAt: null,
    description: "A test event",
    id: "e1",
    location: "Brno",
    name: "Test Event",
    status: "approved",
    updatedAt: null,
    winemakerId: "wm1",
    ...overrides,
  };
}

export function mockOrder(overrides: Record<string, unknown> = {}) {
  return {
    billingAddressId: "addr-1",
    createdAt: new Date(),
    deletedAt: null,
    deliveryType: "shipping",
    discount: "0.00",
    guestEmail: "test@example.com",
    guestName: null,
    guestSessionId: "s1",
    id: "o1",
    paymentMethod: "card",
    paymentStatus: "pending",
    shippingAddressId: "addr-1",
    shippingFee: "10.00",
    status: "pending",
    totalPrice: "60.00",
    updatedAt: null,
    userId: null,
    ...overrides,
  };
}

export function mockReview(overrides: Record<string, unknown> = {}) {
  return {
    comment: "Great!",
    createdAt: new Date("2025-01-01"),
    deletedAt: null,
    entityId: "w1",
    entityType: "wine",
    id: "r1",
    rating: 5,
    updatedAt: null,
    userId: "u1",
    ...overrides,
  };
}

export function mockSupplyAgreement(overrides: Record<string, unknown> = {}) {
  return {
    createdAt: new Date("2025-01-01"),
    deletedAt: null,
    id: "sa1",
    pricePerUnit: "100.00",
    productId: "p1",
    quantity: 20,
    shopId: "s1",
    status: "pending",
    updatedAt: null,
    winemakerId: "wm1",
    ...overrides,
  };
}
