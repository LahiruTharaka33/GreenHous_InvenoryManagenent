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
interface Assignment {
  id: string;
  userId: string;
  greenhouseId: string;
  assignedAt?: string;
}
interface AssignmentInput {
  userId: string;
  greenhouseId: string;
}

async function getCurrentUserRole() {
  const session = await getServerSession(authOptions);
  return (session?.user as SessionUser)?.role;
}

// GET /api/assignments
export async function GET(req: NextRequest) {
  const assignments = await prisma.assignment.findMany();
  return NextResponse.json(assignments);
}

// POST /api/assignments
export async function POST(req: NextRequest) {
  const role = await getCurrentUserRole();
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const data = await req.json();
  const assignment = await prisma.assignment.create({ data });
  return NextResponse.json(assignment);
}

// PUT /api/assignments
export async function PUT(req: NextRequest) {
  const role = await getCurrentUserRole();
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const data = await req.json();
  const { id, ...update } = data;
  const assignment = await prisma.assignment.update({ where: { id }, data: update });
  return NextResponse.json(assignment);
}

// DELETE /api/assignments
export async function DELETE(req: NextRequest) {
  const role = await getCurrentUserRole();
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await req.json();
  await prisma.assignment.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 