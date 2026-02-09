'use client';

import { useState } from 'react';
import { Job, User, DriverProfile } from '@prisma/client';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { JobDetailModal } from './job-detail-modal';
import { OperationColumn } from './operation-column';
import { toast } from 'sonner';

type JobWithRelations = Job & {
  customer: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  driver: {
    id: string;
    name: string | null;
    phone: string | null;
    driverProfile: {
      rating: number;
      currentStatus: string;
    } | null;
  } | null;
  pricing: any;
  invoice: {
    status: string;
    depositPaid: boolean;
  } | null;
};

type DriverWithProfile = User & {
  driverProfile: DriverProfile | null;
};

interface OperationsBoardProps {
  jobs: JobWithRelations[];
  drivers: DriverWithProfile[];
}

const COLUMNS = [
  { id: 'PENDING', title: 'Pending', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'CONFIRMED', title: 'Confirmed', color: 'bg-blue-100 border-blue-300' },
  { id: 'SCHEDULED', title: 'Scheduled', color: 'bg-purple-100 border-purple-300' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-orange-100 border-orange-300' },
];

export function OperationsBoard({ jobs: initialJobs, drivers }: OperationsBoardProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [selectedJob, setSelectedJob] = useState<JobWithRelations | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Group jobs by status
  const jobsByStatus = COLUMNS.reduce((acc, column) => {
    acc[column.id] = jobs.filter((job) => {
      if (column.id === 'IN_PROGRESS') {
        return ['HEADING_TO_PICKUP', 'AT_PICKUP', 'LOADING', 'IN_TRANSIT', 'AT_DROPOFF', 'UNLOADING'].includes(job.status);
      }
      return job.status === column.id;
    });
    return acc;
  }, {} as Record<string, JobWithRelations[]>);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const jobId = active.id as string;
    const newStatus = over.id as string;

    try {
      // Optimistic update
      setJobs((prevJobs) =>
        prevJobs.map((job) => (job.id === jobId ? { ...job, status: newStatus } : job))
      );

      // API call to update status
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update job status');
      }

      toast.success('Job status updated');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update job status');
      // Revert on error
      setJobs(initialJobs);
    }
  };

  const handleJobClick = (job: JobWithRelations) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleJobUpdate = (updatedJob: JobWithRelations) => {
    setJobs((prevJobs) => prevJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)));
  };

  return (
    <>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((column) => (
            <OperationColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              jobs={jobsByStatus[column.id] || []}
              onJobClick={handleJobClick}
            />
          ))}
        </div>
      </DndContext>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          drivers={drivers}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleJobUpdate}
        />
      )}
    </>
  );
}