import { describe, expect, it } from 'vitest';
import { parsePriceValue } from './shared/utils/price.utils';
import { estimateDeliveryFee } from './shared/utils/delivery.utils';

// Regression coverage for the Rs0 defect: the old parser kept the dot from
// "Rs." and priced "Rs. 4,499" at almost zero across the storefront.
describe('parsePriceValue', () => {
  it('parses a formatted PKR display price', () => {
    expect(parsePriceValue('Rs. 4,499')).toBe(4499);
  });

  it('parses prices without the currency prefix', () => {
    expect(parsePriceValue('11,699')).toBe(11699);
    expect(parsePriceValue('Rs 2,500')).toBe(2500);
  });

  it('passes numbers through and tolerates decimals', () => {
    expect(parsePriceValue(4499)).toBe(4499);
    expect(parsePriceValue('Rs. 5,450.00')).toBe(5450);
  });

  it('returns 0 for empty or non-numeric values', () => {
    expect(parsePriceValue('')).toBe(0);
    expect(parsePriceValue('Free')).toBe(0);
    expect(parsePriceValue(null)).toBe(0);
    expect(parsePriceValue(undefined)).toBe(0);
  });
});

// The display estimate must mirror the Phase 6 server formula exactly.
describe('estimateDeliveryFee', () => {
  it('is free at or above the threshold', () => {
    expect(estimateDeliveryFee(4999, 4999, 250)).toBe(0);
    expect(estimateDeliveryFee(8998, 4999, 250)).toBe(0);
  });

  it('applies the configured fee below the threshold', () => {
    expect(estimateDeliveryFee(2500, 4999, 250)).toBe(250);
  });

  it('is zero when no fee is configured or the cart is empty', () => {
    expect(estimateDeliveryFee(2500, 4999, 0)).toBe(0);
    expect(estimateDeliveryFee(0, 4999, 250)).toBe(0);
  });
});
