import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, SessionUser } from '../../../lib/authOptions';
import { prisma } from '../../../prisma';
import bcrypt from 'bcryptjs';

// GET /api/users
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = await prisma.user.findMany({
    include: {
      ownedGreenhouses: {
        select: {
          id: true,
          name: true
        }
      },
      assignments: {
        select: {
          id: true,
          greenhouse: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
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
  
  // Hash password if provided
  if (data.password) {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    data.hashedPassword = hashedPassword;
    delete data.password;
  }
  
  const user = await prisma.user.create({ 
    data,
    include: {
      ownedGreenhouses: {
        select: {
          id: true,
          name: true
        }
      },
      assignments: {
        select: {
          id: true,
          greenhouse: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
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
  
  // Hash password if provided
  if (update.password) {
    const hashedPassword = await bcrypt.hash(update.password, 12);
    update.hashedPassword = hashedPassword;
    delete update.password;
  }
  
  const user = await prisma.user.update({ 
    where: { id }, 
    data: update,
    include: {
      ownedGreenhouses: {
        select: {
          id: true,
          name: true
        }
      },
      assignments: {
        select: {
          id: true,
          greenhouse: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
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