import { describe, it, expect } from 'vitest';
import { calculateJobPricing } from '@/lib/pricing';

describe('calculateJobPricing', () => {
  it('should calculate basic pricing correctly', () => {
    const result = calculateJobPricing({
      laborHoursEst: 3,
      mileageEst: 20,
    });

    expect(result.subtotal).toBeGreaterThan(0);
    expect(result.totalEstimated).toBeGreaterThan(result.subtotal);
    expect(result.taxAmount).toBeGreaterThan(0);
  });

  it('should apply minimum labor charge', () => {
    const result = calculateJobPricing({
      laborHoursEst: 1,
      mileageEst: 5,
    });

    // Minimum labor is $200
    expect(result.subtotal).toBeGreaterThanOrEqual(200);
  });

  it('should include truck fees', () => {
    const withTruck = calculateJobPricing({
      laborHoursEst: 2,
      mileageEst: 10,
      truckSize: 'LARGE',
    });

    const withoutTruck = calculateJobPricing({
      laborHoursEst: 2,
      mileageEst: 10,
    });

    expect(withTruck.truckFee).toBeGreaterThan(0);
    expect(withTruck.subtotal).toBeGreaterThan(withoutTruck.subtotal);
  });

  it('should add stairs fee correctly', () => {
    const result = calculateJobPricing({
      laborHoursEst: 2,
      mileageEst: 10,
      hasStairs: true,
      stairsFlights: 3,
    });

    expect(result.stairsFee).toBe(150); // 3 flights * $50
  });
});
