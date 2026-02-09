import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { jobId, paymentType } = paymentIntent.metadata;

  // Update payment record
  await prisma.payment.updateMany({
    where: { stripePaymentId: paymentIntent.id },
    data: {
      status: "COMPLETED",
      processedAt: new Date(),
      receiptUrl: paymentIntent.charges.data[0]?.receipt_url,
    },
  });

  // Update job and invoice based on payment type
  if (paymentType === "deposit") {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        depositPaid: true,
        status: "CONFIRMED",
      },
    });

    await prisma.invoice.updateMany({
      where: { jobId },
      data: {
        depositPaid: true,
        depositPaidAt: new Date(),
        depositPaymentId: paymentIntent.id,
        paymentStatus: "COMPLETED",
      },
    });
  } else if (paymentType === "final") {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "PAID" },
    });

    await prisma.invoice.updateMany({
      where: { jobId },
      data: {
        finalPaid: true,
        finalPaidAt: new Date(),
        finalPaymentId: paymentIntent.id,
        status: "PAID",
        paymentStatus: "COMPLETED",
      },
    });
  }

  // TODO: Send payment confirmation email
  // TODO: Send notification to customer
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  await prisma.payment.updateMany({
    where: { stripePaymentId: paymentIntent.id },
    data: {
      status: "FAILED",
      processedAt: new Date(),
    },
  });

  // TODO: Send payment failure notification
}

async function handleRefund(charge: Stripe.Charge) {
  if (!charge.payment_intent) return;

  await prisma.payment.updateMany({
    where: { stripePaymentId: charge.payment_intent as string },
    data: {
      status: "REFUNDED",
      metadata: JSON.stringify({ refundedAt: new Date() }),
    },
  });

  // TODO: Update job status
  // TODO: Send refund notification
}