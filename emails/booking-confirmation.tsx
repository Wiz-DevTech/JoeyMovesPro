import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";

interface BookingConfirmationProps {
  customerName: string;
  jobNumber: string;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedTotal: number;
  depositAmount: number;
}

export default function BookingConfirmation({
  customerName,
  jobNumber,
  pickupAddress,
  dropoffAddress,
  scheduledDate,
  scheduledTime,
  estimatedTotal,
  depositAmount,
}: BookingConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your move is confirmed - Job #{jobNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Confirmed! 🎉</Heading>
          
          <Text style={text}>Hi {customerName},</Text>
          
          <Text style={text}>
            Your move has been confirmed. Here are your booking details:
          </Text>

          <Section style={detailsBox}>
            <Text style={label}>Job Number</Text>
            <Text style={value}>#{jobNumber}</Text>
            
            <Hr style={divider} />
            
            <Text style={label}>Scheduled Date & Time</Text>
            <Text style={value}>{scheduledDate} at {scheduledTime}</Text>
            
            <Hr style={divider} />
            
            <Text style={label}>Pickup Location</Text>
            <Text style={value}>{pickupAddress}</Text>
            
            <Hr style={divider} />
            
            <Text style={label}>Dropoff Location</Text>
            <Text style={value}>{dropoffAddress}</Text>
            
            <Hr style={divider} />
            
            <Text style={label}>Estimated Total</Text>
            <Text style={value}>${estimatedTotal.toFixed(2)}</Text>
            
            <Text style={label}>Deposit Paid</Text>
            <Text style={value}>${depositAmount.toFixed(2)}</Text>
          </Section>

          <Button style={button} href={`https://joeymoves.com/bookings/${jobNumber}`}>
            View Booking Details
          </Button>

          <Text style={footer}>
            Questions? Reply to this email or call us at (123) 456-7890
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 40px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const detailsBox = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 40px",
};

const label = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  marginBottom: "4px",
};

const value = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "500",
  marginTop: "0",
};

const divider = {
  borderColor: "#e2e8f0",
  margin: "16px 0",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  margin: "24px 40px",
};

const footer = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
  marginTop: "32px",
};