import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, company, email } = body;

    const subscriber = await prisma.newsSubscriber.create({
      data: {
        name,
        phone,
        company,
        email,
      },
    });

    return NextResponse.json({ success: true, data: subscriber });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
} 