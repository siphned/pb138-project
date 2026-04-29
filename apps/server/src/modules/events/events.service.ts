import type { Event, EventComment, EventRegistration } from "@repo/shared/schemas";
import type { PaginatedResult } from "../../utils/pagination";
import { parsePagination } from "../../utils/pagination";
import type { CommentWithUser, EventWithDetails } from "./events.repository";
import { eventsRepository } from "./events.repository";

function validateEventDates(
  data: { startTime?: string; endTime?: string },
  startTime: Date,
  endTime: Date
) {
  if (data.startTime && startTime <= new Date()) throw new Error("INVALID_DATES");
  if ((data.startTime || data.endTime) && endTime <= startTime) throw new Error("INVALID_DATES");
}

function buildEventUpdates(
  data: {
    name?: string;
    description?: string | null;
    capacity?: number;
    startTime?: string;
    endTime?: string;
  },
  startTime: Date,
  endTime: Date
): Record<string, unknown> {
  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;
  if (data.capacity !== undefined) updates.capacity = data.capacity;
  if (data.startTime !== undefined) updates.startTime = startTime;
  if (data.endTime !== undefined) updates.endTime = endTime;
  return updates;
}

export const eventsService = {
  async addComment(eventId: string, userId: string, body: string): Promise<EventComment> {
    const event = await eventsRepository.findById(eventId);
    if (!event || event.status !== "approved") throw new Error("EVENT_NOT_AVAILABLE");
    return eventsRepository.createComment(eventId, userId, body);
  },

  async createEvent(
    userId: string,
    data: {
      name: string;
      description?: string;
      capacity: number;
      startTime: string;
      endTime: string;
      inviteType: string;
      visibility: "public" | "private";
      address: {
        country: string;
        city: string;
        postalCode: string;
        street: string;
        houseNumber: string;
      };
    }
  ): Promise<Event> {
    const winemaker = await eventsRepository.findWinemakerByUserId(userId);
    if (!winemaker) throw new Error("FORBIDDEN");

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    if (startTime <= new Date()) throw new Error("INVALID_DATES");
    if (endTime <= startTime) throw new Error("INVALID_DATES");

    return eventsRepository.createEventWithAddress(
      winemaker.id,
      {
        capacity: data.capacity,
        description: data.description,
        endTime,
        inviteType: data.inviteType,
        name: data.name,
        startTime,
        visibility: data.visibility,
      },
      data.address
    );
  },

  async deleteEvent(id: string, userId: string): Promise<void> {
    const event = await eventsRepository.findById(id);
    if (!event) throw new Error("NOT_FOUND");

    const winemaker = await eventsRepository.findWinemakerByUserId(userId);
    if (!winemaker || winemaker.id !== event.winemakerId) throw new Error("FORBIDDEN");

    await eventsRepository.softDelete(id);
  },

  async getEvent(id: string): Promise<EventWithDetails> {
    const event = await eventsRepository.findById(id);
    if (!event || event.status !== "approved") throw new Error("NOT_FOUND");
    return event;
  },

  async listComments(
    eventId: string,
    paginationQuery: { page?: number; limit?: number }
  ): Promise<PaginatedResult<CommentWithUser>> {
    const event = await eventsRepository.findById(eventId);
    if (!event || event.status !== "approved") throw new Error("NOT_FOUND");

    const { limit, offset } = parsePagination(paginationQuery);
    const page = Math.max(1, paginationQuery.page ?? 1);

    const [data, total] = await Promise.all([
      eventsRepository.findComments(eventId, { limit, offset }),
      eventsRepository.countComments(eventId),
    ]);

    return { data, limit, page, total };
  },
  async listEvents(
    filters: { winemakerName?: string; from?: string; to?: string },
    paginationQuery: { page?: number; limit?: number }
  ): Promise<PaginatedResult<EventWithDetails>> {
    const { limit, offset } = parsePagination(paginationQuery);
    const page = Math.max(1, paginationQuery.page ?? 1);

    let winemakerIds: string[] | undefined;
    if (filters.winemakerName) {
      winemakerIds = await eventsRepository.resolveWinemakerIdsByName(filters.winemakerName);
      if (winemakerIds.length === 0) return { data: [], limit, page, total: 0 };
    }

    const repoFilters = {
      from: filters.from ? new Date(filters.from) : undefined,
      status: "approved" as const,
      to: filters.to ? new Date(filters.to) : undefined,
      winemakerIds,
    };

    const [data, total] = await Promise.all([
      eventsRepository.findMany(repoFilters, { limit, offset }),
      eventsRepository.countMany(repoFilters),
    ]);

    return { data, limit, page, total };
  },

  async registerForEvent(eventId: string, userId: string): Promise<EventRegistration> {
    const event = await eventsRepository.findById(eventId);
    if (!event || event.status !== "approved" || event.startTime <= new Date()) {
      throw new Error("EVENT_NOT_AVAILABLE");
    }
    return eventsRepository.createRegistration(eventId, userId, event.capacity);
  },

  async unregisterFromEvent(eventId: string, userId: string): Promise<void> {
    const reg = await eventsRepository.findActiveRegistration(eventId, userId);
    if (!reg) throw new Error("NOT_FOUND");
    await eventsRepository.softDeleteRegistration(reg.id);
  },

  async updateEvent(
    id: string,
    userId: string,
    data: {
      name?: string;
      description?: string | null;
      capacity?: number;
      startTime?: string;
      endTime?: string;
    }
  ): Promise<Event> {
    const event = await eventsRepository.findById(id);
    if (!event) throw new Error("NOT_FOUND");

    const winemaker = await eventsRepository.findWinemakerByUserId(userId);
    if (!winemaker || winemaker.id !== event.winemakerId) throw new Error("FORBIDDEN");
    if (event.status !== "pending") throw new Error("CONFLICT");

    const startTime = data.startTime ? new Date(data.startTime) : event.startTime;
    const endTime = data.endTime ? new Date(data.endTime) : event.endTime;

    validateEventDates(data, startTime, endTime);

    if (data.capacity !== undefined) {
      const registrationCount = await eventsRepository.countActiveRegistrations(id);
      if (data.capacity < registrationCount) throw new Error("CAPACITY_TOO_LOW");
    }

    const updates = buildEventUpdates(data, startTime, endTime);
    return eventsRepository.update(id, updates as Parameters<typeof eventsRepository.update>[1]);
  },
};
