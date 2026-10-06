import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizeRequest } from '@/lib/db/rbac';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request, {
    requiredAnyPermission: ['settings.read', 'staff.read'],
  });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  const roles = await prisma.role.findMany({
    include: {
      rolePermissions: {
        include: { permission: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({
    success: true,
    roles: roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      status: r.status,
      permissionCount: r.rolePermissions.length,
      permissions: r.rolePermissions.map((rp) => rp.permission.key),
    })),
  });
}
