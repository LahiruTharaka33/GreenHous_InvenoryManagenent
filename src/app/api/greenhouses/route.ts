import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

interface SessionUser {
  id: string;
  name?: string;
  email: string;
  role: string;
}

async function getCurrentUserRole() {
  const session = await getServerSession(authOptions);
  return (session?.user as SessionUser)?.role;
}

// GET /api/greenhouses
export async function GET(req: NextRequest) {
  const greenhouses = await prisma.greenhouse.findMany();
  return NextResponse.json(greenhouses);
}

// POST /api/greenhouses
export async function POST(req: NextRequest) {
  const role = await getCurrentUserRole();
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const data = await req.json();
  const greenhouse = await prisma.greenhouse.create({ data });
  return NextResponse.json(greenhouse);
}

// PUT /api/greenhouses
export async function PUT(req: NextRequest) {
  const role = await getCurrentUserRole();
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const data = await req.json();
  const { id, ...update } = data;
  const greenhouse = await prisma.greenhouse.update({ where: { id }, data: update });
  return NextResponse.json(greenhouse);
}

// DELETE /api/greenhouses
export async function DELETE(req: NextRequest) {
  const role = await getCurrentUserRole();
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await req.json();
  await prisma.greenhouse.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 