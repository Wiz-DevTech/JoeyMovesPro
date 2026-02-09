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
  Row,
  Column,
} from '@react-email/components';

interface InvoiceReadyProps {
  customerName: string;
  jobNumber: string;
  invoiceNumber: string;
  totalAmount: number;
  depositPaid: number;
  finalAmount: number;
  invoiceUrl: string;
  pickupAddress: string;
  dropoffAddress: string;
  completedDate: string;
}

export default function InvoiceReady({
  customerName = 'John Doe',
  jobNumber = 'JM12345678',
  invoiceNumber = 'INV-12345678',
  totalAmount = 485.0,
  depositPaid = 50.0,
  finalAmount = 435.0,
  invoiceUrl = 'https://joeymoves.com/invoices/123',
  pickupAddress = '123 Main St, Spring Hill, FL',
  dropoffAddress = '456 Oak Ave, Tampa, FL',
  completedDate = 'February 8, 2026',
}: InvoiceReadyProps) {
  return (
    <Html>
      <Head />
      <Preview>Your invoice is ready - Job #{jobNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Invoice Ready! 📄</Heading>

          <Text style={text}>Hi {customerName},</Text>

          <Text style={text}>
            Thank you for choosing Joey Moves! Your move has been completed and your invoice is now
            ready.
          </Text>

          <Section style={detailsBox}>
            <Text style={label}>Job Number</Text>
            <Text style={value}>#{jobNumber}</Text>

            <Hr style={divider} />

            <Text style={label}>Invoice Number</Text>
            <Text style={value}>{invoiceNumber}</Text>

            <Hr style={divider} />

            <Text style={label}>Completed Date</Text>
            <Text style={value}>{completedDate}</Text>

            <Hr style={divider} />

            <Text style={label}>Pickup Location</Text>
            <Text style={value}>{pickupAddress}</Text>

            <Hr style={divider} />

            <Text style={label}>Dropoff Location</Text>
            <Text style={value}>{dropoffAddress}</Text>
          </Section>

          <Section style={priceBox}>
            <Row>
              <Column style={priceLabel}>
                <Text style={priceText}>Total Amount:</Text>
              </Column>
              <Column align="right">
                <Text style={priceValue}>${totalAmount.toFixed(2)}</Text>
              </Column>
            </Row>

            <Row>
              <Column style={priceLabel}>
                <Text style={priceTextSmall}>Deposit Paid:</Text>
              </Column>
              <Column align="right">
                <Text style={priceValueSmall}>-${depositPaid.toFixed(2)}</Text>
              </Column>
            </Row>

            <Hr style={divider} />

            <Row>
              <Column style={priceLabel}>
                <Text style={finalPriceText}>Final Payment Due:</Text>
              </Column>
              <Column align="right">
                <Text style={finalPriceValue}>${finalAmount.toFixed(2)}</Text>
              </Column>
            </Row>
          </Section>

          <Button style={button} href={invoiceUrl}>
            View & Pay Invoice
          </Button>

          <Text style={text}>
            Please review your invoice and process the final payment at your earliest convenience.
          </Text>

          <Section style={infoBox}>
            <Text style={infoTitle}>Payment Methods Accepted:</Text>
            <Text style={infoText}>• Credit/Debit Cards (via Stripe)</Text>
            <Text style={infoText}>• PayPal</Text>
            <Text style={infoText}>• Cash App</Text>
            <Text style={infoText}>• Venmo</Text>
          </Section>

          <Hr style={dividerLarge} />

          <Text style={footer}>
            Questions about your invoice? Reply to this email or call us at (813) 555-0100
          </Text>

          <Text style={footerSmall}>
            Joey Moves Pro | Spring Hill, FL | www.joeymoves.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  margin: '16px 0',
};

const detailsBox = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 40px',
};

const label = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  marginBottom: '4px',
  marginTop: '16px',
};

const value = {
  color: '#333',
  fontSize: '16px',
  fontWeight: '500',
  marginTop: '0',
  marginBottom: '0',
};

const priceBox = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 40px',
  border: '2px solid #bfdbfe',
};

const priceLabel = {
  paddingRight: '16px',
};

const priceText = {
  color: '#333',
  fontSize: '16px',
  margin: '8px 0',
};

const priceValue = {
  color: '#333',
  fontSize: '16px',
  fontWeight: '500',
  margin: '8px 0',
};

const priceTextSmall = {
  color: '#64748b',
  fontSize: '14px',
  margin: '8px 0',
};

const priceValueSmall = {
  color: '#64748b',
  fontSize: '14px',
  margin: '8px 0',
};

const finalPriceText = {
  color: '#1e40af',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '8px 0',
};

const finalPriceValue = {
  color: '#1e40af',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '8px 0',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '16px 0',
};

const dividerLarge = {
  borderColor: '#e2e8f0',
  margin: '32px 40px',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '16px 24px',
  margin: '24px 40px',
};

const infoBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '16px 24px',
  margin: '24px 40px',
  border: '1px solid #fde68a',
};

const infoTitle = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const infoText = {
  color: '#78350f',
  fontSize: '14px',
  margin: '4px 0',
};

const footer = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
  marginTop: '32px',
  textAlign: 'center' as const,
};

const footerSmall = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '20px',
  padding: '0 40px',
  marginTop: '8px',
  textAlign: 'center' as const,
};