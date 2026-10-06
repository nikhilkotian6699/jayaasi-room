import { NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/db/rbac';
import { listTasks, createTask } from '@/lib/db/tasks';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'task.read' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const taskType = searchParams.get('taskType');
  const assignedToMe = searchParams.get('assignedToMe');

  const isStaff = auth.role.name === 'STAFF_ADMIN';

  // Staff sees their assigned tasks or department tasks
  const filter = {
    status: status || undefined,
    taskType: taskType || undefined,
  };

  if (isStaff || assignedToMe === 'true') {
    filter.assignedToId = auth.user.id;
    filter.department = auth.department;
  }

  const tasks = await listTasks(auth.hotelId, filter);
  return NextResponse.json({ success: true, tasks });
}

export async function POST(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'task.create' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const body = await request.json();
    const { title, description, taskType, priority, roomId, assignedToId, dueAt } = body;

    if (!title || !taskType) {
      return NextResponse.json({ success: false, error: 'title and taskType are required' }, { status: 400 });
    }

    const task = await createTask(
      {
        hotelId: auth.hotelId,
        roomId: roomId || undefined,
        createdById: auth.user.id,
        assignedToId: assignedToId || undefined,
        taskType,
        priority,
        title,
        description,
        dueAt: dueAt ? new Date(dueAt) : undefined,
      },
      request
    );

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/v1/tasks]', err);
    return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 500 });
  }
}
