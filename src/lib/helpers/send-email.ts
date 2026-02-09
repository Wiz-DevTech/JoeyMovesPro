import { resend, EMAIL_CONFIG } from "@/lib/email";
import BookingConfirmation from "@/emails/booking-confirmation";

export async function sendBookingConfirmation(params: {
  to: string;
  customerName: string;
  jobNumber: string;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedTotal: number;
  depositAmount: number;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: params.to,
      subject: `Booking Confirmed - Job #${params.jobNumber}`,
      react: BookingConfirmation(params),
    });

    if (error) {
      console.error("Email send error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to send booking confirmation:", error);
    throw error;
  }
}