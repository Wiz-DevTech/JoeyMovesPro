import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should complete booking wizard', async ({ page }) => {
    await page.goto('/bookings/new');

    // Step 1: Move Type
    await page.click('[data-testid="move-type-standard"]');
    await page.click('[data-testid="next-button"]');

    // Step 2: Addresses
    await page.fill('[name="pickupAddress"]', '123 Main St, Spring Hill, FL');
    await page.fill('[name="dropoffAddress"]', '456 Oak Ave, Tampa, FL');
    await page.click('[data-testid="next-button"]');

    // Step 3: Date & Time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('[name="scheduledDate"]', tomorrow.toISOString().split('T')[0]);
    await page.fill('[name="scheduledTime"]', '10:00');
    await page.click('[data-testid="next-button"]');

    // Step 4: Labor Hours
    await page.fill('[name="laborHours"]', '3');
    await page.click('[data-testid="next-button"]');

    // Step 5: Review & Submit
    await expect(page.locator('[data-testid="price-summary"]')).toBeVisible();
    await page.click('[data-testid="submit-booking"]');

    // Should redirect to payment
    await page.waitForURL(/\/payment/);
    await expect(page.locator('text=Payment')).toBeVisible();
  });
});