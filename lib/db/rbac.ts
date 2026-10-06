/**
 * Jayaasi Technology — Core RBAC & Multi-Tenant Authorization Engine
 *
 * Architecture:
 *   User -> Role -> Permissions -> Resource -> Action
 *   Enforces:
 *     - Multi-tenant hotel isolation
 *     - Departmental scoping
 *     - Strict permission checks
 *     - Server-side 403 Forbidden rejection
 *     - Audit logging for every administrative/operational mutation
 */

import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { Department, UserStatus } from '@prisma/client';

export const ROLES = {
  OWNER_ADMIN: 'OWNER_ADMIN',
  STAFF_ADMIN: 'STAFF_ADMIN',
} as const;

export interface SystemPermissionDef {
  key: string;
  resource: string;
  action: string;
  description: string;
}

export const SYSTEM_PERMISSIONS: SystemPermissionDef[] = [
  // Hotel
  { key: 'hotel.read', resource: 'hotel', action: 'read', description: 'View hotel details' },
  { key: 'hotel.update', resource: 'hotel', action: 'update', description: 'Update hotel information and settings' },

  // Floors
  { key: 'floor.read', resource: 'floor', action: 'read', description: 'View hotel floors' },
  { key: 'floor.create', resource: 'floor', action: 'create', description: 'Create new hotel floors' },
  { key: 'floor.update', resource: 'floor', action: 'update', description: 'Update floor details' },
  { key: 'floor.delete', resource: 'floor', action: 'delete', description: 'Delete/disable hotel floor' },

  // Room Types
  { key: 'room_type.read', resource: 'room_type', action: 'read', description: 'View room types' },
  { key: 'room_type.create', resource: 'room_type', action: 'create', description: 'Create room types' },
  { key: 'room_type.update', resource: 'room_type', action: 'update', description: 'Update room types' },
  { key: 'room_type.delete', resource: 'room_type', action: 'delete', description: 'Disable room types' },

  // Rooms
  { key: 'room.read', resource: 'room', action: 'read', description: 'View room details' },
  { key: 'room.create', resource: 'room', action: 'create', description: 'Create rooms' },
  { key: 'room.update', resource: 'room', action: 'update', description: 'Edit room details' },
  { key: 'room.delete', resource: 'room', action: 'delete', description: 'Disable/delete rooms' },
  { key: 'room_status.read', resource: 'room_status', action: 'read', description: 'View room status' },
  { key: 'room_status.update', resource: 'room_status', action: 'update', description: 'Update room housekeeping & status' },

  // QR Management
  { key: 'qr.read', resource: 'qr', action: 'read', description: 'View room QR codes' },
  { key: 'qr.create', resource: 'qr', action: 'create', description: 'Generate room QR codes' },
  { key: 'qr.update', resource: 'qr', action: 'update', description: 'Update QR code settings' },
  { key: 'qr.revoke', resource: 'qr', action: 'revoke', description: 'Revoke room QR codes' },
  { key: 'qr.regenerate', resource: 'qr', action: 'regenerate', description: 'Regenerate room QR codes' },

  // QR Inventory & Procurement
  { key: 'qr_inventory.read', resource: 'qr_inventory', action: 'read', description: 'View QR inventory stock' },
  { key: 'qr_inventory.create', resource: 'qr_inventory', action: 'create', description: 'Add QR inventory stock items' },
  { key: 'qr_inventory.update', resource: 'qr_inventory', action: 'update', description: 'Order QR inventory & adjust stock' },

  // QR Damage & Replacement
  { key: 'qr_replacement.read', resource: 'qr_replacement', action: 'read', description: 'View QR replacement requests' },
  { key: 'qr_replacement.create', resource: 'qr_replacement', action: 'create', description: 'Report damaged QR box' },
  { key: 'qr_replacement.approve', resource: 'qr_replacement', action: 'approve', description: 'Approve QR replacement request' },
  { key: 'qr_replacement.reject', resource: 'qr_replacement', action: 'reject', description: 'Reject QR replacement request' },

  // Guests & Sessions
  { key: 'guest.read', resource: 'guest', action: 'read', description: 'View guest directory' },
  { key: 'guest.analytics', resource: 'guest', action: 'analytics', description: 'View guest metrics and analytics' },
  { key: 'session.read', resource: 'session', action: 'read', description: 'View active guest room sessions' },
  { key: 'session.revoke', resource: 'session', action: 'revoke', description: 'Terminate guest sessions' },

  // Orders
  { key: 'order.read', resource: 'order', action: 'read', description: 'View customer orders' },
  { key: 'order.update', resource: 'order', action: 'update', description: 'Update order status' },

  // Tasks
  { key: 'task.read', resource: 'task', action: 'read', description: 'View staff tasks' },
  { key: 'task.create', resource: 'task', action: 'create', description: 'Create operational tasks' },
  { key: 'task.assign', resource: 'task', action: 'assign', description: 'Assign tasks to staff members' },
  { key: 'task.update', resource: 'task', action: 'update', description: 'Update task progress and status' },
  { key: 'task.complete', resource: 'task', action: 'complete', description: 'Mark task completed' },

  // Staff
  { key: 'staff.read', resource: 'staff', action: 'read', description: 'View staff members' },
  { key: 'staff.create', resource: 'staff', action: 'create', description: 'Add new staff members' },
  { key: 'staff.update', resource: 'staff', action: 'update', description: 'Update staff member profile & operational area' },
  { key: 'staff.disable', resource: 'staff', action: 'disable', description: 'Disable staff accounts' },

  // Analytics & Business
  { key: 'analytics.read', resource: 'analytics', action: 'read', description: 'View hotel & operational analytics' },
  { key: 'revenue.read', resource: 'revenue', action: 'read', description: 'View financial and revenue metrics' },

  // Reports
  { key: 'report.read', resource: 'report', action: 'read', description: 'View and generate reports' },
  { key: 'report.export', resource: 'report', action: 'export', description: 'Export hotel and operational data' },

  // Audit Logs & Settings
  { key: 'audit.read', resource: 'audit', action: 'read', description: 'View administrative audit logs' },
  { key: 'settings.read', resource: 'settings', action: 'read', description: 'View hotel configuration' },
  { key: 'settings.update', resource: 'settings', action: 'update', description: 'Update hotel configuration' },
];

/** Staff Admin permissions: operational only */
export const STAFF_DEFAULT_PERMISSION_KEYS = [
  'task.read',
  'task.update',
  'task.complete',
  'order.read',
  'order.update',
  'room.read',
  'room_status.read',
  'qr_replacement.create',
];

// ─────────────────────────────────────────────────────────────
// CRYPTO & TOKENS
// ─────────────────────────────────────────────────────────────

const TOKEN_SECRET = process.env.AUTH_SECRET || 'jayaasi-super-secret-rbac-key-2026';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, originalHash] = stored.split(':');
    if (!salt || !originalHash) return false;
    const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(computedHash, 'hex'));
  } catch {
    return false;
  }
}

export function createAuthToken(payload: { userId: string; email: string; hotelId?: string; roleName?: string }): string {
  const data = JSON.stringify({
    ...payload,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
  const encoded = Buffer.from(data).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifyAuthToken(token: string): { userId: string; email: string; hotelId?: string; roleName?: string } | null {
  try {
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature) return null;
    const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// RBAC QUERIES
// ─────────────────────────────────────────────────────────────

export interface UserAuthContext {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    status: UserStatus;
  };
  role: {
    id: string;
    name: string;
    description: string | null;
  };
  hotelId: string;
  department: Department | null;
  permissions: string[];
}

/**
 * Fetch a user's active role, department and permissions for a specific hotel tenant.
 */
export async function getUserAuthContext(userId: string, hotelId: string): Promise<UserAuthContext | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        where: { hotelId },
        include: {
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

  if (!user || user.status !== UserStatus.ACTIVE) return null;
  const userRole = user.userRoles[0];
  if (!userRole) return null;

  const permissions = userRole.role.rolePermissions.map((rp) => rp.permission.key);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
    },
    role: {
      id: userRole.role.id,
      name: userRole.role.name,
      description: userRole.role.description,
    },
    hotelId: userRole.hotelId,
    department: userRole.department,
    permissions,
  };
}

/**
 * Authenticate incoming request, verify hotel tenancy, and authorize permission.
 * Checks Authorization header, cookies, or test headers (x-user-id / x-hotel-id).
 */
export async function authorizeRequest(
  request: Request,
  options?: {
    requiredPermission?: string;
    requiredAnyPermission?: string[];
    hotelId?: string;
  }
): Promise<{ auth: UserAuthContext | null; errorResponse?: { status: number; message: string; code: string } }> {
  // Extract token or headers
  const authHeader = request.headers.get('authorization') || '';
  const testUserId = request.headers.get('x-user-id');
  const headerHotelId = request.headers.get('x-hotel-id');

  let userId: string | null = null;
  let tokenHotelId: string | undefined = undefined;

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyAuthToken(token);
    if (decoded) {
      userId = decoded.userId;
      tokenHotelId = decoded.hotelId;
    }
  } else if (testUserId) {
    userId = testUserId;
  }

  if (!userId) {
    return {
      auth: null,
      errorResponse: { status: 401, message: 'Authentication required', code: 'UNAUTHORIZED' },
    };
  }

  // Determine target hotel
  const targetHotelId = options?.hotelId || headerHotelId || tokenHotelId;
  if (!targetHotelId) {
    // If no hotel specified, find user's primary hotel
    const userRole = await prisma.userRole.findFirst({
      where: { userId },
      select: { hotelId: true },
    });
    if (!userRole) {
      return {
        auth: null,
        errorResponse: { status: 403, message: 'User has no assigned hotel', code: 'NO_HOTEL_ASSIGNED' },
      };
    }
    return checkPermissionsForHotel(userId, userRole.hotelId, options);
  }

  return checkPermissionsForHotel(userId, targetHotelId, options);
}

async function checkPermissionsForHotel(
  userId: string,
  hotelId: string,
  options?: { requiredPermission?: string; requiredAnyPermission?: string[] }
): Promise<{ auth: UserAuthContext | null; errorResponse?: { status: number; message: string; code: string } }> {
  const authContext = await getUserAuthContext(userId, hotelId);

  // Tenant check: User is NOT authorized for this hotel
  if (!authContext) {
    return {
      auth: null,
      errorResponse: {
        status: 403,
        message: 'Forbidden: Access denied to this hotel tenant or user inactive',
        code: 'FORBIDDEN_TENANT_ACCESS',
      },
    };
  }

  // Permission checks
  if (options?.requiredPermission) {
    if (!authContext.permissions.includes(options.requiredPermission)) {
      return {
        auth: authContext,
        errorResponse: {
          status: 403,
          message: `Forbidden: Missing required permission [${options.requiredPermission}]`,
          code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
        },
      };
    }
  }

  if (options?.requiredAnyPermission && options.requiredAnyPermission.length > 0) {
    const hasAny = options.requiredAnyPermission.some((perm) => authContext.permissions.includes(perm));
    if (!hasAny) {
      return {
        auth: authContext,
        errorResponse: {
          status: 403,
          message: `Forbidden: Missing required permission`,
          code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
        },
      };
    }
  }

  return { auth: authContext };
}

// ─────────────────────────────────────────────────────────────
// AUDIT LOGGING
// ─────────────────────────────────────────────────────────────

export interface LogAuditOptions {
  hotelId: string;
  userId?: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  oldValue?: any;
  newValue?: any;
  request?: Request;
}

export async function logAuditEvent(options: LogAuditOptions) {
  try {
    let ipHash: string | undefined = undefined;
    let userAgent: string | undefined = undefined;

    if (options.request) {
      const forwarded = options.request.headers.get('x-forwarded-for') || '127.0.0.1';
      const ip = forwarded.split(',')[0].trim();
      ipHash = crypto.createHash('sha256').update(ip + (process.env.IP_SALT || 'salt')).digest('hex');
      userAgent = options.request.headers.get('user-agent')?.slice(0, 255) || undefined;
    }

    return await prisma.userAuditLog.create({
      data: {
        hotelId: options.hotelId,
        userId: options.userId || null,
        action: options.action,
        resourceType: options.resourceType,
        resourceId: options.resourceId,
        oldValue: options.oldValue ? JSON.parse(JSON.stringify(options.oldValue)) : undefined,
        newValue: options.newValue ? JSON.parse(JSON.stringify(options.newValue)) : undefined,
        ipHash,
        userAgent,
      },
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err);
    return null;
  }
}
