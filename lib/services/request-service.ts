import { getLiveServiceRequests, updateRequestStatus } from '@/lib/db/requests';
import { RequestStatus, Department } from '@prisma/client';

export async function fetchLiveRequests(
  hotelId: string,
  filter?: {
    roomId?: string;
    department?: Department;
    status?: RequestStatus;
  }
) {
  const requests = await getLiveServiceRequests(hotelId, filter);
  return requests.map((req) => ({
    id: req.requestNumber,
    dbId: req.id,
    room: req.room.roomNumber,
    guest: `${req.guest.firstName} ${req.guest.lastName}`,
    serviceType: req.department,
    items: req.order?.items.map((i) => ({ name: i.nameSnapshot, qty: i.quantity, price: Number(i.unitPrice) })) || [],
    totalAmount: req.order ? Number(req.order.grandTotal) : 0,
    specialInstructions: req.notes || '',
    timestamp: req.requestedAt.toISOString(),
    status: req.status === 'NEW' ? 'New' : req.status === 'IN_PROGRESS' || req.status === 'ACCEPTED' ? 'In Progress' : 'Completed',
    department: req.department,
    assignedStaff: req.assignedStaff?.name || 'Unassigned',
    billedToRoom: !!req.orderId,
  }));
}

export async function updateServiceTicketStatus(
  requestId: string,
  status: RequestStatus,
  staffId?: string
) {
  return updateRequestStatus(requestId, status, staffId);
}
