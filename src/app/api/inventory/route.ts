import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, SessionUser } from '../../../lib/authOptions';
import { prisma } from '../../../prisma';

async function getCurrentUserRole() {
  const session = await getServerSession(authOptions);
  return (session?.user as SessionUser)?.role;
}

// GET /api/inventory
export async function GET(_req: NextRequest) {
  const items = await prisma.inventoryItem.findMany();
  return NextResponse.json(items);
}

// POST /api/inventory
export async function POST(req: NextRequest) {
  const role = await getCurrentUserRole();
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const data = await req.json();
  const item = await prisma.inventoryItem.create({ data });
  return NextResponse.json(item);
}

// PUT /api/inventory
export async function PUT(req: NextRequest) {
  const role = await getCurrentUserRole();
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const data = await req.json();
  const { id, ...update } = data;
  const item = await prisma.inventoryItem.update({ where: { id }, data: update });
  return NextResponse.json(item);
}

// DELETE /api/inventory
export async function DELETE(req: NextRequest) {
  const role = await getCurrentUserRole();
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await req.json();
  await prisma.inventoryItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 