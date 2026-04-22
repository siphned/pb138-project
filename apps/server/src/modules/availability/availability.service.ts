import { availabilityRepository } from './availability.repository'
import type { AvailabilityException, AvailabilityRegular } from '../../db/schema'

function parseTime(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(0)
  d.setUTCHours(h!, m!, 0, 0)
  return d
}

async function assertShopOwnership(shopId: string, requesterId: string): Promise<void> {
  const shop = await availabilityRepository.findShopById(shopId)
  if (!shop) throw new Error('NOT_FOUND')
  if (shop.ownerUserId !== requesterId) throw new Error('FORBIDDEN')
}

export const availabilityService = {
  async getAvailability(shopId: string): Promise<{
    regular: AvailabilityRegular[]
    exceptions: AvailabilityException[]
  }> {
    const shop = await availabilityRepository.findShopById(shopId)
    if (!shop) throw new Error('NOT_FOUND')

    const [regular, exceptions] = await Promise.all([
      availabilityRepository.findRegularByShopId(shopId),
      availabilityRepository.findExceptionsByShopId(shopId),
    ])

    return { regular, exceptions }
  },

  async addRegular(
    shopId: string,
    requesterId: string,
    data: {
      dow: number
      startTime: string
      endTime: string
      validFrom: string
      validTo?: string
      type: 'open' | 'closed'
    }
  ): Promise<AvailabilityRegular> {
    await assertShopOwnership(shopId, requesterId)

    const start = parseTime(data.startTime)
    const end = parseTime(data.endTime)
    if (end <= start) throw new Error('INVALID_TIME_RANGE')

    if (data.validTo !== undefined && data.validTo <= data.validFrom)
      throw new Error('INVALID_TIME_RANGE')

    return availabilityRepository.insertRegular({
      shopId,
      dow: data.dow,
      startTime: start,
      endTime: end,
      validFrom: data.validFrom,
      validTo: data.validTo,
      type: data.type,
    })
  },

  async addException(
    shopId: string,
    requesterId: string,
    data: {
      startsAt: string
      endsAt: string
      action: 'closed' | 'modified_hours' | 'special_event'
      reason?: string
    }
  ): Promise<AvailabilityException> {
    await assertShopOwnership(shopId, requesterId)

    const starts = new Date(data.startsAt)
    const ends = new Date(data.endsAt)
    if (ends <= starts) throw new Error('INVALID_TIME_RANGE')

    return availabilityRepository.insertException({
      shopId,
      startsAt: starts,
      endsAt: ends,
      action: data.action,
      reason: data.reason,
    })
  },

  async deleteRegular(shopId: string, entryId: string, requesterId: string): Promise<void> {
    await assertShopOwnership(shopId, requesterId)

    const entry = await availabilityRepository.findRegularById(entryId)
    if (!entry || entry.shopId !== shopId) throw new Error('NOT_FOUND')

    await availabilityRepository.deleteRegular(entryId)
  },

  async deleteException(shopId: string, entryId: string, requesterId: string): Promise<void> {
    await assertShopOwnership(shopId, requesterId)

    const entry = await availabilityRepository.findExceptionById(entryId)
    if (!entry || entry.shopId !== shopId) throw new Error('NOT_FOUND')

    await availabilityRepository.deleteException(entryId)
  },
}
