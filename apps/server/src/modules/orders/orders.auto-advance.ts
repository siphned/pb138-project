import { db } from "../../db";
import { logger } from "../../utils/logger";
import * as ordersRepo from "./orders.repository";

const NEXT_STATUS: Record<string, string> = {
  confirmed: "shipped",
  pending: "confirmed",
  shipped: "delivered",
};

const MIN_DELAY_MS = 10_000;
const MAX_DELAY_MS = 60_000;
const POLL_INTERVAL_MS = 2_000;

function randomDelay(): number {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

const schedule = new Map<string, number>(); // orderId → advanceAt (epoch ms)
let timer: ReturnType<typeof setInterval> | null = null;

export function scheduleAdvance(orderId: string): void {
  const advanceAt = Date.now() + randomDelay();
  schedule.set(orderId, advanceAt);
}

async function tick(): Promise<void> {
  const now = Date.now();
  const due = [...schedule.entries()].filter(([, advanceAt]) => advanceAt <= now);
  if (due.length === 0) return;

  for (const [orderId] of due) {
    schedule.delete(orderId);
    try {
      const order = await ordersRepo.findById(db, orderId);
      if (!order) continue;
      const next = NEXT_STATUS[order.status];
      if (!next) continue;
      await ordersRepo.updateStatus(
        db,
        orderId,
        next as Parameters<typeof ordersRepo.updateStatus>[2]
      );
      logger.info({ from: order.status, orderId, to: next }, "Auto-advanced order status");
      if (NEXT_STATUS[next]) {
        scheduleAdvance(orderId);
      }
    } catch (err) {
      logger.error({ err, orderId }, "Failed to auto-advance order status");
    }
  }
}

export async function start(): Promise<void> {
  const inProgress = await ordersRepo.findInProgress(db);
  for (const order of inProgress) {
    scheduleAdvance(order.id);
  }
  logger.info({ count: inProgress.length }, "Order auto-advance: scheduled in-progress orders");

  timer = setInterval(() => {
    tick().catch((err) => logger.error({ err }, "Order auto-advance tick error"));
  }, POLL_INTERVAL_MS);
}

export function stop(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  schedule.clear();
}
