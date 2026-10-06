import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createAuthToken, logAuditEvent } from '@/lib/db/rbac';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, hotelCode } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        userRoles: {
          include: {
            hotel: true,
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'User account is deactivated' },
        { status: 403 }
      );
    }

    // Select assigned hotel (either matching hotelCode or first available)
    let selectedUserRole = user.userRoles[0];
    if (hotelCode) {
      const match = user.userRoles.find((ur) => ur.hotel.code === hotelCode || ur.hotel.slug === hotelCode);
      if (match) selectedUserRole = match;
    }

    if (!selectedUserRole) {
      return NextResponse.json(
        { success: false, error: 'No authorized hotel found for this account' },
        { status: 403 }
      );
    }

    const permissions = selectedUserRole.role.rolePermissions.map((rp) => rp.permission.key);

    const token = createAuthToken({
      userId: user.id,
      email: user.email,
      hotelId: selectedUserRole.hotelId,
      roleName: selectedUserRole.role.name,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await logAuditEvent({
      hotelId: selectedUserRole.hotelId,
      userId: user.id,
      action: 'LOGIN',
      resourceType: 'user',
      resourceId: user.id,
      newValue: { email: user.email, role: selectedUserRole.role.name },
      request,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      role: selectedUserRole.role.name,
      department: selectedUserRole.department,
      hotel: {
        id: selectedUserRole.hotel.id,
        name: selectedUserRole.hotel.name,
        code: selectedUserRole.hotel.code,
        slug: selectedUserRole.hotel.slug,
      },
      permissions,
    });
  } catch (err) {
    console.error('[POST /api/v1/auth/login]', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
