import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { geocodeAddress, calculateDistance } from "@/lib/maps";
import { calculateJobPricing } from "@/lib/pricing";

const createJobSchema = z.object({
  pickupAddress: z.string(),
  dropoffAddress: z.string(),
  scheduledDate: z.string(),
  scheduledTime: z.string(),
  moveType: z.enum(["STANDARD", "HEAVY", "COMMERCIAL", "LONG_DISTANCE"]),
  notes: z.string().optional(),
  specialItems: z.string().optional(),
  pricingData: z.object({
    laborHoursEst: z.number(),
    hasStairs: z.boolean().optional(),
    stairsFlights: z.number().optional(),
    hasAssembly: z.boolean().optional(),
    assemblyCount: z.number().optional(),
    hasPacking: z.boolean().optional(),
    hasHeavyItems: z.boolean().optional(),
    truckSize: z.enum(["SMALL", "MEDIUM", "LARGE", "XLARGE"]).optional(),
  }),
});

// GET /api/jobs - List jobs
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const role = session.user.role;

    let jobs;

    if (role === "CUSTOMER") {
      jobs = await prisma.job.findMany({
        where: {
          customerId: session.user.id,
          ...(status && { status }),
        },
        include: {
          pricing: true,
          invoice: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "DRIVER") {
      jobs = await prisma.job.findMany({
        where: {
          driverId: session.user.id,
          ...(status && { status }),
        },
        include: {
          pricing: true,
          customer: {
            select: { name: true, phone: true, email: true },
          },
        },
        orderBy: { scheduledDate: "asc" },
      });
    } else if (role === "ADMIN" || role === "SUPER_ADMIN") {
      jobs = await prisma.job.findMany({
        where: status ? { status } : {},
        include: {
          pricing: true,
          invoice: true,
          customer: {
            select: { name: true, phone: true, email: true },
          },
          driver: {
            select: { name: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create new job
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createJobSchema.parse(body);

    // Geocode addresses
    const pickupGeo = await geocodeAddress(data.pickupAddress);
    const dropoffGeo = await geocodeAddress(data.dropoffAddress);

    // Calculate distance and duration
    const distance = await calculateDistance(
      { lat: pickupGeo.lat, lng: pickupGeo.lng },
      { lat: dropoffGeo.lat, lng: dropoffGeo.lng }
    );

    // Calculate pricing
    const pricing = calculateJobPricing({
      ...data.pricingData,
      mileageEst: distance.distanceMiles,
    });

    // Generate job number
    const jobNumber = `JM${Date.now().toString().slice(-8)}`;

    // Create job with pricing
    const job = await prisma.job.create({
      data: {
        jobNumber,
        customerId: session.user.id,
        customerName: session.user.name!,
        customerEmail: session.user.email!,
        customerPhone: session.user.phone || "",
        
        status: "PENDING",
        moveType: data.moveType,
        
        pickupAddress: pickupGeo.formattedAddress,
        pickupLat: pickupGeo.lat,
        pickupLng: pickupGeo.lng,
        pickupCity: pickupGeo.city,
        pickupState: pickupGeo.state,
        pickupZip: pickupGeo.zip,
        
        dropoffAddress: dropoffGeo.formattedAddress,
        dropoffLat: dropoffGeo.lat,
        dropoffLng: dropoffGeo.lng,
        dropoffCity: dropoffGeo.city,
        dropoffState: dropoffGeo.state,
        dropoffZip: dropoffGeo.zip,
        
        scheduledDate: new Date(data.scheduledDate),
        scheduledTime: data.scheduledTime,
        estimatedDuration: distance.durationMinutes,
        
        estimatedTotal: pricing.totalEstimated,
        depositAmount: 50,
        
        notes: data.notes,
        specialItems: data.specialItems,
        
        pricing: {
          create: {
            ...pricing,
            mileageEst: distance.distanceMiles,
          },
        },
        
        invoice: {
          create: {
            invoiceNumber: `INV-${jobNumber}`,
            subtotal: pricing.subtotal,
            taxAmount: pricing.taxAmount,
            total: pricing.totalEstimated,
            depositAmount: 50,
            finalAmount: pricing.totalEstimated - 50,
            status: "DRAFT",
          },
        },
      },
      include: {
        pricing: true,
        invoice: true,
      },
    });

    // TODO: Send booking confirmation email

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Create job error:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}