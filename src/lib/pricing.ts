interface PricingInput {
  laborHoursEst: number;
  mileageEst: number;
  truckSize?: "SMALL" | "MEDIUM" | "LARGE" | "XLARGE";
  hasStairs?: boolean;
  stairsFlights?: number;
  hasAssembly?: boolean;
  assemblyCount?: number;
  hasPacking?: boolean;
  hasHeavyItems?: boolean;
}

export function calculateJobPricing(input: PricingInput) {
  const LABOR_RATE = 100;
  const MIN_LABOR = 200;
  const MILEAGE_RATE = 1.5;
  const STAIRS_FEE = 50;
  const ASSEMBLY_RATE = 25;
  const TAX_RATE = 0.07;

  // Labor
  const laborFee = Math.max(input.laborHoursEst * LABOR_RATE, MIN_LABOR);

  // Mileage
  const mileageFee = input.mileageEst * MILEAGE_RATE;

  // Truck fee
  const truckFees = {
    SMALL: 0,
    MEDIUM: 50,
    LARGE: 100,
    XLARGE: 150,
  };
  const truckFee = input.truckSize ? truckFees[input.truckSize] : 0;

  // Stairs
  const stairsFee = input.hasStairs
    ? (input.stairsFlights || 1) * STAIRS_FEE
    : 0;

  // Assembly
  const assemblyFee = input.hasAssembly
    ? (input.assemblyCount || 1) * ASSEMBLY_RATE
    : 0;

  // Packing
  const packingFee = input.hasPacking ? 100 : 0;

  // Heavy items
  const heavyFee = input.hasHeavyItems ? 75 : 0;

  // Subtotal
  const subtotal =
    laborFee +
    mileageFee +
    truckFee +
    stairsFee +
    assemblyFee +
    packingFee +
    heavyFee;

  // Tax
  const taxAmount = subtotal * TAX_RATE;

  // Total
  const totalEstimated = subtotal + taxAmount;

  return {
    laborHoursEst: input.laborHoursEst,
    laborRate: LABOR_RATE,
    minLabor: MIN_LABOR,
    mileageRate: MILEAGE_RATE,
    truckSize: input.truckSize,
    truckFee,
    hasStairs: input.hasStairs || false,
    stairsFee,
    stairsFlights: input.stairsFlights || 0,
    hasAssembly: input.hasAssembly || false,
    assemblyFee,
    assemblyCount: input.assemblyCount || 0,
    assemblyRate: ASSEMBLY_RATE,
    hasPacking: input.hasPacking || false,
    packingFee,
    hasHeavyItems: input.hasHeavyItems || false,
    heavyFee,
    taxRate: TAX_RATE,
    taxAmount,
    subtotal,
    totalEstimated,
  };
}