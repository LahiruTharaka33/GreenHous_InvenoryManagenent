import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists.' }, { status: 409 });
    }
    // Hash the password
    const hashedPassword = await hash(password, 10);
    // Create the user
    const _user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        // Optionally set default role, etc.
      },
    });
    return NextResponse.json({ message: 'User registered successfully.' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
} 