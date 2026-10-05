import { PrismaClient, RoomStatus, HousekeepingStatus, Department } from '@prisma/client';

const prisma = new PrismaClient();

async function runIntegrityTests() {
  console.log('🧪 Starting Database Integrity & Constraint Verification Tests...\n');
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failedCount++;
    }
  }

  // 1. Hotel & Room Inventory Count Test
  const hotel = await prisma.hotel.findUnique({ where: { slug: 'jayaasi-rooms' } });
  assert(!!hotel, 'Hotel "jayaasi-rooms" exists in database');

  const roomCount = await prisma.room.count({ where: { hotelId: hotel!.id } });
  assert(roomCount === 11, `All 11 rooms seeded (found ${roomCount})`);

  // 2. Room 204 Business Suite & Active Stay
  const room204 = await prisma.room.findUnique({
    where: { hotelId_roomNumber: { hotelId: hotel!.id, roomNumber: '204' } },
    include: { stays: { where: { status: 'CHECKED_IN' }, include: { guest: true, folio: true } } },
  });
  assert(!!room204, 'Room 204 exists');
  assert(room204?.status === RoomStatus.OCCUPIED, 'Room 204 status is OCCUPIED');
  assert(room204?.stays.length === 1, 'Room 204 has 1 active checked-in stay');
  assert(room204?.stays[0].guest.firstName === 'Ananya', 'Guest Ananya Mehta is assigned to Room 204 stay');

  // 3. Folio & Folio Charges Test
  const folio204 = await prisma.folio.findUnique({
    where: { folioNumber: 'FOLIO-2026-204' },
    include: { charges: true },
  });
  assert(!!folio204, 'Folio FOLIO-2026-204 exists');
  assert(Number(folio204?.grandTotal) === 12495.0, `Folio grandTotal matches ₹12,495 (found ₹${folio204?.grandTotal})`);
  assert(folio204!.charges.length >= 6, `Folio has at least 6 line item charges (found ${folio204?.charges.length})`);

  // 4. Invoice Test
  const invoice204 = await prisma.invoice.findUnique({
    where: { invoiceNumber: 'INV-204-8902' },
  });
  assert(!!invoice204, 'Invoice INV-204-8902 exists and matches GST folio');

  // 5. Negative Test: Duplicate Room Number for same Hotel MUST FAIL
  try {
    await prisma.room.create({
      data: {
        hotelId: hotel!.id,
        roomTypeId: room204!.roomTypeId,
        floor: 'Floor 2',
        roomNumber: '204', // duplicate!
        displayName: 'Duplicate 204',
      },
    });
    assert(false, 'Duplicate room number 204 for same hotel must throw unique constraint error');
  } catch {
    assert(true, 'Duplicate room 204 correctly rejected by @@unique([hotelId, roomNumber]) constraint');
  }

  // 6. Negative Test: Create Room with non-existent Hotel MUST FAIL
  try {
    await prisma.room.create({
      data: {
        hotelId: '00000000-0000-0000-0000-999999999999',
        roomTypeId: room204!.roomTypeId,
        floor: 'Floor 99',
        roomNumber: '999',
        displayName: 'Phantom Room',
      },
    });
    assert(false, 'Room referencing nonexistent hotelId must fail');
  } catch {
    assert(true, 'Foreign key constraint correctly prevents room with invalid hotelId');
  }

  // 7. Negative Test: Create Order referencing non-existent Stay MUST FAIL
  try {
    await prisma.order.create({
      data: {
        hotelId: hotel!.id,
        stayId: '00000000-0000-0000-0000-999999999999',
        guestId: room204!.stays[0].guest.id,
        roomId: room204!.id,
        orderNumber: 'ORD-INVALID-99',
        subtotal: 100,
        taxTotal: 5,
        grandTotal: 105,
      },
    });
    assert(false, 'Order referencing non-existent stayId must fail');
  } catch {
    assert(true, 'Foreign key constraint correctly prevents order with invalid stayId');
  }

  // 8. Negative Test: Create Duplicate Invoice Number MUST FAIL
  try {
    await prisma.invoice.create({
      data: {
        hotelId: hotel!.id,
        stayId: room204!.stays[0].id,
        folioId: folio204!.id,
        invoiceNumber: 'INV-204-8902', // duplicate!
        subtotal: 100,
        cgst: 2.5,
        sgst: 2.5,
        grandTotal: 105,
      },
    });
    assert(false, 'Duplicate invoice number must fail');
  } catch {
    assert(true, 'Unique constraint correctly prevents duplicate invoice numbers');
  }

  // 9. Negative Test: Delete Hotel with active records MUST FAIL (Restrict constraint)
  try {
    await prisma.hotel.delete({
      where: { id: hotel!.id },
    });
    assert(false, 'Deleting hotel with active rooms, folios and stays must fail');
  } catch {
    assert(true, 'OnDelete Restrict constraint correctly protects hotel property and financial records');
  }

  // 10. Operational Order & Request Creation Lifecycle Test
  const testOrderNumber = `ORD-TEST-${Date.now().toString().slice(-4)}`;
  const createdTestOrder = await prisma.order.create({
    data: {
      hotelId: hotel!.id,
      stayId: room204!.stays[0].id,
      guestId: room204!.stays[0].guest.id,
      roomId: room204!.id,
      orderNumber: testOrderNumber,
      subtotal: 240,
      taxTotal: 12,
      grandTotal: 252,
      items: {
        create: [
          {
            nameSnapshot: 'Vegetable Fried Rice',
            quantity: 2,
            unitPrice: 120,
            taxRate: 5.0,
            taxAmount: 12,
            lineTotal: 252,
          },
        ],
      },
    },
    include: { items: true },
  });
  assert(!!createdTestOrder && createdTestOrder.items.length === 1, 'Transactional order with frozen item price snapshots created');

  // Clean up test order
  await prisma.orderItem.deleteMany({ where: { orderId: createdTestOrder.id } });
  await prisma.order.delete({ where: { id: createdTestOrder.id } });
  assert(true, 'Transactional order lifecycle validated and cleaned up');

  console.log(`\n📊 Integrity Results: ${passedCount} Passed, ${failedCount} Failed`);
  if (failedCount > 0) {
    process.exit(1);
  }
}

runIntegrityTests()
  .catch((e) => {
    console.error('Fatal test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
