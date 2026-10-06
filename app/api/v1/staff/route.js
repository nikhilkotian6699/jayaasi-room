import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizeRequest, logAuditEvent, hashPassword } from '@/lib/db/rbac';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'staff.read' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  const staffMembers = await prisma.userRole.findMany({
    where: { hotelId: auth.hotelId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          lastLoginAt: true,
          assignedTasks: {
            where: { status: { not: 'COMPLETED' } },
            select: { id: true, title: true, priority: true, status: true },
          },
        },
      },
      role: true,
    },
  });

  return NextResponse.json({
    success: true,
    staff: staffMembers.map((sm) => ({
      id: sm.user.id,
      name: sm.user.name,
      email: sm.user.email,
      phone: sm.user.phone,
      status: sm.user.status,
      role: sm.role.name,
      roleId: sm.role.id,
      department: sm.department,
      lastLoginAt: sm.user.lastLoginAt,
      activeTaskCount: sm.user.assignedTasks.length,
      activeTasks: sm.user.assignedTasks,
    })),
  });
}

export async function POST(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'staff.create' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const body = await request.json();
    const { name, email, phone, roleId, department, password } = body;

    if (!name || !email || !roleId) {
      return NextResponse.json(
        { success: false, error: 'name, email, and roleId are required' },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password || 'TemporaryPass123!');

    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          phone: phone || null,
          passwordHash,
          status: 'ACTIVE',
        },
      });

      await tx.userRole.create({
        data: {
          userId: u.id,
          roleId,
          hotelId: auth.hotelId,
          department: department || null,
        },
      });

      return u;
    });

    await logAuditEvent({
      hotelId: auth.hotelId,
      userId: auth.user.id,
      action: 'STAFF_CREATED',
      resourceType: 'staff',
      resourceId: user.id,
      newValue: { email: user.email, name: user.name, roleId, department },
      request,
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/v1/staff]', err);
    return NextResponse.json({ success: false, error: 'Failed to create staff member' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const { auth, errorResponse } = await authorizeRequest(request, {
    requiredAnyPermission: ['staff.update', 'staff.disable'],
  });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const { userId, roleId, department, status } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      let u = undefined;
      if (status) {
        u = await tx.user.update({
          where: { id: userId },
          data: { status },
        });
      }

      if (roleId || department !== undefined) {
        await tx.userRole.updateMany({
          where: { userId, hotelId: auth.hotelId },
          data: {
            ...(roleId ? { roleId } : {}),
            ...(department !== undefined ? { department } : {}),
          },
        });
      }

      return u;
    });

    await logAuditEvent({
      hotelId: auth.hotelId,
      userId: auth.user.id,
      action: status === 'INACTIVE' ? 'STAFF_DISABLED' : 'STAFF_UPDATED',
      resourceType: 'staff',
      resourceId: userId,
      newValue: { status, roleId, department },
      request,
    });

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error('[PATCH /api/v1/staff]', err);
    return NextResponse.json({ success: false, error: 'Failed to update staff' }, { status: 500 });
  }
}
