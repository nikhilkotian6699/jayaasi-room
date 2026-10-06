import {
  PrismaClient,
  RoomStatus,
  HousekeepingStatus,
  StayStatus,
  StaffRole,
  Department,
  DietaryType,
  QrStatus,
  TaskType,
  TaskPriority,
  TaskStatus,
  QrReplacementStatus,
  QrOrderStatus,
  UserStatus,
} from '@prisma/client';
import crypto from 'crypto';
import { SYSTEM_PERMISSIONS, STAFF_DEFAULT_PERMISSION_KEYS, hashPassword } from '../lib/db/rbac';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting deterministic seed for Jayaasi Rooms...');

  // 1. Hotel Tenant
  const hotel = await prisma.hotel.upsert({
    where: { slug: 'jayaasi-rooms' },
    update: {},
    create: {
      name: 'Jayaasi Rooms',
      slug: 'jayaasi-rooms',
      code: 'JAYAASI-PUNE',
      legalName: 'Jayaasi Hospitality Private Limited',
      address: 'North Main Road, Koregaon Park',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '411001',
      phone: '+91 20 4000 2100',
      email: 'concierge@jayaasirooms.com',
      website: 'https://jayaasirooms.com',
      gstin: '27AABCJ1234F1Z8',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      logoUrl: '/images/hero_hotel_banner.png',
      active: true,
    },
  });
  console.log(`✓ Hotel seeded: ${hotel.name} (${hotel.id})`);

  // 2. Tax Configuration
  const taxConfig = await prisma.taxConfig.upsert({
    where: {
      hotelId_taxCode: {
        hotelId: hotel.id,
        taxCode: 'GST-5',
      },
    },
    update: {},
    create: {
      hotelId: hotel.id,
      taxCode: 'GST-5',
      name: 'Hospitality & Dining GST (5%)',
      totalRate: 5.0,
      cgstRate: 2.5,
      sgstRate: 2.5,
      igstRate: 0.0,
      active: true,
    },
  });
  console.log(`✓ Tax config seeded: ${taxConfig.name}`);

  // 3. Staff Users
  const staffArjun = await prisma.staffUser.upsert({
    where: { email: 'arjun.kumar@jayaasirooms.com' },
    update: {},
    create: {
      hotelId: hotel.id,
      name: 'Arjun Kumar',
      email: 'arjun.kumar@jayaasirooms.com',
      phone: '+91 98230 45678',
      role: StaffRole.MANAGER,
      active: true,
    },
  });

  const staffSunita = await prisma.staffUser.upsert({
    where: { email: 'sunita.p@jayaasirooms.com' },
    update: {},
    create: {
      hotelId: hotel.id,
      name: 'Sunita P.',
      email: 'sunita.p@jayaasirooms.com',
      phone: '+91 98230 11223',
      role: StaffRole.HOUSEKEEPING,
      active: true,
    },
  });

  const staffChef = await prisma.staffUser.upsert({
    where: { email: 'chef.rajesh@jayaasirooms.com' },
    update: {},
    create: {
      hotelId: hotel.id,
      name: 'Chef Rajesh M.',
      email: 'chef.rajesh@jayaasirooms.com',
      phone: '+91 98230 77889',
      role: StaffRole.KITCHEN,
      active: true,
    },
  });
  console.log(`✓ Staff users seeded: ${staffArjun.name}, ${staffSunita.name}, ${staffChef.name}`);

  // 4. Room Types
  const roomTypesData = [
    { code: 'DLX-KNG', name: 'Deluxe King', basePrice: 5500, maxAdults: 2, maxChildren: 1, desc: 'King bed with garden terrace view' },
    { code: 'DLX-TWN', name: 'Deluxe Twin', basePrice: 5500, maxAdults: 2, maxChildren: 1, desc: 'Twin beds with luxury bathroom amenities' },
    { code: 'BIZ-STE', name: 'Business Suite', basePrice: 8500, maxAdults: 2, maxChildren: 1, desc: 'Premium executive suite with high-speed workstation' },
    { code: 'EXE-STE', name: 'Executive Suite', basePrice: 7200, maxAdults: 2, maxChildren: 1, desc: 'Spacious parlor with ergonomic lounge' },
    { code: 'PRE-STE', name: 'Premier Suite', basePrice: 11000, maxAdults: 3, maxChildren: 2, desc: 'Luxury corner suite with scenic view' },
    { code: 'PRS-STE', name: 'Presidential Suite', basePrice: 28000, maxAdults: 4, maxChildren: 2, desc: 'Ultra-luxury penthouse suite with private dining' },
    { code: 'EXE-KNG', name: 'Executive King', basePrice: 7500, maxAdults: 2, maxChildren: 1, desc: 'Spacious executive room with plush king bed' },
  ];

  const roomTypeMap: Record<string, string> = {};
  for (const rt of roomTypesData) {
    const createdRt = await prisma.roomType.upsert({
      where: {
        hotelId_code: {
          hotelId: hotel.id,
          code: rt.code,
        },
      },
      update: {},
      create: {
        hotelId: hotel.id,
        code: rt.code,
        name: rt.name,
        basePrice: rt.basePrice,
        maxAdults: rt.maxAdults,
        maxChildren: rt.maxChildren,
        description: rt.desc,
        active: true,
      },
    });
    roomTypeMap[rt.code] = createdRt.id;
  }
  console.log(`✓ Room types seeded (${Object.keys(roomTypeMap).length} categories)`);

  // 5. All 11 Rooms Across Floor 2 & Floor 3
  const roomsData = [
    // Floor 2 (Suites Wing)
    { number: '201', typeCode: 'DLX-KNG', floor: 'Floor 2', name: 'Deluxe King', status: RoomStatus.CLEANING, hk: HousekeepingStatus.DIRTY },
    { number: '202', typeCode: 'DLX-TWN', floor: 'Floor 2', name: 'Deluxe Twin', status: RoomStatus.AVAILABLE, hk: HousekeepingStatus.CLEAN },
    { number: '203', typeCode: 'DLX-KNG', floor: 'Floor 2', name: 'Deluxe King', status: RoomStatus.MAINTENANCE, hk: HousekeepingStatus.DIRTY },
    { number: '204', typeCode: 'BIZ-STE', floor: 'Floor 2', name: 'Business Suite', status: RoomStatus.OCCUPIED, hk: HousekeepingStatus.INSPECTED },
    { number: '205', typeCode: 'EXE-STE', floor: 'Floor 2', name: 'Executive Suite', status: RoomStatus.OCCUPIED, hk: HousekeepingStatus.INSPECTED },
    { number: '206', typeCode: 'PRS-STE', floor: 'Floor 2', name: 'Presidential Suite', status: RoomStatus.OCCUPIED, hk: HousekeepingStatus.INSPECTED },
    // Floor 3 (Premier Wing)
    { number: '301', typeCode: 'PRE-STE', floor: 'Floor 3', name: 'Premier Suite', status: RoomStatus.OCCUPIED, hk: HousekeepingStatus.INSPECTED },
    { number: '302', typeCode: 'EXE-KNG', floor: 'Floor 3', name: 'Executive King', status: RoomStatus.OCCUPIED, hk: HousekeepingStatus.INSPECTED },
    { number: '303', typeCode: 'DLX-TWN', floor: 'Floor 3', name: 'Deluxe Twin', status: RoomStatus.OCCUPIED, hk: HousekeepingStatus.INSPECTED },
    { number: '304', typeCode: 'DLX-TWN', floor: 'Floor 3', name: 'Deluxe Twin', status: RoomStatus.CLEANING, hk: HousekeepingStatus.DIRTY },
    { number: '305', typeCode: 'EXE-STE', floor: 'Floor 3', name: 'Executive Suite', status: RoomStatus.AVAILABLE, hk: HousekeepingStatus.CLEAN },
  ];

  const roomMap: Record<string, string> = {};
  for (const r of roomsData) {
    const createdRoom = await prisma.room.upsert({
      where: {
        hotelId_roomNumber: {
          hotelId: hotel.id,
          roomNumber: r.number,
        },
      },
      update: {
        status: r.status,
        housekeepingStatus: r.hk,
      },
      create: {
        hotelId: hotel.id,
        roomTypeId: roomTypeMap[r.typeCode],
        roomNumber: r.number,
        floor: r.floor,
        displayName: r.name,
        status: r.status,
        housekeepingStatus: r.hk,
        active: true,
      },
    });
    roomMap[r.number] = createdRoom.id;
  }
  console.log(`✓ All 11 rooms seeded across Floor 2 & Floor 3`);

  // 6. Registered Guests
  const guestAnanya = await prisma.guest.upsert({
    where: { id: '00000000-0000-0000-0000-000000000204' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000204',
      firstName: 'Ananya',
      lastName: 'Mehta',
      phone: '+91 98765 43210',
      email: 'ananya.mehta@example.com',
      vip: true,
      notes: 'Requires medium spicy food, extra bath towels, and morning conference wake-up call.',
    },
  });

  const guestSiddharth = await prisma.guest.upsert({
    where: { id: '00000000-0000-0000-0000-000000000205' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000205',
      firstName: 'Dr. Siddharth',
      lastName: 'Rao',
      phone: '+91 98220 11442',
      email: 'siddharth.rao@apollo.org',
      vip: false,
    },
  });

  const guestCyrus = await prisma.guest.upsert({
    where: { id: '00000000-0000-0000-0000-000000000206' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000206',
      firstName: 'Cyrus',
      lastName: 'Poonawalla',
      phone: '+91 98900 99999',
      email: 'cyrus.p@serum.org',
      vip: true,
    },
  });
  console.log(`✓ Guests seeded: ${guestAnanya.firstName} ${guestAnanya.lastName}, etc.`);

  // 7. Active Stay for Room 204 (Business Suite)
  const stay204 = await prisma.stay.upsert({
    where: { bookingReference: 'BK-2026-20401' },
    update: {},
    create: {
      hotelId: hotel.id,
      guestId: guestAnanya.id,
      roomId: roomMap['204'],
      bookingReference: 'BK-2026-20401',
      checkInAt: new Date('2026-10-04T14:00:00Z'),
      expectedCheckOutAt: new Date('2026-10-06T11:00:00Z'),
      status: StayStatus.CHECKED_IN,
    },
  });

  // Stay for Room 205
  const stay205 = await prisma.stay.upsert({
    where: { bookingReference: 'BK-2026-20501' },
    update: {},
    create: {
      hotelId: hotel.id,
      guestId: guestSiddharth.id,
      roomId: roomMap['205'],
      bookingReference: 'BK-2026-20501',
      checkInAt: new Date('2026-10-03T13:00:00Z'),
      expectedCheckOutAt: new Date('2026-10-07T12:00:00Z'),
      status: StayStatus.CHECKED_IN,
    },
  });

  // Stay for Room 206
  const stay206 = await prisma.stay.upsert({
    where: { bookingReference: 'BK-2026-20601' },
    update: {},
    create: {
      hotelId: hotel.id,
      guestId: guestCyrus.id,
      roomId: roomMap['206'],
      bookingReference: 'BK-2026-20601',
      checkInAt: new Date('2026-10-01T15:00:00Z'),
      expectedCheckOutAt: new Date('2026-10-08T11:00:00Z'),
      status: StayStatus.CHECKED_IN,
    },
  });
  console.log(`✓ Active stays seeded for Suite 204, 205, 206`);

  // 8. Service Categories
  const categoriesData = [
    { code: 'FOOD', name: 'Food & Dining', desc: 'Gourmet in-room dining, beverages & breakfast', order: 1 },
    { code: 'HOUSEKEEPING', name: 'Housekeeping', desc: 'Cleaning, fresh towels, mineral water & bath amenities', order: 2 },
    { code: 'LAUNDRY', name: 'Laundry Care', desc: 'Bespoke suit dry cleaning, washing & pressing', order: 3 },
    { code: 'CAB', name: 'Cab Services', desc: 'Airport transfers and chauffeur mobility', order: 4 },
    { code: 'SHOE_CARE', name: 'Shoe Care', desc: 'Shoe shine, leather polish & buffing', order: 5 },
    { code: 'LUGGAGE', name: 'Luggage Service', desc: 'Bell desk check-in delivery and check-out porter', order: 6 },
    { code: 'STORE', name: 'Jayaasi Store', desc: 'Artisanal gifts, travel essentials & keepsakes', order: 7 },
  ];

  const categoryMap: Record<string, string> = {};
  for (const c of categoriesData) {
    const createdCat = await prisma.serviceCategory.upsert({
      where: {
        hotelId_code: {
          hotelId: hotel.id,
          code: c.code,
        },
      },
      update: {},
      create: {
        hotelId: hotel.id,
        code: c.code,
        name: c.name,
        description: c.desc,
        displayOrder: c.order,
        active: true,
      },
    });
    categoryMap[c.code] = createdCat.id;
  }
  console.log(`✓ Service categories seeded`);

  // 9. Services & Food Menu Items
  // Food items
  const foodItems = [
    { code: 'FOOD-FRD-RIC', name: 'Vegetable Fried Rice', price: 120, diet: DietaryType.VEG, spice: 1, prep: 20, sub: 'Chinese', dept: Department.KITCHEN },
    { code: 'FOOD-PAN-TIK', name: 'Chef Special Paneer Tikka', price: 280, diet: DietaryType.VEG, spice: 2, prep: 25, sub: 'North Indian', dept: Department.KITCHEN },
    { code: 'FOOD-MNT-LME', name: 'Fresh Mint Lime Soda', price: 80, diet: DietaryType.VEG, spice: 0, prep: 5, sub: 'Beverages', dept: Department.KITCHEN },
    { code: 'FOOD-MAS-DOS', name: 'Masala Dosa', price: 120, diet: DietaryType.VEG, spice: 1, prep: 15, sub: 'South Indian', dept: Department.KITCHEN },
    { code: 'FOOD-CHK-SAM', name: 'Chicken Samosa', price: 120, diet: DietaryType.NON_VEG, spice: 2, prep: 15, sub: 'South Indian', dept: Department.KITCHEN },
    { code: 'FOOD-BUT-CHK', name: 'Butter Chicken', price: 480, diet: DietaryType.NON_VEG, spice: 2, prep: 30, sub: 'North Indian', dept: Department.KITCHEN },
    { code: 'FOOD-CLD-COF', name: 'Cold Coffee', price: 180, diet: DietaryType.VEG, spice: 0, prep: 10, sub: 'Arabian', dept: Department.KITCHEN },
  ];

  for (const f of foodItems) {
    const svc = await prisma.service.upsert({
      where: {
        hotelId_code: {
          hotelId: hotel.id,
          code: f.code,
        },
      },
      update: {},
      create: {
        hotelId: hotel.id,
        categoryId: categoryMap['FOOD'],
        code: f.code,
        name: f.name,
        price: f.price,
        department: f.dept,
        active: true,
        available: true,
      },
    });

    await prisma.foodMenuItem.upsert({
      where: { serviceId: svc.id },
      update: {},
      create: {
        serviceId: svc.id,
        dietaryType: f.diet,
        spiceLevel: f.spice,
        prepTimeMinutes: f.prep,
        subCuisine: f.sub,
      },
    });
  }

  // Housekeeping services
  const housekeepingItems = [
    { code: 'HK-EXT-TWL', name: 'Extra Bath Towels Replenishment', price: 0, dept: Department.HOUSEKEEPING },
    { code: 'HK-DRN-WTR', name: 'Packaged Mineral Water (1L)', price: 0, dept: Department.HOUSEKEEPING },
    { code: 'HK-AYU-KIT', name: 'Ayurvedic Bath & Spa Kit', price: 0, dept: Department.HOUSEKEEPING },
    { code: 'HK-TRN-DWN', name: 'Full Evening Turndown Service', price: 0, dept: Department.HOUSEKEEPING },
  ];

  for (const h of housekeepingItems) {
    await prisma.service.upsert({
      where: {
        hotelId_code: {
          hotelId: hotel.id,
          code: h.code,
        },
      },
      update: {},
      create: {
        hotelId: hotel.id,
        categoryId: categoryMap['HOUSEKEEPING'],
        code: h.code,
        name: h.name,
        price: h.price,
        department: h.dept,
        active: true,
        available: true,
      },
    });
  }

  // Laundry services
  const laundryItems = [
    { code: 'LND-SUT-DRY', name: 'Business Suit Dry Cleaning', price: 350, dept: Department.LAUNDRY },
    { code: 'LND-SHT-PRS', name: 'Formal Cotton Shirt Pressing', price: 120, dept: Department.LAUNDRY },
    { code: 'LND-BLZ-DRY', name: 'Medical Blazer & Formal Slacks', price: 480, dept: Department.LAUNDRY },
  ];

  for (const l of laundryItems) {
    await prisma.service.upsert({
      where: {
        hotelId_code: {
          hotelId: hotel.id,
          code: l.code,
        },
      },
      update: {},
      create: {
        hotelId: hotel.id,
        categoryId: categoryMap['LAUNDRY'],
        code: l.code,
        name: l.name,
        price: l.price,
        department: l.dept,
        active: true,
        available: true,
      },
    });
  }

  // Cab services
  const cabItems = [
    { code: 'CAB-APT-SED', name: 'Airport Private Transfer (Sedan)', price: 850, dept: Department.TRANSPORT },
    { code: 'CAB-SUV-LUX', name: 'Premium Luxury SUV Chauffeur (Full Day)', price: 4500, dept: Department.TRANSPORT },
  ];

  for (const c of cabItems) {
    await prisma.service.upsert({
      where: {
        hotelId_code: {
          hotelId: hotel.id,
          code: c.code,
        },
      },
      update: {},
      create: {
        hotelId: hotel.id,
        categoryId: categoryMap['CAB'],
        code: c.code,
        name: c.name,
        price: c.price,
        department: c.dept,
        active: true,
        available: true,
      },
    });
  }

  // Shoe care & Luggage
  await prisma.service.upsert({
    where: { hotelId_code: { hotelId: hotel.id, code: 'SHOE-OXF-POL' } },
    update: {},
    create: {
      hotelId: hotel.id,
      categoryId: categoryMap['SHOE_CARE'],
      code: 'SHOE-OXF-POL',
      name: 'Oxford Leather Polish & Buff',
      price: 150,
      department: Department.HOUSEKEEPING,
      active: true,
      available: true,
    },
  });

  await prisma.service.upsert({
    where: { hotelId_code: { hotelId: hotel.id, code: 'LUG-ARR-DLV' } },
    update: {},
    create: {
      hotelId: hotel.id,
      categoryId: categoryMap['LUGGAGE'],
      code: 'LUG-ARR-DLV',
      name: 'Arrival Luggage Delivery to Suite',
      price: 0,
      department: Department.BELL_DESK,
      active: true,
      available: true,
    },
  });
  console.log(`✓ All services (Dining, Housekeeping, Laundry, Cab, Luggage, Shoe) seeded`);

  // 10. Store Products
  const products = [
    { sku: 'JAY-STR-01', name: 'Executive Leather Notebook & Pen', price: 850, stock: 25 },
    { sku: 'JAY-STR-02', name: 'Jayaasi Signature Amber Aroma Diffuser', price: 1200, stock: 15 },
    { sku: 'JAY-STR-03', name: 'Organic Himalayan Herbal Tea Gift Box', price: 650, stock: 40 },
    { sku: 'JAY-STR-04', name: 'Mulberry Silk Sleep Mask & Pillow Mist', price: 950, stock: 20 },
    { sku: 'JAY-STR-05', name: 'Universal 65W GaN Fast Travel Adapter', price: 1100, stock: 30 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: {
        hotelId_sku: {
          hotelId: hotel.id,
          sku: p.sku,
        },
      },
      update: {},
      create: {
        hotelId: hotel.id,
        categoryId: categoryMap['STORE'],
        name: p.name,
        sku: p.sku,
        price: p.price,
        stockQuantity: p.stock,
        available: true,
      },
    });
  }
  console.log(`✓ Jayaasi Store retail products seeded`);

  // 11. Folio & Folio Charges for Suite 204
  const folio204 = await prisma.folio.upsert({
    where: { folioNumber: 'FOLIO-2026-204' },
    update: {
      subtotal: 11900.0,
      taxTotal: 595.0,
      discountTotal: 0.0,
      grandTotal: 12495.0,
    },
    create: {
      hotelId: hotel.id,
      stayId: stay204.id,
      folioNumber: 'FOLIO-2026-204',
      subtotal: 11900.0,
      taxTotal: 595.0,
      discountTotal: 0.0,
      grandTotal: 12495.0,
    },
  });

  const charges204 = [
    { category: 'Room Tariff', desc: 'Business Suite Night 1', qty: 1, unitPrice: 8500, tax: 425, total: 8925 },
    { category: 'In-Room Dining', desc: 'Vegetable Fried Rice & Paneer Tikka', qty: 1, unitPrice: 560, tax: 28, total: 588 },
    { category: 'Laundry Care', desc: 'Business Suit Dry Cleaning & Pressing', qty: 1, unitPrice: 590, tax: 29.5, total: 619.5 },
    { category: 'Shoe Care', desc: 'Leather Polish & Shine', qty: 1, unitPrice: 150, tax: 7.5, total: 157.5 },
    { category: 'Cab Concierge', desc: 'Airport Transfer Booking (Sedan)', qty: 1, unitPrice: 850, tax: 42.5, total: 892.5 },
    { category: 'Jayaasi Store', desc: 'Silk Artisan Stole & Brass Keepsake', qty: 1, unitPrice: 1250, tax: 62.5, total: 1312.5 },
  ];

  for (const ch of charges204) {
    const existing = await prisma.folioCharge.findFirst({
      where: { folioId: folio204.id, description: ch.desc },
    });
    if (!existing) {
      await prisma.folioCharge.create({
        data: {
          folioId: folio204.id,
          category: ch.category,
          description: ch.desc,
          quantity: ch.qty,
          unitPrice: ch.unitPrice,
          subtotal: ch.unitPrice * ch.qty,
          tax: ch.tax,
          total: ch.total,
        },
      });
    }
  }

  // Invoice for Room 204
  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-204-8902' },
    update: {},
    create: {
      hotelId: hotel.id,
      stayId: stay204.id,
      folioId: folio204.id,
      invoiceNumber: 'INV-204-8902',
      subtotal: 11900.0,
      cgst: 297.5,
      sgst: 297.5,
      grandTotal: 12495.0,
      status: 'ISSUED',
    },
  });
  console.log(`✓ Folio & Invoice INV-204-8902 seeded`);

  // 12. Service Requests
  const requestsData = [
    {
      reqNum: 'REQ-1042',
      roomNumber: '204',
      guestId: guestAnanya.id,
      stayId: stay204.id,
      dept: Department.KITCHEN,
      staffId: staffChef.id,
      status: 'IN_PROGRESS' as const,
      notes: 'Please make food medium spicy. No plastic cutlery.',
    },
    {
      reqNum: 'REQ-1041',
      roomNumber: '204',
      guestId: guestAnanya.id,
      stayId: stay204.id,
      dept: Department.HOUSEKEEPING,
      staffId: staffSunita.id,
      status: 'NEW' as const,
      notes: 'Extra towels and drinking water bottles.',
    },
    {
      reqNum: 'REQ-1040',
      roomNumber: '205',
      guestId: guestSiddharth.id,
      stayId: stay205.id,
      dept: Department.KITCHEN,
      staffId: staffChef.id,
      status: 'NEW' as const,
      notes: 'Multigrain sandwich and double espresso.',
    },
  ];

  for (const r of requestsData) {
    await prisma.serviceRequest.upsert({
      where: { requestNumber: r.reqNum },
      update: {},
      create: {
        hotelId: hotel.id,
        stayId: r.stayId,
        roomId: roomMap[r.roomNumber],
        guestId: r.guestId,
        requestNumber: r.reqNum,
        department: r.dept,
        status: r.status,
        assignedStaffId: r.staffId,
        notes: r.notes,
      },
    });
  }
  console.log(`✓ Live operational service requests seeded`);

  // 14. Floors
  const floor2 = await prisma.floor.upsert({
    where: { hotelId_floorNumber: { hotelId: hotel.id, floorNumber: '2' } },
    update: {},
    create: {
      hotelId: hotel.id,
      floorNumber: '2',
      name: 'Second Floor Suites',
      displayOrder: 2,
      active: true,
    },
  });

  const floor3 = await prisma.floor.upsert({
    where: { hotelId_floorNumber: { hotelId: hotel.id, floorNumber: '3' } },
    update: {},
    create: {
      hotelId: hotel.id,
      floorNumber: '3',
      name: 'Third Floor Premier',
      displayOrder: 3,
      active: true,
    },
  });

  // Link rooms to their floors
  await prisma.room.updateMany({
    where: { hotelId: hotel.id, floor: 'Floor 2' },
    data: { floorId: floor2.id },
  });
  await prisma.room.updateMany({
    where: { hotelId: hotel.id, floor: 'Floor 3' },
    data: { floorId: floor3.id },
  });
  console.log(`✓ Floors seeded and linked to rooms`);

  // 15. Room QR Codes (Permanent QR identities)
  const allRooms = await prisma.room.findMany({ where: { hotelId: hotel.id } });
  for (const rm of allRooms) {
    const existingQr = await prisma.roomQrCode.findFirst({
      where: { roomId: rm.id, status: QrStatus.ACTIVE },
    });
    if (!existingQr) {
      const publicId = `qr_${rm.roomNumber}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      await prisma.roomQrCode.create({
        data: {
          roomId: rm.id,
          hotelId: hotel.id,
          qrPublicId: publicId,
          qrVersion: 1,
          status: QrStatus.ACTIVE,
        },
      });
    }
  }
  console.log(`✓ Active QR codes generated and assigned for all ${allRooms.length} rooms`);

  // 16. RBAC Permissions Catalog
  for (const perm of SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { description: perm.description, resource: perm.resource, action: perm.action },
      create: {
        key: perm.key,
        resource: perm.resource,
        action: perm.action,
        description: perm.description,
      },
    });
  }
  console.log(`✓ ${SYSTEM_PERMISSIONS.length} system permissions seeded`);

  // 17. Roles: OWNER_ADMIN & STAFF_ADMIN
  const ownerRole = await prisma.role.upsert({
    where: { name: 'OWNER_ADMIN' },
    update: { description: 'Full business and hotel operational control' },
    create: {
      name: 'OWNER_ADMIN',
      description: 'Full business and hotel operational control',
      status: 'ACTIVE',
    },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'STAFF_ADMIN' },
    update: { description: 'Limited operational task and department control' },
    create: {
      name: 'STAFF_ADMIN',
      description: 'Limited operational task and department control',
      status: 'ACTIVE',
    },
  });

  // Assign ALL permissions to OWNER_ADMIN
  const allDbPerms = await prisma.permission.findMany();
  for (const p of allDbPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: ownerRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: ownerRole.id, permissionId: p.id },
    });
  }

  // Assign ONLY operational permissions to STAFF_ADMIN
  const staffPerms = allDbPerms.filter((p) => STAFF_DEFAULT_PERMISSION_KEYS.includes(p.key));
  for (const p of staffPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: staffRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: staffRole.id, permissionId: p.id },
    });
  }
  console.log(`✓ Roles OWNER_ADMIN and STAFF_ADMIN seeded with permissions`);

  // 18. RBAC Users
  const ownerPasswordHash = hashPassword('OwnerPass123!');
  const staffPasswordHash = hashPassword('StaffPass123!');

  // Owner User
  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@livinn.com' },
    update: { passwordHash: ownerPasswordHash, status: UserStatus.ACTIVE },
    create: {
      name: 'Vikramaditya Singhania',
      email: 'owner@livinn.com',
      phone: '+91 99887 66554',
      passwordHash: ownerPasswordHash,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId_hotelId: { userId: ownerUser.id, roleId: ownerRole.id, hotelId: hotel.id } },
    update: {},
    create: {
      userId: ownerUser.id,
      roleId: ownerRole.id,
      hotelId: hotel.id,
      department: Department.FRONT_DESK,
    },
  });

  // Staff User 1: Housekeeping
  const staffHousekeeping = await prisma.user.upsert({
    where: { email: 'sunita.housekeeping@jayaasi.com' },
    update: { passwordHash: staffPasswordHash, status: UserStatus.ACTIVE },
    create: {
      name: 'Sunita Patil',
      email: 'sunita.housekeeping@jayaasi.com',
      phone: '+91 98230 11223',
      passwordHash: staffPasswordHash,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId_hotelId: { userId: staffHousekeeping.id, roleId: staffRole.id, hotelId: hotel.id } },
    update: { department: Department.HOUSEKEEPING },
    create: {
      userId: staffHousekeeping.id,
      roleId: staffRole.id,
      hotelId: hotel.id,
      department: Department.HOUSEKEEPING,
    },
  });

  // Staff User 2: Kitchen
  const staffKitchen = await prisma.user.upsert({
    where: { email: 'chef.kitchen@jayaasi.com' },
    update: { passwordHash: staffPasswordHash, status: UserStatus.ACTIVE },
    create: {
      name: 'Chef Rajesh Marathe',
      email: 'chef.kitchen@jayaasi.com',
      phone: '+91 98230 77889',
      passwordHash: staffPasswordHash,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId_hotelId: { userId: staffKitchen.id, roleId: staffRole.id, hotelId: hotel.id } },
    update: { department: Department.KITCHEN },
    create: {
      userId: staffKitchen.id,
      roleId: staffRole.id,
      hotelId: hotel.id,
      department: Department.KITCHEN,
    },
  });

  // Staff User 3: Maintenance
  const staffMaintenance = await prisma.user.upsert({
    where: { email: 'vikram.maintenance@jayaasi.com' },
    update: { passwordHash: staffPasswordHash, status: UserStatus.ACTIVE },
    create: {
      name: 'Vikram Shinde',
      email: 'vikram.maintenance@jayaasi.com',
      phone: '+91 98230 44556',
      passwordHash: staffPasswordHash,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId_hotelId: { userId: staffMaintenance.id, roleId: staffRole.id, hotelId: hotel.id } },
    update: { department: Department.MAINTENANCE },
    create: {
      userId: staffMaintenance.id,
      roleId: staffRole.id,
      hotelId: hotel.id,
      department: Department.MAINTENANCE,
    },
  });
  console.log(`✓ RBAC users seeded: Owner and Staff (Housekeeping, Kitchen, Maintenance)`);

  // 19. Multi-Tenant Hotel Tenant B ("Emerald Bay Resort")
  const hotelB = await prisma.hotel.upsert({
    where: { slug: 'emerald-bay' },
    update: {},
    create: {
      name: 'Emerald Bay Resort',
      slug: 'emerald-bay',
      code: 'EMERALD-GOA',
      legalName: 'Emerald Hospitality Goa LLP',
      address: 'Calangute Beach Road, North Goa',
      city: 'Goa',
      state: 'Goa',
      country: 'India',
      postalCode: '403516',
      phone: '+91 832 245 8800',
      email: 'stay@emeraldbay.com',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      active: true,
    },
  });

  // Room Type & Room 204 in Hotel B (to test cross-hotel isolation)
  const roomTypeB = await prisma.roomType.upsert({
    where: { hotelId_code: { hotelId: hotelB.id, code: 'VILLA-SEA' } },
    update: {},
    create: {
      hotelId: hotelB.id,
      code: 'VILLA-SEA',
      name: 'Sea Facing Villa',
      basePrice: 12000,
      active: true,
    },
  });

  await prisma.room.upsert({
    where: { hotelId_roomNumber: { hotelId: hotelB.id, roomNumber: '204' } },
    update: {},
    create: {
      hotelId: hotelB.id,
      roomTypeId: roomTypeB.id,
      floor: 'Floor 2',
      roomNumber: '204',
      displayName: 'Ocean View Villa 204',
      status: RoomStatus.AVAILABLE,
      active: true,
    },
  });

  const ownerBUser = await prisma.user.upsert({
    where: { email: 'owner@emeraldbay.com' },
    update: { passwordHash: ownerPasswordHash, status: UserStatus.ACTIVE },
    create: {
      name: 'Goa Owner Admin',
      email: 'owner@emeraldbay.com',
      passwordHash: ownerPasswordHash,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId_hotelId: { userId: ownerBUser.id, roleId: ownerRole.id, hotelId: hotelB.id } },
    update: {},
    create: {
      userId: ownerBUser.id,
      roleId: ownerRole.id,
      hotelId: hotelB.id,
    },
  });
  console.log(`✓ Multi-tenant isolated Hotel B seeded: ${hotelB.name} (${hotelB.code})`);

  // 20. QR Inventory
  await prisma.qrInventory.upsert({
    where: { hotelId_sku: { hotelId: hotel.id, sku: 'QR-ACRYLIC-STD' } },
    update: { quantity: 120, minimumStock: 25 },
    create: {
      hotelId: hotel.id,
      sku: 'QR-ACRYLIC-STD',
      qrBoxType: 'Standard Acrylic Room QR Box',
      quantity: 120,
      minimumStock: 25,
      supplierId: 'SUP-JAYAASI-CORE',
      status: 'IN_STOCK',
    },
  });

  await prisma.qrInventory.upsert({
    where: { hotelId_sku: { hotelId: hotel.id, sku: 'QR-BRASS-PREM' } },
    update: { quantity: 30, minimumStock: 10 },
    create: {
      hotelId: hotel.id,
      sku: 'QR-BRASS-PREM',
      qrBoxType: 'Brushed Brass QR Plaque',
      quantity: 30,
      minimumStock: 10,
      supplierId: 'SUP-LUX-BRASS',
      status: 'IN_STOCK',
    },
  });
  console.log(`✓ QR Inventory items seeded`);

  // 21. Sample Operational Tasks
  const room204Id = roomMap['204'];
  const room205Id = roomMap['205'];

  await prisma.task.create({
    data: {
      hotelId: hotel.id,
      roomId: room204Id,
      createdById: ownerUser.id,
      assignedToId: staffHousekeeping.id,
      taskType: TaskType.HOUSEKEEPING,
      priority: TaskPriority.HIGH,
      title: 'Turn-down and linen change for Suite 204',
      description: 'Guest requested extra hypoallergenic pillows and fresh Egyptian cotton sheets.',
      status: TaskStatus.ASSIGNED,
    },
  });

  await prisma.task.create({
    data: {
      hotelId: hotel.id,
      roomId: room205Id,
      createdById: ownerUser.id,
      assignedToId: staffMaintenance.id,
      taskType: TaskType.MAINTENANCE,
      priority: TaskPriority.NORMAL,
      title: 'Inspect bathroom thermostatic mixer in Room 205',
      description: 'Scheduled preventive check for water temperature regulator.',
      status: TaskStatus.PENDING,
    },
  });
  console.log(`✓ Sample operational tasks seeded`);

  // 22. QR Damage Request for Room 204
  const existingActiveQr204 = await prisma.roomQrCode.findFirst({
    where: { roomId: room204Id, status: QrStatus.ACTIVE },
  });

  const existingDamageReport = await prisma.qrReplacement.findFirst({
    where: { roomId: room204Id, status: QrReplacementStatus.REPORTED },
  });

  if (!existingDamageReport) {
    const rep204 = await prisma.qrReplacement.create({
      data: {
        hotelId: hotel.id,
        roomId: room204Id,
        reportedById: staffHousekeeping.id,
        reason: 'QR box damaged — surface scratched and corner cracked',
        description: 'Nightstand QR box has visible abrasion and camera struggles to focus.',
        photoUrl: '/images/qr-damaged-sample.png',
        status: QrReplacementStatus.REPORTED,
        oldQrId: existingActiveQr204?.id || null,
      },
    });

    await prisma.qrReplacementHistory.create({
      data: {
        replacementId: rep204.id,
        status: QrReplacementStatus.REPORTED,
        notes: 'Damage reported during morning room inspection by Sunita P.',
        changedById: staffHousekeeping.id,
      },
    });
  }
  console.log(`✓ Room 204 QR damage report seeded in status REPORTED`);

  console.log('✅ Deterministic seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
