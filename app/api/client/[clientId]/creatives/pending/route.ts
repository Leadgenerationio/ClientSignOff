import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await getServerAuthSession();
    
    // Check authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify user is CLIENT role and has access to this client
    if (
      session.user.role !== 'CLIENT' || 
      session.user.clientId !== params.clientId
    ) {
      return NextResponse.json(
        { error: 'You do not have access to this client' },
        { status: 403 }
      );
    }
    
    // Get all creatives for this client that the user hasn't approved/rejected yet
    const creatives = await prisma.creative.findMany({
      where: {
        clientId: params.clientId,
        approvals: {
          none: {
            userId: session.user.id,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(creatives);
  } catch (error) {
    console.error('Error fetching pending creatives:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 