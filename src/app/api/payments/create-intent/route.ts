import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, STRIPE_CONFIG } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createIntentSchema = z.object({
  jobId: z.string(),
  amount: z.number().min(50).max(STRIPE_CONFIG.maxPaymentAmount),
  type: z.enum(["deposit", "final"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, amount, type } = createIntentSchema.parse(body);

    // Verify job belongs to user
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        customerId: session.user.id,
      },
      include: {
        invoice: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Prevent duplicate deposit payments
    if (type === "deposit" && job.depositPaid) {
      return NextResponse.json(
        { error: "Deposit already paid" },
        { status: 400 }
      );
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: STRIPE_CONFIG.currency,
      metadata: {
        jobId: job.id,
        jobNumber: job.jobNumber,
        customerId: session.user.id,
        customerEmail: session.user.email!,
        paymentType: type,
      },
      description: `Joey Moves - ${type === "deposit" ? "Deposit" : "Final Payment"} for Job #${job.jobNumber}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        invoiceId: job.invoice!.id,
        amount: amount,
        currency: STRIPE_CONFIG.currency,
        method: "STRIPE",
        status: "PENDING",
        stripePaymentId: paymentIntent.id,
        metadata: JSON.stringify({ type }),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}