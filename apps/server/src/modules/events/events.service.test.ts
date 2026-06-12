import { beforeEach, describe, expect, it, vi } from "vitest";
import * as eventsRepo from "./events.repository";
import { eventsService } from "./events.service";

vi.mock("./events.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./events.repository")>();
  return {
    ...actual,
    countActiveRegistrations: vi.fn(),
    countComments: vi.fn(),
    countMany: vi.fn(),
    createComment: vi.fn(),
    createEvent: vi.fn(),
    createRegistration: vi.fn(),
    findActiveRegistration: vi.fn(),
    findById: vi.fn(),
    findComments: vi.fn(),
    findInvitationsByEventId: vi.fn(),
    findMany: vi.fn(),
    findRegistration: vi.fn(),
    findWinemakerByUserId: vi.fn(),
    insertAddress: vi.fn(),
    resolveWinemakerIdsByName: vi.fn(),
    softDelete: vi.fn(),
    softDeleteRegistration: vi.fn(),
    update: vi.fn(),
  };
});

vi.mock("../../db", () => {
  const m = {
    transaction: vi.fn((cb) => cb(m)),
  };
  return { db: m };
});

const userId = "11111111-1111-1111-1111-111111111111";
const winemakerId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const eventId = "cccccccc-cccc-cccc-cccc-cccccccccccc";
const registrationId = "dddddddd-dddd-dddd-dddd-dddddddddddd";
const commentId = "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee";

const futureStart = new Date(Date.now() + 86400000 * 7);
const futureEnd = new Date(Date.now() + 86400000 * 8);

const mockWinemaker = { id: winemakerId, name: "Test Winery" };

const mockApprovedEvent = {
  capacity: 10,
  deletedAt: null,
  endTime: futureEnd,
  id: eventId,
  startTime: futureStart,
  status: "approved",
  winemakerId,
} as any;

const validCreateInput = {
  address: {
    city: "Bratislava",
    country: "SK",
    houseNumber: "1",
    postalCode: "81000",
    street: "Main St",
  },
  capacity: 20,
  endTime: futureEnd.toISOString(),
  inviteType: "open",
  name: "Wine Tasting",
  startTime: futureStart.toISOString(),
  visibility: "public" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createEvent", () => {
  it("creates event when winemaker exists and dates are valid", async () => {
    vi.mocked(eventsRepo.findWinemakerByUserId).mockResolvedValue(mockWinemaker as any);
    vi.mocked(eventsRepo.insertAddress).mockResolvedValue({ id: "a1" } as any);
    vi.mocked(eventsRepo.createEvent).mockResolvedValue(mockApprovedEvent);

    await eventsService.createEvent(userId, validCreateInput);

    expect(eventsRepo.createEvent).toHaveBeenCalled();
  });

  it("throws FORBIDDEN when user has no winemaker profile", async () => {
    vi.mocked(eventsRepo.findWinemakerByUserId).mockResolvedValue(undefined);

    await expect(eventsService.createEvent(userId, validCreateInput)).rejects.toThrow(
      /FORBIDDEN|profile not found/i
    );
  });
});

describe("updateEvent", () => {
  it("updates own upcoming event", async () => {
    vi.mocked(eventsRepo.findById).mockResolvedValue(mockApprovedEvent);
    vi.mocked(eventsRepo.findWinemakerByUserId).mockResolvedValue(mockWinemaker as any);
    vi.mocked(eventsRepo.update).mockResolvedValue(mockApprovedEvent);

    await eventsService.updateEvent(eventId, userId, { name: "New Name" });

    expect(eventsRepo.update).toHaveBeenCalledWith(
      expect.anything(),
      eventId,
      expect.objectContaining({ name: "New Name" })
    );
  });

  it("throws EVENT_STATUS_CONFLICT when event has already started", async () => {
    const pastEvent = { ...mockApprovedEvent, startTime: new Date(Date.now() - 86400000) };
    vi.mocked(eventsRepo.findById).mockResolvedValue(pastEvent);
    vi.mocked(eventsRepo.findWinemakerByUserId).mockResolvedValue(mockWinemaker as any);

    await expect(
      eventsService.updateEvent(eventId, userId, { name: "New Name" })
    ).rejects.toThrow(/EVENT_STATUS_CONFLICT|already/i);
  });
});

describe("deleteEvent", () => {
  it("soft deletes own event", async () => {
    vi.mocked(eventsRepo.findById).mockResolvedValue(mockApprovedEvent);
    vi.mocked(eventsRepo.findWinemakerByUserId).mockResolvedValue(mockWinemaker as any);

    await eventsService.deleteEvent(eventId, userId);

    expect(eventsRepo.softDelete).toHaveBeenCalledWith(expect.anything(), eventId);
  });
});

describe("getEvent", () => {
  it("returns approved event", async () => {
    vi.mocked(eventsRepo.findById).mockResolvedValue(mockApprovedEvent);

    const result = await eventsService.getEvent(eventId);

    expect(result).toEqual(mockApprovedEvent);
  });
});

describe("listEvents", () => {
  it("always filters to approved status", async () => {
    vi.mocked(eventsRepo.findMany).mockResolvedValue([mockApprovedEvent]);
    vi.mocked(eventsRepo.countMany).mockResolvedValue(1);

    await eventsService.listEvents({}, { limit: 20, page: 1 });

    expect(eventsRepo.findMany).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ status: "approved" }),
      expect.any(Object)
    );
  });

  it("passes winemakerId directly when provided", async () => {
    vi.mocked(eventsRepo.findMany).mockResolvedValue([]);
    vi.mocked(eventsRepo.countMany).mockResolvedValue(0);

    await eventsService.listEvents({ winemakerId: winemakerId }, { limit: 20, page: 1 });

    expect(eventsRepo.findMany).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ winemakerIds: [winemakerId] }),
      expect.any(Object)
    );
  });

  it("passes q filter when provided", async () => {
    vi.mocked(eventsRepo.findMany).mockResolvedValue([]);
    vi.mocked(eventsRepo.countMany).mockResolvedValue(0);

    await eventsService.listEvents({ q: "harvest" }, { limit: 20, page: 1 });

    expect(eventsRepo.findMany).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ q: "harvest" }),
      expect.any(Object)
    );
  });
});

describe("listInvitations", () => {
  it("returns invitations for own event", async () => {
    vi.mocked(eventsRepo.findById).mockResolvedValue({ ...mockApprovedEvent, winemakerId });
    vi.mocked(eventsRepo.findWinemakerByUserId).mockResolvedValue(mockWinemaker as any);
    vi.mocked(eventsRepo.findInvitationsByEventId).mockResolvedValue([{ id: "inv1" }] as any);

    const result = await eventsService.listInvitations(eventId, userId);

    expect(result).toHaveLength(1);
  });

  it("throws NOT_FOUND when event does not exist", async () => {
    vi.mocked(eventsRepo.findById).mockResolvedValue(undefined);

    await expect(eventsService.listInvitations(eventId, userId)).rejects.toThrow("NOT_FOUND");
  });

  it("throws FORBIDDEN when requester does not own the event", async () => {
    vi.mocked(eventsRepo.findById).mockResolvedValue({
      ...mockApprovedEvent,
      winemakerId: "other",
    });
    vi.mocked(eventsRepo.findWinemakerByUserId).mockResolvedValue(mockWinemaker as any);

    await expect(eventsService.listInvitations(eventId, userId)).rejects.toThrow("FORBIDDEN");
  });
});

describe("registerForEvent", () => {
  it("creates registration for available event", async () => {
    vi.mocked(eventsRepo.findById).mockResolvedValue(mockApprovedEvent);
    vi.mocked(eventsRepo.createRegistration).mockResolvedValue({
      id: registrationId,
    } as any);

    await eventsService.registerForEvent(eventId, userId);

    expect(eventsRepo.createRegistration).toHaveBeenCalledWith(expect.anything(), eventId, userId);
  });
});

describe("unregisterFromEvent", () => {
  it("soft deletes active registration", async () => {
    vi.mocked(eventsRepo.findRegistration).mockResolvedValue({ id: registrationId } as any);

    await eventsService.unregisterFromEvent(eventId, userId);

    expect(eventsRepo.softDeleteRegistration).toHaveBeenCalledWith(
      expect.anything(),
      registrationId
    );
  });
});

describe("addComment", () => {
  it("creates comment on approved event", async () => {
    vi.mocked(eventsRepo.findById).mockResolvedValue(mockApprovedEvent);
    vi.mocked(eventsRepo.createComment).mockResolvedValue({ id: commentId } as any);

    await eventsService.addComment(eventId, userId, "Great event!");

    expect(eventsRepo.createComment).toHaveBeenCalledWith(
      expect.anything(),
      eventId,
      userId,
      "Great event!"
    );
  });
});

describe("listComments", () => {
  it("returns paginated comment result", async () => {
    vi.mocked(eventsRepo.findById).mockResolvedValue(mockApprovedEvent);
    vi.mocked(eventsRepo.findComments).mockResolvedValue([]);
    vi.mocked(eventsRepo.countComments).mockResolvedValue(0);

    const result = await eventsService.listComments(eventId, { limit: 10, page: 1 });

    expect(result).toEqual({ data: [], limit: 10, page: 1, total: 0 });
  });
});
