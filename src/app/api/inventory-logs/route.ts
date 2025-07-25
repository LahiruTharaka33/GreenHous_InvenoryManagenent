import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

async function getCurrentUserRole() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role;
}

// GET /api/inventory-logs
export async function GET(req: NextRequest) {
  const logs = await prisma.inventoryLog.findMany();
  return NextResponse.json(logs);
}

// POST /api/inventory-logs
export async function POST(req: NextRequest) {
  const role = await getCurrentUserRole();
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const data = await req.json();
  const log = await prisma.inventoryLog.create({ data });
  return NextResponse.json(log);
}

// PUT /api/inventory-logs
export async function PUT(req: NextRequest) {
  const role = await getCurrentUserRole();
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const data = await req.json();
  const { id, ...update } = data;
  const log = await prisma.inventoryLog.update({ where: { id }, data: update });
  return NextResponse.json(log);
}

// DELETE /api/inventory-logs
export async function DELETE(req: NextRequest) {
  const role = await getCurrentUserRole();
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await req.json();
  await prisma.inventoryLog.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 