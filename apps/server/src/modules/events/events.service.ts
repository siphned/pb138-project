import type {
  Event,
  EventComment,
  EventInvitationModel,
  EventRegistration,
} from "@repo/shared/schemas";
import { db } from "../../db";
import type { PaginatedResult } from "../../utils/pagination";
import { parsePagination } from "../../utils/pagination";
import { ForbiddenWineActionError, WinemakerNotFoundError } from "../wines/wines.errors";
import {
  AlreadyRegisteredError,
  CapacityFullError,
  CapacityTooLowError,
  EventNotAvailableError,
  EventNotFoundError,
  EventStatusConflictError,
  InvalidDatesError,
} from "./events.errors";
import type { CommentWithUser, EventWithDetails } from "./events.repository";
import * as eventsRepo from "./events.repository";

function validateEventDates(
  data: { startTime?: string; endTime?: string },
  startTime: Date,
  endTime: Date
) {
  if (data.startTime && startTime <= new Date()) throw new InvalidDatesError();
  if ((data.startTime || data.endTime) && endTime <= startTime) throw new InvalidDatesError();
}

export class EventsService {
  async addComment(eventId: string, userId: string, body: string): Promise<EventComment> {
    const event = await eventsRepo.findById(db, eventId);
    if (!event || event.status !== "approved") throw new EventNotAvailableError();
    return eventsRepo.createComment(db, eventId, userId, body);
  }

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
    const winemaker = await eventsRepo.findWinemakerByUserId(db, userId);
    if (!winemaker) throw new WinemakerNotFoundError();

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    if (startTime <= new Date()) throw new InvalidDatesError();
    if (endTime <= startTime) throw new InvalidDatesError();

    return db.transaction(async (tx) => {
      const address = await eventsRepo.insertAddress(tx, data.address);
      return eventsRepo.createEvent(tx, winemaker.id, address.id, {
        capacity: data.capacity,
        description: data.description,
        endTime,
        inviteType: data.inviteType,
        name: data.name,
        startTime,
        visibility: data.visibility,
      });
    });
  }

  async deleteEvent(id: string, userId: string): Promise<void> {
    const event = await eventsRepo.findById(db, id);
    if (!event) throw new EventNotFoundError();

    const winemaker = await eventsRepo.findWinemakerByUserId(db, userId);
    if (!winemaker || winemaker.id !== event.winemakerId) throw new ForbiddenWineActionError();

    await eventsRepo.softDelete(db, id);
  }

  async getEvent(
    id: string,
    userId?: string
  ): Promise<EventWithDetails & { isRegisteredByMe?: boolean; attendees: number }> {
    const event = await eventsRepo.findById(db, id);
    if (!event || event.status !== "approved") throw new EventNotFoundError();
    const attendees = await eventsRepo.countActiveRegistrations(db, id);
    if (!userId) return { ...event, attendees };
    const registered = await eventsRepo.findRegisteredEventIds(db, userId, [id]);
    return { ...event, attendees, isRegisteredByMe: registered.has(id) };
  }

  async listInvitations(eventId: string, userId: string): Promise<EventInvitationModel[]> {
    const event = await eventsRepo.findById(db, eventId);
    if (!event) throw new Error("NOT_FOUND");

    const winemaker = await eventsRepo.findWinemakerByUserId(db, userId);
    if (!winemaker || winemaker.id !== event.winemakerId) throw new Error("FORBIDDEN");

    return eventsRepo.findInvitationsByEventId(db, eventId);
  }

  async listComments(
    eventId: string,
    paginationQuery: { page?: number; limit?: number }
  ): Promise<PaginatedResult<CommentWithUser>> {
    const event = await eventsRepo.findById(db, eventId);
    if (!event || event.status !== "approved") throw new EventNotFoundError();

    const { limit, offset } = parsePagination(paginationQuery);
    const page = Math.max(1, paginationQuery.page ?? 1);

    const [data, total] = await Promise.all([
      eventsRepo.findComments(db, eventId, { limit, offset }),
      eventsRepo.countComments(db, eventId),
    ]);

    return { data, limit, page, total };
  }

  async listEvents(
    filters: {
      winemakerName?: string;
      winemakerId?: string;
      q?: string;
      from?: string;
      to?: string;
    },
    paginationQuery: { page?: number; limit?: number },
    userId?: string
  ): Promise<PaginatedResult<EventWithDetails & { isRegisteredByMe?: boolean }>> {
    const { limit, offset } = parsePagination(paginationQuery);
    const page = Math.max(1, paginationQuery.page ?? 1);

    let winemakerIds: string[] | undefined;
    if (filters.winemakerId) {
      winemakerIds = [filters.winemakerId];
    } else if (filters.winemakerName) {
      winemakerIds = await eventsRepo.resolveWinemakerIdsByName(db, filters.winemakerName);
      if (winemakerIds.length === 0) return { data: [], limit, page, total: 0 };
    }

    const repoFilters = {
      from: filters.from ? new Date(filters.from) : undefined,
      q: filters.q,
      status: "approved" as const,
      to: filters.to ? new Date(filters.to) : undefined,
      winemakerIds,
    };

    const [data, total] = await Promise.all([
      eventsRepo.findMany(db, repoFilters, { limit, offset }),
      eventsRepo.countMany(db, repoFilters),
    ]);

    if (!userId || data.length === 0) return { data, limit, page, total };

    const registered = await eventsRepo.findRegisteredEventIds(
      db,
      userId,
      data.map((e) => e.id)
    );
    const decorated = data.map((e) => ({ ...e, isRegisteredByMe: registered.has(e.id) }));
    return { data: decorated, limit, page, total };
  }

  async registerForEvent(eventId: string, userId: string): Promise<EventRegistration> {
    const event = await eventsRepo.findById(db, eventId);
    if (!event || event.status !== "approved" || event.startTime <= new Date()) {
      throw new EventNotAvailableError();
    }

    return db.transaction(async (tx) => {
      const existing = await eventsRepo.findRegistration(tx, eventId, userId);
      if (existing) throw new AlreadyRegisteredError();

      const count = await eventsRepo.countActiveRegistrations(tx, eventId);
      if (count >= event.capacity) throw new CapacityFullError();

      return eventsRepo.createRegistration(tx, eventId, userId);
    });
  }

  async unregisterFromEvent(eventId: string, userId: string): Promise<void> {
    const reg = await eventsRepo.findRegistration(db, eventId, userId);
    if (!reg) throw new EventNotFoundError();
    await eventsRepo.softDeleteRegistration(db, reg.id);
  }

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
    const event = await eventsRepo.findById(db, id);
    if (!event) throw new EventNotFoundError();

    const winemaker = await eventsRepo.findWinemakerByUserId(db, userId);
    if (!winemaker || winemaker.id !== event.winemakerId) throw new ForbiddenWineActionError();
    if (event.startTime <= new Date()) throw new EventStatusConflictError();

    const startTime = data.startTime ? new Date(data.startTime) : event.startTime;
    const endTime = data.endTime ? new Date(data.endTime) : event.endTime;

    validateEventDates(data, startTime, endTime);

    if (data.capacity !== undefined) {
      const registrationCount = await eventsRepo.countActiveRegistrations(db, id);
      if (data.capacity < registrationCount) throw new CapacityTooLowError();
    }

    const updates: Parameters<typeof eventsRepo.update>[2] = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.capacity !== undefined) updates.capacity = data.capacity;
    if (data.startTime !== undefined) updates.startTime = startTime;
    if (data.endTime !== undefined) updates.endTime = endTime;

    return eventsRepo.update(db, id, updates);
  }
}

export const eventsService = new EventsService();
