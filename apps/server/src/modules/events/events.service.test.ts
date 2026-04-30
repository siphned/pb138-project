import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./events.repository", () => ({
  eventsRepository: {
    countActiveRegistrations: vi.fn(),
    countComments: vi.fn(),
    countMany: vi.fn(),
    createComment: vi.fn(),
    createEventWithAddress: vi.fn(),
    createRegistration: vi.fn(),
    findActiveRegistration: vi.fn(),
    findById: vi.fn(),
    findComments: vi.fn(),
    findMany: vi.fn(),
    findWinemakerByUserId: vi.fn(),
    resolveWinemakerIdsByName: vi.fn(),
    softDelete: vi.fn(),
    softDeleteRegistration: vi.fn(),
    update: vi.fn(),
  },
}));

import type { EventWithDetails } from "./events.repository";
import { eventsRepository } from "./events.repository";
import { eventsService } from "./events.service";

const userId = "11111111-1111-1111-1111-111111111111";
const winemakerId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const otherWinemakerId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const eventId = "cccccccc-cccc-cccc-cccc-cccccccccccc";
const registrationId = "dddddddd-dddd-dddd-dddd-dddddddddddd";
const commentId = "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee";

const futureStart = new Date(Date.now() + 86400000 * 7);
const futureEnd = new Date(Date.now() + 86400000 * 8);

const mockWinemaker = { id: winemakerId, name: "Test Winery" };
const mockOtherWinemaker = { id: otherWinemakerId, name: "Other Winery" };

const mockApprovedEvent = {
  capacity: 10,
  deletedAt: null,
  id: eventId,
  startTime: futureStart,
  status: "approved",
  winemakerId,
} as unknown as EventWithDetails;

const mockPendingEvent = { ...mockApprovedEvent, status: "pending" } as unknown as EventWithDetails;

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

// ─── createEvent ─────────────────────────────────────────────────────────────

describe("createEvent", () => {
  it("creates event when winemaker exists and dates are valid", async () => {
    vi.mocked(eventsRepository.findWinemakerByUserId).mockResolvedValue(mockWinemaker);
    vi.mocked(eventsRepository.createEventWithAddress).mockResolvedValue(mockPendingEvent);

    await eventsService.createEvent(userId, validCreateInput);

    expect(eventsRepository.createEventWithAddress).toHaveBeenCalledWith(
      winemakerId,
      expect.objectContaining({ capacity: 20, name: "Wine Tasting" }),
      expect.objectContaining({ city: "Bratislava", country: "SK" })
    );
  });

  it("throws FORBIDDEN when user has no winemaker profile", async () => {
    vi.mocked(eventsRepository.findWinemakerByUserId).mockResolvedValue(undefined);

    await expect(eventsService.createEvent(userId, validCreateInput)).rejects.toThrow("FORBIDDEN");
    expect(eventsRepository.createEventWithAddress).not.toHaveBeenCalled();
  });

  it("throws INVALID_DATES when startTime is in the past", async () => {
    vi.mocked(eventsRepository.findWinemakerByUserId).mockResolvedValue(mockWinemaker);

    await expect(
      eventsService.createEvent(userId, {
        ...validCreateInput,
        startTime: new Date(Date.now() - 1000).toISOString(),
      })
    ).rejects.toThrow("INVALID_DATES");
  });

  it("throws INVALID_DATES when endTime is not after startTime", async () => {
    vi.mocked(eventsRepository.findWinemakerByUserId).mockResolvedValue(mockWinemaker);

    await expect(
      eventsService.createEvent(userId, {
        ...validCreateInput,
        endTime: futureStart.toISOString(),
        startTime: futureEnd.toISOString(),
      })
    ).rejects.toThrow("INVALID_DATES");
  });
});

// ─── updateEvent ─────────────────────────────────────────────────────────────

describe("updateEvent", () => {
  it("updates own pending event", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(mockPendingEvent);
    vi.mocked(eventsRepository.findWinemakerByUserId).mockResolvedValue(mockWinemaker);
    vi.mocked(eventsRepository.update).mockResolvedValue(mockPendingEvent);

    await eventsService.updateEvent(eventId, userId, { name: "New Name" });

    expect(eventsRepository.update).toHaveBeenCalledWith(
      eventId,
      expect.objectContaining({ name: "New Name" })
    );
  });

  it("throws NOT_FOUND when event does not exist", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(undefined);

    await expect(eventsService.updateEvent(eventId, userId, { name: "X" })).rejects.toThrow(
      "NOT_FOUND"
    );
  });

  it("throws FORBIDDEN when winemaker does not own the event", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(mockPendingEvent);
    vi.mocked(eventsRepository.findWinemakerByUserId).mockResolvedValue(mockOtherWinemaker);

    await expect(eventsService.updateEvent(eventId, userId, { name: "X" })).rejects.toThrow(
      "FORBIDDEN"
    );
    expect(eventsRepository.update).not.toHaveBeenCalled();
  });

  it("throws CONFLICT when trying to edit an approved event", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(mockApprovedEvent);
    vi.mocked(eventsRepository.findWinemakerByUserId).mockResolvedValue(mockWinemaker);

    await expect(eventsService.updateEvent(eventId, userId, { name: "X" })).rejects.toThrow(
      "CONFLICT"
    );
  });

  it("throws CAPACITY_TOO_LOW when new capacity is below active registration count", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(mockPendingEvent);
    vi.mocked(eventsRepository.findWinemakerByUserId).mockResolvedValue(mockWinemaker);
    vi.mocked(eventsRepository.countActiveRegistrations).mockResolvedValue(8);

    await expect(eventsService.updateEvent(eventId, userId, { capacity: 5 })).rejects.toThrow(
      "CAPACITY_TOO_LOW"
    );
    expect(eventsRepository.update).not.toHaveBeenCalled();
  });
});

// ─── deleteEvent ─────────────────────────────────────────────────────────────

describe("deleteEvent", () => {
  it("soft deletes own event", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(mockPendingEvent);
    vi.mocked(eventsRepository.findWinemakerByUserId).mockResolvedValue(mockWinemaker);

    await eventsService.deleteEvent(eventId, userId);

    expect(eventsRepository.softDelete).toHaveBeenCalledWith(eventId);
  });

  it("throws FORBIDDEN when winemaker does not own the event", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(mockPendingEvent);
    vi.mocked(eventsRepository.findWinemakerByUserId).mockResolvedValue(mockOtherWinemaker);

    await expect(eventsService.deleteEvent(eventId, userId)).rejects.toThrow("FORBIDDEN");
    expect(eventsRepository.softDelete).not.toHaveBeenCalled();
  });
});

// ─── getEvent ────────────────────────────────────────────────────────────────

describe("getEvent", () => {
  it("returns approved event", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(mockApprovedEvent);

    const result = await eventsService.getEvent(eventId);

    expect(result).toEqual(mockApprovedEvent);
  });

  it("throws NOT_FOUND for pending event", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(mockPendingEvent);

    await expect(eventsService.getEvent(eventId)).rejects.toThrow("NOT_FOUND");
  });

  it("throws NOT_FOUND when event does not exist", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(undefined);

    await expect(eventsService.getEvent(eventId)).rejects.toThrow("NOT_FOUND");
  });
});

// ─── listEvents ───────────────────────────────────────────────────────────────

describe("listEvents", () => {
  it("always filters to approved status", async () => {
    vi.mocked(eventsRepository.findMany).mockResolvedValue([mockApprovedEvent]);
    vi.mocked(eventsRepository.countMany).mockResolvedValue(1);

    await eventsService.listEvents({}, { limit: 20, page: 1 });

    expect(eventsRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ status: "approved" }),
      expect.any(Object)
    );
  });

  it("returns empty list immediately when winemakerName matches nothing", async () => {
    vi.mocked(eventsRepository.resolveWinemakerIdsByName).mockResolvedValue([]);

    const result = await eventsService.listEvents(
      { winemakerName: "nobody" },
      { limit: 20, page: 1 }
    );

    expect(result).toEqual({ data: [], limit: 20, page: 1, total: 0 });
    expect(eventsRepository.findMany).not.toHaveBeenCalled();
  });
});

// ─── registerForEvent ────────────────────────────────────────────────────────

describe("registerForEvent", () => {
  it("creates registration for available event", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(mockApprovedEvent);
    vi.mocked(eventsRepository.createRegistration).mockResolvedValue({
      id: registrationId,
    } as never);

    await eventsService.registerForEvent(eventId, userId);

    expect(eventsRepository.createRegistration).toHaveBeenCalledWith(
      eventId,
      userId,
      mockApprovedEvent.capacity
    );
  });

  it("throws EVENT_NOT_AVAILABLE when event is not approved", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(mockPendingEvent);

    await expect(eventsService.registerForEvent(eventId, userId)).rejects.toThrow(
      "EVENT_NOT_AVAILABLE"
    );
    expect(eventsRepository.createRegistration).not.toHaveBeenCalled();
  });

  it("throws EVENT_NOT_AVAILABLE when event start_time is in the past", async () => {
    const pastEvent = {
      ...mockApprovedEvent,
      startTime: new Date(Date.now() - 1000),
    } as unknown as EventWithDetails;
    vi.mocked(eventsRepository.findById).mockResolvedValue(pastEvent);

    await expect(eventsService.registerForEvent(eventId, userId)).rejects.toThrow(
      "EVENT_NOT_AVAILABLE"
    );
  });

  it("propagates ALREADY_REGISTERED from repository", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(mockApprovedEvent);
    vi.mocked(eventsRepository.createRegistration).mockRejectedValue(
      new Error("ALREADY_REGISTERED")
    );

    await expect(eventsService.registerForEvent(eventId, userId)).rejects.toThrow(
      "ALREADY_REGISTERED"
    );
  });

  it("propagates CAPACITY_FULL from repository", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(mockApprovedEvent);
    vi.mocked(eventsRepository.createRegistration).mockRejectedValue(new Error("CAPACITY_FULL"));

    await expect(eventsService.registerForEvent(eventId, userId)).rejects.toThrow("CAPACITY_FULL");
  });
});

// ─── unregisterFromEvent ─────────────────────────────────────────────────────

describe("unregisterFromEvent", () => {
  const mockRegistration = { deletedAt: null, eventId, id: registrationId, userId } as never;

  it("soft deletes active registration", async () => {
    vi.mocked(eventsRepository.findActiveRegistration).mockResolvedValue(mockRegistration);

    await eventsService.unregisterFromEvent(eventId, userId);

    expect(eventsRepository.softDeleteRegistration).toHaveBeenCalledWith(registrationId);
  });

  it("throws NOT_FOUND when no active registration exists", async () => {
    vi.mocked(eventsRepository.findActiveRegistration).mockResolvedValue(undefined);

    await expect(eventsService.unregisterFromEvent(eventId, userId)).rejects.toThrow("NOT_FOUND");
    expect(eventsRepository.softDeleteRegistration).not.toHaveBeenCalled();
  });
});

// ─── addComment ──────────────────────────────────────────────────────────────

describe("addComment", () => {
  it("creates comment on approved event", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(mockApprovedEvent);
    vi.mocked(eventsRepository.createComment).mockResolvedValue({ id: commentId } as never);

    await eventsService.addComment(eventId, userId, "Great event!");

    expect(eventsRepository.createComment).toHaveBeenCalledWith(eventId, userId, "Great event!");
  });

  it("throws EVENT_NOT_AVAILABLE for non-approved event", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(mockPendingEvent);

    await expect(eventsService.addComment(eventId, userId, "hi")).rejects.toThrow(
      "EVENT_NOT_AVAILABLE"
    );
    expect(eventsRepository.createComment).not.toHaveBeenCalled();
  });
});

// ─── listComments ─────────────────────────────────────────────────────────────

describe("listComments", () => {
  it("returns paginated comment result", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(mockApprovedEvent);
    vi.mocked(eventsRepository.findComments).mockResolvedValue([]);
    vi.mocked(eventsRepository.countComments).mockResolvedValue(0);

    const result = await eventsService.listComments(eventId, { limit: 10, page: 1 });

    expect(result).toEqual({ data: [], limit: 10, page: 1, total: 0 });
  });

  it("throws NOT_FOUND when event does not exist", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(undefined);

    await expect(eventsService.listComments(eventId, {})).rejects.toThrow("NOT_FOUND");
  });

  it("throws NOT_FOUND for pending event", async () => {
    vi.mocked(eventsRepository.findById).mockResolvedValue(mockPendingEvent);

    await expect(eventsService.listComments(eventId, {})).rejects.toThrow("NOT_FOUND");
  });
});
