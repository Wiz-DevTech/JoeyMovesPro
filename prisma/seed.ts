import { PrismaClient, UserRole, JobStatus, MoveType, DriverStatus, InvoiceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🗑️  Clearing existing data...');
    await prisma.payment.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.jobPricing.deleteMany();
    await prisma.driverLocation.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.jobStatusHistory.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.job.deleteMany();
    await prisma.driverProfile.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create Admin User
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@joeymoves.com',
      password: adminPassword,
      name: 'Admin User',
      phone: '(813) 555-0100',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  // Create Customer Users
  console.log('👥 Creating customer users...');
  const customerPassword = await bcrypt.hash('Customer123!', 12);
  
  const customer1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      password: customerPassword,
      name: 'John Doe',
      phone: '(813) 555-0101',
      role: UserRole.CUSTOMER,
      isActive: true,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      password: customerPassword,
      name: 'Jane Smith',
      phone: '(813) 555-0102',
      role: UserRole.CUSTOMER,
      isActive: true,
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      email: 'bob.johnson@example.com',
      password: customerPassword,
      name: 'Bob Johnson',
      phone: '(813) 555-0103',
      role: UserRole.CUSTOMER,
      isActive: true,
    },
  });

  // Create Driver Users with Profiles
  console.log('🚚 Creating driver users...');
  const driverPassword = await bcrypt.hash('Driver123!', 12);

  const driver1 = await prisma.user.create({
    data: {
      email: 'mike.driver@joeymoves.com',
      password: driverPassword,
      name: 'Mike Johnson',
      phone: '(813) 555-0201',
      role: UserRole.DRIVER,
      isActive: true,
      driverProfile: {
        create: {
          licenseNumber: 'FL-D123456',
          licenseState: 'FL',
          licenseExpiry: new Date('2027-12-31'),
          vehicleType: 'BOX_TRUCK',
          vehicleModel: '2022 Ford E-450',
          vehiclePlate: 'ABC1234',
          vehicleCapacity: '16 ft',
          currentStatus: DriverStatus.AVAILABLE,
          rating: 4.8,
          completedJobs: 127,
          totalEarnings: 25400.0,
          currentLat: 28.0339,
          currentLng: -82.4497,
          lastLocationUpdate: new Date(),
        },
      },
    },
    include: {
      driverProfile: true,
    },
  });

  const driver2 = await prisma.user.create({
    data: {
      email: 'sarah.driver@joeymoves.com',
      password: driverPassword,
      name: 'Sarah Williams',
      phone: '(813) 555-0202',
      role: UserRole.DRIVER,
      isActive: true,
      driverProfile: {
        create: {
          licenseNumber: 'FL-D789012',
          licenseState: 'FL',
          licenseExpiry: new Date('2026-08-15'),
          vehicleType: 'VAN',
          vehicleModel: '2021 Mercedes Sprinter',
          vehiclePlate: 'XYZ5678',
          vehicleCapacity: '12 ft',
          currentStatus: DriverStatus.AVAILABLE,
          rating: 4.9,
          completedJobs: 203,
          totalEarnings: 40600.0,
          currentLat: 28.0506,
          currentLng: -82.4289,
          lastLocationUpdate: new Date(),
        },
      },
    },
    include: {
      driverProfile: true,
    },
  });

  const driver3 = await prisma.user.create({
    data: {
      email: 'tom.driver@joeymoves.com',
      password: driverPassword,
      name: 'Tom Brown',
      phone: '(813) 555-0203',
      role: UserRole.DRIVER,
      isActive: true,
      driverProfile: {
        create: {
          licenseNumber: 'FL-D345678',
          licenseState: 'FL',
          licenseExpiry: new Date('2028-03-20'),
          vehicleType: 'TRUCK',
          vehicleModel: '2023 Isuzu NPR',
          vehiclePlate: 'DEF9012',
          vehicleCapacity: '14 ft',
          currentStatus: DriverStatus.BUSY,
          rating: 4.7,
          completedJobs: 89,
          totalEarnings: 17800.0,
          currentLat: 27.9506,
          currentLng: -82.4572,
          lastLocationUpdate: new Date(),
        },
      },
    },
    include: {
      driverProfile: true,
    },
  });

  // Create Sample Jobs
  console.log('📦 Creating sample jobs...');

  // Completed Job 1
  const job1 = await prisma.job.create({
    data: {
      jobNumber: `JM${Date.now().toString().slice(-8)}001`,
      customerId: customer1.id,
      customerName: customer1.name!,
      customerEmail: customer1.email,
      customerPhone: customer1.phone!,
      driverId: driver1.id,
      driverName: driver1.name,
      status: JobStatus.COMPLETED,
      moveType: MoveType.STANDARD,
      pickupAddress: '123 Main St, Spring Hill, FL 34609',
      pickupLat: 28.0339,
      pickupLng: -82.4497,
      pickupCity: 'Spring Hill',
      pickupState: 'FL',
      pickupZip: '34609',
      dropoffAddress: '456 Oak Ave, Tampa, FL 33602',
      dropoffLat: 27.9506,
      dropoffLng: -82.4572,
      dropoffCity: 'Tampa',
      dropoffState: 'FL',
      dropoffZip: '33602',
      scheduledDate: new Date('2026-02-01'),
      scheduledTime: '10:00',
      estimatedDuration: 180,
      estimatedTotal: 485.0,
      actualTotal: 510.0,
      depositAmount: 50.0,
      depositPaid: true,
      notes: 'Please handle antique furniture with care',
      completedAt: new Date('2026-02-01T14:30:00'),
      pricing: {
        create: {
          laborHoursEst: 3,
          laborHoursActual: 3.5,
          laborRate: 100,
          minLabor: 200,
          mileageEst: 15.5,
          mileageActual: 16.2,
          mileageRate: 1.5,
          truckSize: 'MEDIUM',
          truckFee: 50,
          hasStairs: true,
          stairsFee: 50,
          stairsFlights: 1,
          hasAssembly: true,
          assemblyCount: 2,
          assemblyFee: 50,
          assemblyRate: 25,
          hasPacking: false,
          hasHeavyItems: true,
          heavyFee: 75,
          heavyItemsList: 'Piano, antique dresser',
          taxRate: 0.07,
          taxAmount: 33.95,
          subtotal: 485.0,
          totalEstimated: 485.0,
          totalActual: 510.0,
        },
      },
      invoice: {
        create: {
          invoiceNumber: `INV-${Date.now().toString().slice(-8)}001`,
          subtotal: 476.15,
          taxAmount: 33.33,
          total: 510.0,
          depositAmount: 50.0,
          depositPaid: true,
          depositPaidAt: new Date('2026-01-25'),
          finalAmount: 460.0,
          finalPaid: true,
          finalPaidAt: new Date('2026-02-01'),
          status: InvoiceStatus.PAID,
          paymentMethod: 'STRIPE',
          paymentStatus: 'COMPLETED',
          sentAt: new Date('2026-02-01'),
        },
      },
    },
    include: {
      pricing: true,
      invoice: true,
    },
  });

  // Confirmed Job 2
  const job2 = await prisma.job.create({
    data: {
      jobNumber: `JM${Date.now().toString().slice(-8)}002`,
      customerId: customer2.id,
      customerName: customer2.name!,
      customerEmail: customer2.email,
      customerPhone: customer2.phone!,
      driverId: driver2.id,
      driverName: driver2.name,
      status: JobStatus.CONFIRMED,
      moveType: MoveType.STANDARD,
      pickupAddress: '789 Pine St, Brooksville, FL 34601',
      pickupLat: 28.5553,
      pickupLng: -82.3898,
      pickupCity: 'Brooksville',
      pickupState: 'FL',
      pickupZip: '34601',
      dropoffAddress: '321 Elm Dr, Wesley Chapel, FL 33544',
      dropoffLat: 28.1836,
      dropoffLng: -82.3276,
      dropoffCity: 'Wesley Chapel',
      dropoffState: 'FL',
      dropoffZip: '33544',
      scheduledDate: new Date('2026-02-15'),
      scheduledTime: '09:00',
      estimatedDuration: 240,
      estimatedTotal: 625.0,
      depositAmount: 50.0,
      depositPaid: true,
      notes: 'Two-bedroom apartment move',
      pricing: {
        create: {
          laborHoursEst: 4,
          laborRate: 100,
          minLabor: 200,
          mileageEst: 22.3,
          mileageRate: 1.5,
          truckSize: 'LARGE',
          truckFee: 100,
          hasStairs: true,
          stairsFee: 100,
          stairsFlights: 2,
          hasAssembly: true,
          assemblyCount: 3,
          assemblyFee: 75,
          assemblyRate: 25,
          hasPacking: false,
          taxRate: 0.07,
          taxAmount: 43.75,
          subtotal: 625.0,
          totalEstimated: 625.0,
        },
      },
      invoice: {
        create: {
          invoiceNumber: `INV-${Date.now().toString().slice(-8)}002`,
          subtotal: 584.11,
          taxAmount: 40.89,
          total: 625.0,
          depositAmount: 50.0,
          depositPaid: true,
          depositPaidAt: new Date('2026-02-08'),
          finalAmount: 575.0,
          status: InvoiceStatus.SENT,
          paymentMethod: 'STRIPE',
          paymentStatus: 'PENDING',
          sentAt: new Date('2026-02-08'),
        },
      },
    },
  });

  // Pending Job 3
  const job3 = await prisma.job.create({
    data: {
      jobNumber: `JM${Date.now().toString().slice(-8)}003`,
      customerId: customer3.id,
      customerName: customer3.name!,
      customerEmail: customer3.email,
      customerPhone: customer3.phone!,
      status: JobStatus.PENDING,
      moveType: MoveType.HEAVY,
      pickupAddress: '555 Commerce Blvd, Land O Lakes, FL 34638',
      pickupLat: 28.2189,
      pickupLng: -82.4571,
      pickupCity: 'Land O Lakes',
      pickupState: 'FL',
      pickupZip: '34638',
      dropoffAddress: '888 Industrial Way, Lutz, FL 33549',
      dropoffLat: 28.1394,
      dropoffLng: -82.4618,
      dropoffCity: 'Lutz',
      dropoffState: 'FL',
      dropoffZip: '33549',
      scheduledDate: new Date('2026-02-20'),
      scheduledTime: '08:00',
      estimatedDuration: 300,
      estimatedTotal: 890.0,
      depositAmount: 50.0,
      depositPaid: false,
      notes: 'Commercial office move - requires furniture dolly',
      specialItems: 'Large filing cabinets, conference table',
      pricing: {
        create: {
          laborHoursEst: 5,
          laborRate: 100,
          minLabor: 200,
          mileageEst: 12.8,
          mileageRate: 1.5,
          truckSize: 'XLARGE',
          truckFee: 150,
          hasStairs: false,
          hasAssembly: true,
          assemblyCount: 5,
          assemblyFee: 125,
          assemblyRate: 25,
          hasDisassembly: true,
          disassemblyCount: 5,
          disassemblyFee: 125,
          hasPacking: true,
          packingFee: 100,
          hasHeavyItems: true,
          heavyFee: 150,
          heavyItemsList: 'Filing cabinets (8), conference table',
          taxRate: 0.07,
          taxAmount: 62.3,
          subtotal: 890.0,
          totalEstimated: 890.0,
        },
      },
      invoice: {
        create: {
          invoiceNumber: `INV-${Date.now().toString().slice(-8)}003`,
          subtotal: 831.78,
          taxAmount: 58.22,
          total: 890.0,
          depositAmount: 50.0,
          finalAmount: 840.0,
          status: InvoiceStatus.DRAFT,
          paymentStatus: 'PENDING',
        },
      },
    },
  });

  // Create sample notifications
  console.log('🔔 Creating sample notifications...');
  
  await prisma.notification.createMany({
    data: [
      {
        userId: customer1.id,
        type: 'JOB_COMPLETED',
        title: 'Move Completed!',
        message: `Your move has been completed successfully. Total: $${job1.actualTotal}`,
        entityType: 'JOB',
        entityId: job1.id,
        isRead: true,
        readAt: new Date(),
      },
      {
        userId: customer2.id,
        type: 'JOB_CONFIRMED',
        title: 'Move Confirmed',
        message: 'Your move has been confirmed and driver assigned.',
        entityType: 'JOB',
        entityId: job2.id,
        isRead: false,
      },
      {
        userId: driver1.id,
        type: 'JOB_ASSIGNED',
        title: 'New Job Assigned',
        message: `You've been assigned to job #${job1.jobNumber}`,
        entityType: 'JOB',
        entityId: job1.id,
        isRead: true,
        readAt: new Date(),
      },
    ],
  });

  // Create sample chat messages
  console.log('💬 Creating sample chat messages...');
  
  await prisma.chatMessage.createMany({
    data: [
      {
        jobId: job1.id,
        senderId: customer1.id,
        senderRole: UserRole.CUSTOMER,
        message: 'What time will you arrive?',
        messageType: 'TEXT',
        isRead: true,
        readAt: new Date('2026-02-01T09:30:00'),
      },
      {
        jobId: job1.id,
        senderId: driver1.id,
        senderRole: UserRole.DRIVER,
        message: 'I will arrive around 10:00 AM as scheduled.',
        messageType: 'TEXT',
        isRead: true,
        readAt: new Date('2026-02-01T09:35:00'),
      },
      {
        jobId: job2.id,
        senderId: customer2.id,
        senderRole: UserRole.CUSTOMER,
        message: 'Do you provide packing materials?',
        messageType: 'TEXT',
        isAiReply: false,
        isRead: false,
      },
    ],
  });

  // Create system settings
  console.log('⚙️  Creating system settings...');
  
  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'DEPOSIT_AMOUNT',
        value: '50.00',
        type: 'number',
        category: 'pricing',
        description: 'Default deposit amount in USD',
        isPublic: true,
      },
      {
        key: 'LABOR_RATE',
        value: '100.00',
        type: 'number',
        category: 'pricing',
        description: 'Hourly labor rate in USD',
        isPublic: true,
      },
      {
        key: 'MILEAGE_RATE',
        value: '1.50',
        type: 'number',
        category: 'pricing',
        description: 'Per-mile rate in USD',
        isPublic: true,
      },
      {
        key: 'TAX_RATE',
        value: '0.07',
        type: 'number',
        category: 'pricing',
        description: 'Sales tax rate (7%)',
        isPublic: true,
      },
      {
        key: 'SUPPORT_EMAIL',
        value: 'support@joeymoves.com',
        type: 'string',
        category: 'general',
        description: 'Customer support email',
        isPublic: true,
      },
      {
        key: 'SUPPORT_PHONE',
        value: '(813) 555-0100',
        type: 'string',
        category: 'general',
        description: 'Customer support phone',
        isPublic: true,
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${await prisma.user.count()}`);
  console.log(`   - Drivers: ${await prisma.driverProfile.count()}`);
  console.log(`   - Jobs: ${await prisma.job.count()}`);
  console.log(`   - Invoices: ${await prisma.invoice.count()}`);
  console.log(`   - Notifications: ${await prisma.notification.count()}`);
  console.log(`   - Chat Messages: ${await prisma.chatMessage.count()}`);
  console.log('\n🔑 Login Credentials:');
  console.log('   Admin: admin@joeymoves.com / Admin123!');
  console.log('   Customer: john.doe@example.com / Customer123!');
  console.log('   Driver: mike.driver@joeymoves.com / Driver123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });