import { Stock } from '../types';

export const REPLAY_TIME_SLOTS = [
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
] as const;

export type ReplayTimeSlot = typeof REPLAY_TIME_SLOTS[number];

/**
 * Checks which time slots are currently available based on market time.
 */
export function getAvailableReplaySlots(isHistorical = false): { slot: ReplayTimeSlot; available: boolean }[] {
  if (isHistorical) {
    return REPLAY_TIME_SLOTS.map(slot => ({ slot, available: true }));
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMinute;

  return REPLAY_TIME_SLOTS.map(slot => {
    const [h, m] = slot.split(':').map(Number);
    const slotTimeVal = h * 60 + m;
    // If it is past 15:00 (or before 9:00 outside trading hours), make all slots available for replay!
    if (currentTimeVal >= 15 * 60 || currentTimeVal < 9 * 60 + 30) {
      return { slot, available: true };
    }
    return { slot, available: slotTimeVal <= currentTimeVal };
  });
}

/**
 * Derives a deterministic snapshot of stock prices and changes at a specific intraday time slot.
 */
export function getStockSnapshotAtTime(stocks: Stock[], timeSlot: ReplayTimeSlot | null): Stock[] {
  if (!timeSlot || timeSlot === '15:00') {
    return stocks;
  }

  const slotIndex = REPLAY_TIME_SLOTS.indexOf(timeSlot);
  // Fraction of the trading day: 0 at 09:30, 1 at 15:00
  const progress = slotIndex / (REPLAY_TIME_SLOTS.length - 1);

  return stocks.map(stock => {
    let hash = 0;
    for (let i = 0; i < stock.symbol.length; i++) {
      hash = stock.symbol.charCodeAt(i) + ((hash << 5) - hash);
    }
    const noise = Math.sin(slotIndex * 1.7 + Math.abs(hash % 9)) * 0.35;

    // Simulate the intraday trajectory
    const intradayRatio = 0.3 + progress * 0.7 + noise * 0.15;
    const currentChange = Number((stock.change * Math.max(0.1, intradayRatio)).toFixed(2));
    const priceRatio = 1 + (currentChange - stock.change) / 100;
    const currentPrice = Number((stock.price * priceRatio).toFixed(2));

    return {
      ...stock,
      price: currentPrice,
      change: currentChange,
    };
  });
}
