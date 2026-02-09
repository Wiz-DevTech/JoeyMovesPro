import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

describe('Authentication', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' },
    });
  });

  afterEach(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' },
    });
  });

  it('should create a new user', async () => {
    const hashedPassword = await bcrypt.hash('TestPass123!', 12);

    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'CUSTOMER',
      },
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('CUSTOMER');
  });

  it('should not allow duplicate emails', async () => {
    const hashedPassword = await bcrypt.hash('TestPass123!', 12);

    await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'CUSTOMER',
      },
    });

    await expect(
      prisma.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          name: 'Test User 2',
          role: 'CUSTOMER',
        },
      })
    ).rejects.toThrow();
  });
});