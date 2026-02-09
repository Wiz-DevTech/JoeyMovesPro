import { z } from "zod";

export const driverProfileSchema = z.object({
  // License Info
  licenseNumber: z.string().min(5, "License number is required"),
  licenseState: z.string().length(2, "State code must be 2 characters"),
  licenseExpiry: z.string().refine((val) => {
    const date = new Date(val);
    return date > new Date();
  }, "License must not be expired"),
  
  // Vehicle Info
  vehicleType: z.enum(["VAN", "TRUCK", "BOX_TRUCK", "SEMI"]),
  vehicleModel: z.string().min(2),
  vehiclePlate: z.string().min(2),
  vehicleCapacity: z.string(),
  
  // Availability
  availableFrom: z.string().optional(),
  availableUntil: z.string().optional(),
});

export type DriverProfileData = z.infer<typeof driverProfileSchema>;