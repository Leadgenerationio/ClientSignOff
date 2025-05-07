import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendNewCreativeNotification } from '@/lib/mail';
import { AdType } from '@prisma/client';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerAuthSession();
    
    if (!session?.user?.id || session.user.role !== 'AGENCY') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const clientId = formData.get('clientId') as string;
    const adType = formData.get('adType') as AdType;
    const files = formData.getAll('files') as File[];

    if (!clientId || !adType || files.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        users: {
          where: { role: 'CLIENT' },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Store files and create Creative records
    const creatives = [];

    for (const file of files) {
      const blob = await put(file.name, file, {
        access: 'public',
      });

      const creative = await prisma.creative.create({
        data: {
          url: blob.url,
          adType,
          clientId,
          uploadedById: session.user.id,
        },
      });

      creatives.push(creative);
    }

    // Send email notifications to client users
    if (client.users.length > 0) {
      await sendNewCreativeNotification(
        client.users,
        client.name,
        creatives.length
      );
    }

    return NextResponse.json({ 
      success: true, 
      count: creatives.length,
      creatives
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 