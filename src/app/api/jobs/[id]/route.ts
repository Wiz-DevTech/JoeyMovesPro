import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/jobs/:id - Get single job
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        pricing: true,
        invoice: {
          include: { payments: true },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        driver: {
          select: { id: true, name: true, phone: true },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
        locations: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check permissions
    const isOwner = job.customerId === session.user.id;
    const isDriver = job.driverId === session.user.id;
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role);

    if (!isOwner && !isDriver && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

// PATCH /api/jobs/:id - Update job
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, driverId, notes } = body;

    // Get existing job
    const existingJob = await prisma.job.findUnique({
      where: { id: params.id },
    });

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Update job
    const job = await prisma.job.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(driverId && { driverId }),
        ...(notes && { notes }),
      },
      include: {
        pricing: true,
        invoice: true,
      },
    });

    // Create status history entry
    if (status && status !== existingJob.status) {
      await prisma.jobStatusHistory.create({
        data: {
          jobId: job.id,
          status,
          changedBy: session.user.id,
          notes,
        },
      });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}