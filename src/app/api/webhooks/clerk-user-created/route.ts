import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, email_addresses, first_name, last_name } = body.data;
  const email = email_addresses?.[0]?.email_address || '';
  const name = [first_name, last_name].filter(Boolean).join(' ');

  // Avoid duplicate users
  const existing = await prisma.user.findUnique({ where: { clerkId: id } });
  if (!existing) {
    await prisma.user.create({
      data: {
        clerkId: id,
        email,
        name,
        role: 'USER', // Set default role
      },
    });
  }

  return NextResponse.json({ success: true });
} 