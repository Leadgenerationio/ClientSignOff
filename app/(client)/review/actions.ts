'use server';

import { revalidatePath } from 'next/cache';
import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Status } from '@prisma/client';

export const runtime = 'edge';

interface ApprovalParams {
  creativeId: string;
  status: Status;
  feedback?: string;
}

export async function createApproval(params: ApprovalParams) {
  try {
    const session = await getServerAuthSession();
    
    // Check authentication
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }
    
    // Verify user is CLIENT role and has a clientId
    if (session.user.role !== 'CLIENT' || !session.user.clientId) {
      throw new Error('Only client users can approve/reject creatives');
    }
    
    // Verify the creative exists and belongs to the user's client
    const creative = await prisma.creative.findFirst({
      where: {
        id: params.creativeId,
        clientId: session.user.clientId,
      },
    });
    
    if (!creative) {
      throw new Error('Creative not found');
    }
    
    // Check if user has already approved/rejected this creative
    const existingApproval = await prisma.approval.findFirst({
      where: {
        userId: session.user.id,
        creativeId: params.creativeId,
      },
    });
    
    if (existingApproval) {
      throw new Error('You have already submitted feedback for this creative');
    }
    
    // Get the client's IP address
    const forwardedFor = headers().get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    
    // Create the approval/rejection record
    const approval = await prisma.approval.create({
      data: {
        status: params.status,
        feedback: params.feedback,
        ipAddress,
        userId: session.user.id,
        creativeId: params.creativeId,
      },
    });
    
    // Revalidate relevant paths
    revalidatePath('/client/review');
    revalidatePath(`/client/library`);
    
    return approval;
  } catch (error) {
    console.error('Error creating approval:', error);
    throw error;
  }
}

function headers() {
  // Edge runtime doesn't have the headers() function
  // This is a placeholder for the actual implementation
  return {
    get: (name: string) => {
      return null;
    }
  };
} 