/**
 * Jayaasi Technology — Staff & Hotel Operations Task System
 */

import prisma from '@/lib/prisma';
import { TaskType, TaskPriority, TaskStatus, Department } from '@prisma/client';
import { logAuditEvent } from './rbac';

export interface CreateTaskInput {
  hotelId: string;
  roomId?: string;
  createdById?: string;
  assignedToId?: string;
  taskType: TaskType;
  priority?: TaskPriority;
  title: string;
  description?: string;
  dueAt?: Date;
}

export async function createTask(input: CreateTaskInput, req?: Request) {
  const task = await prisma.task.create({
    data: {
      hotelId: input.hotelId,
      roomId: input.roomId || null,
      createdById: input.createdById || null,
      assignedToId: input.assignedToId || null,
      taskType: input.taskType,
      priority: input.priority || TaskPriority.NORMAL,
      title: input.title,
      description: input.description || null,
      status: input.assignedToId ? TaskStatus.ASSIGNED : TaskStatus.PENDING,
      dueAt: input.dueAt || null,
    },
    include: {
      room: true,
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
  });

  await logAuditEvent({
    hotelId: input.hotelId,
    userId: input.createdById,
    action: 'TASK_CREATED',
    resourceType: 'task',
    resourceId: task.id,
    newValue: { title: task.title, type: task.taskType, priority: task.priority },
    request: req,
  });

  return task;
}

export async function listTasks(
  hotelId: string,
  filter?: {
    assignedToId?: string;
    taskType?: TaskType;
    status?: TaskStatus;
    roomId?: string;
    department?: Department | null;
  }
) {
  const where: any = { hotelId };

  if (filter?.assignedToId) where.assignedToId = filter.assignedToId;
  if (filter?.status) where.status = filter.status;
  if (filter?.roomId) where.roomId = filter.roomId;
  if (filter?.taskType) where.taskType = filter.taskType;

  // Department mapping if staff filter is applied
  if (filter?.department) {
    const dept = filter.department;
    if (dept === Department.HOUSEKEEPING) {
      where.taskType = { in: [TaskType.HOUSEKEEPING, TaskType.AMENITY, TaskType.QR_REPLACEMENT] };
    } else if (dept === Department.KITCHEN) {
      where.taskType = { in: [TaskType.ROOM_SERVICE] };
    } else if (dept === Department.LAUNDRY) {
      where.taskType = { in: [TaskType.LAUNDRY] };
    } else if (dept === Department.MAINTENANCE) {
      where.taskType = { in: [TaskType.MAINTENANCE, TaskType.QR_REPLACEMENT] };
    }
  }

  return prisma.task.findMany({
    where,
    include: {
      room: {
        select: {
          id: true,
          roomNumber: true,
          floor: true,
          displayName: true,
          status: true,
        },
      },
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function updateTask(
  taskId: string,
  userId: string,
  data: {
    status?: TaskStatus;
    assignedToId?: string;
    priority?: TaskPriority;
    comment?: string;
  },
  req?: Request
) {
  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    include: { room: true },
  });
  if (!existing) return null;

  const updateData: any = {};
  if (data.status) {
    updateData.status = data.status;
    if (data.status === TaskStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }
  }
  if (data.assignedToId !== undefined) {
    updateData.assignedToId = data.assignedToId;
    if (data.assignedToId && existing.status === TaskStatus.PENDING) {
      updateData.status = TaskStatus.ASSIGNED;
    }
  }
  if (data.priority) {
    updateData.priority = data.priority;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const t = await tx.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        room: true,
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    if (data.comment) {
      await tx.taskComment.create({
        data: {
          taskId,
          userId,
          comment: data.comment,
        },
      });
    }

    return t;
  });

  await logAuditEvent({
    hotelId: existing.hotelId,
    userId,
    action: data.status === TaskStatus.COMPLETED ? 'TASK_COMPLETED' : 'TASK_UPDATED',
    resourceType: 'task',
    resourceId: taskId,
    oldValue: { status: existing.status, assignedToId: existing.assignedToId },
    newValue: updateData,
    request: req,
  });

  return updated;
}
