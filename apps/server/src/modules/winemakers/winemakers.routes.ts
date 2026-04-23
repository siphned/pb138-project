import { Elysia, status, t } from 'elysia'
import { authPlugin } from '../auth'
import { winemakersService } from './winemakers.service'
import {
  updateWinemakerBody,
  winemakerListItemResponse,
  winemakerProfileResponse,
} from './winemakers.schema'

const wineInProfileResponse = t.Object({
  id: t.String(),
  name: t.String(),
  region: t.String(),
  type: t.String(),
  color: t.String(),
  vintageYear: t.Integer(),
  description: t.String(),
  alcoholContent: t.String(),
  volumeMl: t.Integer(),
  quantity: t.Integer(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
})

const eventInProfileResponse = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.Nullable(t.String()),
  startTime: t.Date(),
  endTime: t.Date(),
  visibility: t.String(),
  inviteType: t.String(),
  createdAt: t.Date(),
})

export const winemakersRoutes = new Elysia()
  .use(authPlugin)

  .get(
    '/winemakers',
    () => winemakersService.listWinemakers(),
    {
      response: { 200: t.Array(winemakerListItemResponse) },
      detail: {
        tags: ['winemakers'],
        summary: 'List winemakers',
        description: 'Returns all non-deleted winemaker profiles with address.',
      },
    }
  )

  // PUT /winemakers/me registered BEFORE /:id so "me" is not matched as a UUID param
  .put(
    '/winemakers/me',
    async ({ dbUser, body }) => {
      try {
        return await winemakersService.updateMyProfile(dbUser.id, body)
      } catch (e: unknown) {
        if (e instanceof Error && e.message === 'NOT_FOUND') return status(404, 'Winemaker profile not found')
        throw e
      }
    },
    {
      requireCapability: 'winemaker',
      body: updateWinemakerBody,
      response: { 200: winemakerListItemResponse, 404: t.String() },
      detail: {
        tags: ['winemakers'],
        summary: 'Update own winemaker profile',
        description: 'Updates the authenticated winemaker profile fields.',
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .get(
    '/winemakers/:id',
    async ({ params }) => {
      try {
        return await winemakersService.getWinemaker(params.id)
      } catch (e: unknown) {
        if (e instanceof Error && e.message === 'NOT_FOUND') return status(404, 'Winemaker not found')
        throw e
      }
    },
    {
      params: t.Object({ id: t.String() }),
      response: { 200: winemakerProfileResponse, 404: t.String() },
      detail: {
        tags: ['winemakers'],
        summary: 'Get winemaker profile',
        description: 'Returns a winemaker profile including their wine catalog and events.',
      },
    }
  )

  .get(
    '/winemakers/:id/wines',
    async ({ params }) => {
      try {
        return await winemakersService.getWinemakerWines(params.id)
      } catch (e: unknown) {
        if (e instanceof Error && e.message === 'NOT_FOUND') return status(404, 'Winemaker not found')
        throw e
      }
    },
    {
      params: t.Object({ id: t.String() }),
      response: { 200: t.Array(wineInProfileResponse), 404: t.String() },
      detail: {
        tags: ['winemakers'],
        summary: 'Get winemaker wines',
        description: "Returns all non-deleted wines in the winemaker's catalog.",
      },
    }
  )

  .get(
    '/winemakers/:id/events',
    async ({ params }) => {
      try {
        return await winemakersService.getWinemakerEvents(params.id)
      } catch (e: unknown) {
        if (e instanceof Error && e.message === 'NOT_FOUND') return status(404, 'Winemaker not found')
        throw e
      }
    },
    {
      params: t.Object({ id: t.String() }),
      response: { 200: t.Array(eventInProfileResponse), 404: t.String() },
      detail: {
        tags: ['winemakers'],
        summary: 'Get winemaker events',
        description: 'Returns all non-deleted events hosted by the winemaker.',
      },
    }
  )
