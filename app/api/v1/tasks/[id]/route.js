import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizeRequest } from '@/lib/db/rbac';
import { updateTask } from '@/lib/db/tasks';

export async function PATCH(request, { params }) {
  const { auth, errorResponse } = await authorizeRequest(request, {
    requiredAnyPermission: ['task.update', 'task.complete'],
  });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task || task.hotelId !== auth.hotelId) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    // Resource-level authorization: If Staff Admin, task must be assigned to them!
    if (auth.role.name === 'STAFF_ADMIN') {
      if (task.assignedToId && task.assignedToId !== auth.user.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Staff cannot update tasks assigned to other members' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const updated = await updateTask(
      id,
      auth.user.id,
      {
        status: body.status,
        assignedToId: body.assignedToId,
        priority: body.priority,
        comment: body.comment,
      },
      request
    );

    return NextResponse.json({ success: true, task: updated });
  } catch (err) {
    console.error('[PATCH /api/v1/tasks/[id]]', err);
    return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 500 });
  }
}
