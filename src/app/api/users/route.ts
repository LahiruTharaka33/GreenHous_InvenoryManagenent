import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

interface SessionUser {
  id: string;
  name?: string;
  email: string;
  role: string;
}

// GET /api/users
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

// POST /api/users
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as SessionUser)?.role;
  if (!session || userRole !== 'ADMIN') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const data = await req.json();
  const user = await prisma.user.create({ data });
  return NextResponse.json(user);
}

// PUT /api/users
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as SessionUser)?.role;
  if (!session || userRole !== 'ADMIN') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const data = await req.json();
  const { id, ...update } = data;
  const user = await prisma.user.update({ where: { id }, data: update });
  return NextResponse.json(user);
}

// DELETE /api/users
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as SessionUser)?.role;
  if (!session || userRole !== 'ADMIN') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await req.json();
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 