import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

interface SessionUser {
  id: string;
  role: string;
  name?: string;
  email: string;
}
interface ScheduleInput {
  description: string;
  startDate: string;
  endDate?: string;
  items: string;
  greenhouseId: string;
}

async function getCurrentUserRole() {
  const session = await getServerSession(authOptions);
  return (session?.user as SessionUser)?.role;
}

// GET /api/schedules
export async function GET(req: NextRequest) {
  const schedules = await prisma.fertilizerSchedule.findMany();
  return NextResponse.json(schedules);
}

// POST /api/schedules
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as SessionUser)?.role;
  const userId = (session?.user as SessionUser)?.id;
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const data = await req.json();
  const { greenhouseId, startDate, endDate, ...rest } = data;
  const schedule = await prisma.fertilizerSchedule.create({
    data: {
      ...rest,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      greenhouse: { connect: { id: greenhouseId } },
      createdBy: { connect: { id: userId } },
    },
  });
  return NextResponse.json(schedule);
}

// PUT /api/schedules
export async function PUT(req: NextRequest) {
  const role = await getCurrentUserRole();
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const data = await req.json();
  const { id, ...update } = data;
  const schedule = await prisma.fertilizerSchedule.update({ where: { id }, data: update });
  return NextResponse.json(schedule);
}

// DELETE /api/schedules
export async function DELETE(req: NextRequest) {
  const role = await getCurrentUserRole();
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await req.json();
  await prisma.fertilizerSchedule.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 