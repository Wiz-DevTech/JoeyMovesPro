import { z } from "zod";

export const bookingFormSchema = z.object({
  // Step 1: Move Details
  moveType: z.enum(["STANDARD", "HEAVY", "COMMERCIAL", "LONG_DISTANCE"]),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  dropoffAddress: z.string().min(5, "Dropoff address is required"),
  
  // Step 2: Date & Time
  scheduledDate: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, "Date must be in the future"),
  
  scheduledTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  
  // Step 3: Labor & Services
  laborHours: z.number().min(1).max(24),
  truckSize: z.enum(["SMALL", "MEDIUM", "LARGE", "XLARGE"]).optional(),
  ownTruck: z.boolean().default(false),
  
  // Step 4: Additional Services
  hasStairs: z.boolean().default(false),
  stairsFlights: z.number().min(0).max(10).optional(),
  
  hasAssembly: z.boolean().default(false),
  assemblyCount: z.number().min(0).max(20).optional(),
  
  hasDisassembly: z.boolean().default(false),
  disassemblyCount: z.number().min(0).max(20).optional(),
  
  hasPacking: z.boolean().default(false),
  
  hasHeavyItems: z.boolean().default(false),
  heavyItemsList: z.string().optional(),
  
  // Step 5: Insurance & Notes
  insuranceLevel: z.enum(["basic", "standard", "premium"]).default("standard"),
  notes: z.string().max(500).optional(),
  specialItems: z.string().max(500).optional(),
  
  // Contact Info
  contactName: z.string().min(2),
  contactPhone: z.string().regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, "Invalid phone number"),
  contactEmail: z.string().email(),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;