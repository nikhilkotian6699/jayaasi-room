// ─── Request / Order Status ────────────────────────────────────────
export const REQUEST_STATUS = {
  NEW: 'New',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'In Progress',
  READY: 'Ready',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

// ─── Room Status ───────────────────────────────────────────────────
export const ROOM_STATUS = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  CLEANING: 'Cleaning',
  MAINTENANCE: 'Maintenance',
  OUT_OF_SERVICE: 'Out of Service',
};

// ─── Roles ─────────────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  HOTEL_ADMIN: 'Hotel Admin',
  MANAGER: 'Manager',
  DEPARTMENT_STAFF: 'Department Staff',
};

// ─── Departments ───────────────────────────────────────────────────
export const DEPARTMENTS = [
  'Reception',
  'Housekeeping',
  'Kitchen',
  'Room Service',
  'Laundry',
  'Maintenance',
  'Management',
];

// ─── Service Categories ────────────────────────────────────────────
export const SERVICE_CATEGORIES = [
  'Food & Dining',
  'Housekeeping',
  'Laundry',
  'Maintenance',
  'Amenities',
  'Travel',
  'Other',
];
