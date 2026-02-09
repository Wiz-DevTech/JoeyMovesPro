'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingFormSchema, type BookingFormData } from '@/lib/validations/booking';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StepMoveType } from './steps/step-move-type';
import { StepAddresses } from './steps/step-addresses';
import { StepDateTime } from './steps/step-datetime';
import { StepServices } from './steps/step-services';
import { StepReview } from './steps/step-review';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface BookingWizardProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
}

const STEPS = [
  { id: 1, title: 'Move Type', component: StepMoveType },
  { id: 2, title: 'Addresses', component: StepAddresses },
  { id: 3, title: 'Date & Time', component: StepDateTime },
  { id: 4, title: 'Services', component: StepServices },
  { id: 5, title: 'Review', component: StepReview },
];

export function BookingWizard({ user }: BookingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      moveType: 'STANDARD',
      contactName: user.name || '',
      contactEmail: user.email,
      contactPhone: user.phone || '',
      laborHours: 2,
      ownTruck: false,
      hasStairs: false,
      hasAssembly: false,
      hasDisassembly: false,
      hasPacking: false,
      hasHeavyItems: false,
      insuranceLevel: 'standard',
    },
  });

  const CurrentStepComponent = STEPS[currentStep - 1].component;
  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = async () => {
    // Validate current step fields
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);

    if (!isValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          pricingData: {
            laborHoursEst: data.laborHours,
            hasStairs: data.hasStairs,
            stairsFlights: data.stairsFlights,
            hasAssembly: data.hasAssembly,
            assemblyCount: data.assemblyCount,
            hasPacking: data.hasPacking,
            hasHeavyItems: data.hasHeavyItems,
            truckSize: data.truckSize,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const { job } = await response.json();

      toast.success('Booking created successfully!');
      router.push(`/bookings/${job.id}`);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex-1 text-center ${
                step.id === currentStep ? 'font-semibold text-blue-600' : ''
              } ${step.id < currentStep ? 'text-blue-600' : ''}`}
            >
              {step.title}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CurrentStepComponent form={form} />

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
          >
            Back
          </Button>

          {currentStep < STEPS.length ? (
            <Button type="button" onClick={handleNext} disabled={isSubmitting}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating Booking...' : 'Complete Booking'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function getFieldsForStep(step: number): (keyof BookingFormData)[] {
  switch (step) {
    case 1:
      return ['moveType'];
    case 2:
      return ['pickupAddress', 'dropoffAddress'];
    case 3:
      return ['scheduledDate', 'scheduledTime'];
    case 4:
      return ['laborHours'];
    case 5:
      return ['contactName', 'contactEmail', 'contactPhone'];
    default:
      return [];
  }
}