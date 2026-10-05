import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Department, RequestStatus } from '@prisma/client';
import { createLiveServiceRequest, updateRequestStatus } from '@/lib/db/requests';
import { INITIAL_ROOM_REQUESTS, SUITE_ROOMS } from '@/lib/admin-data';

// Map UI category / service name to Prisma Department enum
function mapDepartment(depStr) {
  if (!depStr) return Department.KITCHEN;
  const s = depStr.toUpperCase();
  if (s.includes('HOUSEKEEPING')) return Department.HOUSEKEEPING;
  if (s.includes('LAUNDRY')) return Department.LAUNDRY;
  if (s.includes('CAB') || s.includes('TRANSPORT') || s.includes('CHAUFFEUR')) return Department.TRANSPORT;
  if (s.includes('LUGGAGE') || s.includes('BELL')) return Department.BELL_DESK;
  if (s.includes('CONCIERGE')) return Department.CONCIERGE;
  if (s.includes('STORE') || s.includes('RETAIL')) return Department.RETAIL;
  return Department.KITCHEN;
}

// In-memory runtime cache to preserve requests created during dev if DB resets
let runtimeRequestsStore = [...INITIAL_ROOM_REQUESTS];

export async function GET(request) {
  try {
    const hotel = await prisma.hotel.findFirst();
    if (!hotel) {
      return NextResponse.json({ success: true, requests: runtimeRequestsStore });
    }

    const dbRequests = await prisma.serviceRequest.findMany({
      where: { hotelId: hotel.id },
      include: {
        room: { select: { roomNumber: true, displayName: true, floor: true } },
        guest: { select: { firstName: true, lastName: true, phone: true } },
        order: { include: { items: true } },
        assignedStaff: { select: { fullName: true, role: true } },
      },
      orderBy: { requestedAt: 'desc' },
    });

    // Map DB requests to UI format
    const formattedDbRequests = dbRequests.map((req) => {
      const suite = SUITE_ROOMS.find((r) => r.number === req.room.roomNumber);
      const items = req.order?.items.map((i) => ({
        name: i.nameSnapshot,
        qty: i.quantity,
        price: Number(i.unitPrice),
      })) || (req.notes ? [{ name: req.notes, qty: 1, price: 0 }] : []);

      const totalAmount = req.order ? Number(req.order.grandTotal) : 0;

      // Status mapper: DB NEW -> UI New, DB IN_PROGRESS -> UI In Progress, etc.
      let uiStatus = 'New';
      if (req.status === 'IN_PROGRESS' || req.status === 'ACCEPTED') uiStatus = 'In Progress';
      else if (req.status === 'COMPLETED') uiStatus = 'Completed';
      else if (req.status === 'CANCELLED') uiStatus = 'Cancelled';

      // Department display
      let uiDept = 'Kitchen / Room Service';
      let uiServiceType = 'Food & Dining';
      if (req.department === 'HOUSEKEEPING') {
        uiDept = 'Housekeeping';
        uiServiceType = 'Housekeeping';
      } else if (req.department === 'LAUNDRY') {
        uiDept = 'Laundry Care';
        uiServiceType = 'Laundry & Garment Care';
      } else if (req.department === 'TRANSPORT') {
        uiDept = 'Concierge / Chauffeur';
        uiServiceType = 'Cab Services';
      } else if (req.department === 'BELL_DESK') {
        uiDept = 'Bell Desk / Concierge';
        uiServiceType = 'Luggage Handling';
      }

      return {
        id: req.requestNumber,
        dbId: req.id,
        room: req.room.roomNumber,
        guest: `${req.guest.firstName} ${req.guest.lastName || ''}`.trim(),
        suiteType: suite?.name || req.room.displayName || 'Guest Suite',
        serviceType: uiServiceType,
        items,
        totalAmount,
        specialInstructions: req.notes || '',
        timestamp: 'Just now',
        rawTimestamp: req.requestedAt,
        status: uiStatus,
        department: uiDept,
        assignedStaff: req.assignedStaff?.fullName || 'Desk Duty Manager',
        billedToRoom: true,
      };
    });

    // Merge: prioritize DB requests, append initial mock requests that aren't duplicated by ID
    const dbReqNumbers = new Set(formattedDbRequests.map((r) => r.id));
    const merged = [
      ...formattedDbRequests,
      ...runtimeRequestsStore.filter((r) => !dbReqNumbers.has(r.id)),
    ];

    return NextResponse.json({ success: true, requests: merged });
  } catch (error) {
    console.error('Error in GET /api/requests:', error);
    return NextResponse.json({ success: true, requests: runtimeRequestsStore });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      room = '204',
      guest = 'Guest of Room 204',
      serviceType = 'Food & Dining',
      department = 'Kitchen / Room Service',
      items = [],
      totalAmount = 0,
      specialInstructions = '',
    } = body;

    const prismaDept = mapDepartment(department || serviceType);

    let createdDbReq = null;
    try {
      createdDbReq = await createLiveServiceRequest({
        roomNumber: String(room),
        department: prismaDept,
        guestName: guest,
        notes: specialInstructions,
        items: items.length > 0 ? items : [{ name: serviceType, qty: 1, price: totalAmount }],
      });
    } catch (dbErr) {
      console.warn('DB creation error, using memory fallback:', dbErr.message);
    }

    const suite = SUITE_ROOMS.find((r) => r.number === String(room));
    const newEntry = {
      id: createdDbReq ? createdDbReq.requestNumber : `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      dbId: createdDbReq ? createdDbReq.id : null,
      room: String(room),
      guest: guest,
      suiteType: suite?.name || 'Guest Suite',
      serviceType: serviceType,
      items: items.length > 0 ? items : [{ name: serviceType, qty: 1, price: totalAmount }],
      totalAmount: Number(totalAmount) || 0,
      specialInstructions: specialInstructions,
      timestamp: 'Just now',
      status: 'New',
      department: department || 'Kitchen / Room Service',
      assignedStaff: 'Desk Duty Manager',
      billedToRoom: true,
    };

    runtimeRequestsStore.unshift(newEntry);

    return NextResponse.json({
      success: true,
      message: `Request ${newEntry.id} submitted successfully!`,
      request: newEntry,
    });
  } catch (error) {
    console.error('Error in POST /api/requests:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create request' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status, assignedStaff } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing id or status' }, { status: 400 });
    }

    // Map UI status to DB status
    let dbStatus = RequestStatus.NEW;
    if (status === 'In Progress') dbStatus = RequestStatus.IN_PROGRESS;
    else if (status === 'Completed') dbStatus = RequestStatus.COMPLETED;
    else if (status === 'Cancelled') dbStatus = RequestStatus.CANCELLED;

    // Try finding by requestNumber or id
    try {
      const existing = await prisma.serviceRequest.findFirst({
        where: {
          OR: [{ id: id.includes('-') && id.length === 36 ? id : undefined }, { requestNumber: id }].filter(Boolean),
        },
      });

      if (existing) {
        await updateRequestStatus(existing.id, dbStatus);
      }
    } catch (e) {
      console.warn('DB patch error, updating runtime memory:', e.message);
    }

    // Update in memory
    runtimeRequestsStore = runtimeRequestsStore.map((r) =>
      r.id === id ? { ...r, status, ...(assignedStaff ? { assignedStaff } : {}) } : r
    );

    return NextResponse.json({ success: true, message: `Status updated to ${status}` });
  } catch (error) {
    console.error('Error in PATCH /api/requests:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
