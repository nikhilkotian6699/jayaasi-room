// Central Hotel Operations & Admin Data Model for ALL Rooms

export const INITIAL_ROOM_REQUESTS = [
  {
    id: 'REQ-1042',
    room: '204',
    guest: 'Ananya Mehta',
    suiteType: 'Business Suite',
    serviceType: 'Food & Dining',
    items: [
      { name: 'Vegetable Fried Rice', qty: 1, price: 120 },
      { name: 'Chef Special Paneer Tikka', qty: 1, price: 280 },
      { name: 'Fresh Mint Lime Soda', qty: 2, price: 80 }
    ],
    totalAmount: 560,
    specialInstructions: 'Please make food medium spicy. No plastic cutlery.',
    timestamp: '10 mins ago',
    status: 'In Progress',
    department: 'Kitchen / Room Service',
    assignedStaff: 'Chef Rajesh M.',
    billedToRoom: true
  },
  {
    id: 'REQ-1041',
    room: '204',
    guest: 'Ananya Mehta',
    suiteType: 'Business Suite',
    serviceType: 'Housekeeping',
    items: [
      { name: 'Extra Bath Towels', qty: 2, price: 0 },
      { name: 'Ayurvedic Toiletries Refill', qty: 1, price: 0 },
      { name: 'Packaged Drinking Water (1L)', qty: 2, price: 0 }
    ],
    totalAmount: 0,
    specialInstructions: 'Please leave outside door if Do Not Disturb is on.',
    timestamp: '25 mins ago',
    status: 'New',
    department: 'Housekeeping',
    assignedStaff: 'Sunita P.',
    billedToRoom: true
  },
  {
    id: 'REQ-1040',
    room: '205',
    guest: 'Dr. Siddharth Rao',
    suiteType: 'Executive Suite',
    serviceType: 'Food & Dining',
    items: [
      { name: 'Club Grilled Sandwich (Multigrain)', qty: 1, price: 240 },
      { name: 'Single Origin Espresso Macchiato', qty: 2, price: 160 }
    ],
    totalAmount: 560,
    specialInstructions: 'Serve with roasted potato crisps and extra napkins.',
    timestamp: '35 mins ago',
    status: 'New',
    department: 'Kitchen / Room Service',
    assignedStaff: 'Chef Daniel V.',
    billedToRoom: true
  },
  {
    id: 'REQ-1039',
    room: '204',
    guest: 'Ananya Mehta',
    suiteType: 'Business Suite',
    serviceType: 'Laundry & Garment Care',
    items: [
      { name: 'Business Suit Dry Cleaning', qty: 1, price: 350 },
      { name: 'Formal Cotton Shirt Pressing', qty: 2, price: 120 }
    ],
    totalAmount: 590,
    specialInstructions: 'Return before 8:00 AM tomorrow for morning conference.',
    timestamp: '1 hour ago',
    status: 'In Progress',
    department: 'Laundry Care',
    assignedStaff: 'Mahesh K.',
    billedToRoom: true
  },
  {
    id: 'REQ-1038',
    room: '204',
    guest: 'Ananya Mehta',
    suiteType: 'Business Suite',
    serviceType: 'Cab Services',
    items: [
      { name: 'Airport Private Transfer (Sedan)', qty: 1, price: 850 }
    ],
    totalAmount: 850,
    specialInstructions: 'Flight AI-852 to Delhi. Pickup at 4:30 AM from Main Porch.',
    timestamp: '2 hours ago',
    status: 'New',
    department: 'Concierge / Chauffeur',
    assignedStaff: 'Ramesh Chauffeur',
    billedToRoom: true
  },
  {
    id: 'REQ-1037',
    room: '206',
    guest: 'Mr. Cyrus Poonawalla',
    suiteType: 'Presidential Suite',
    serviceType: 'Cab Services',
    items: [
      { name: 'Premium Luxury SUV Chauffeur (Full Day)', qty: 1, price: 4500 }
    ],
    totalAmount: 4500,
    specialInstructions: 'Chauffeur with Pune-Mumbai expressway pass required.',
    timestamp: '2 hours ago',
    status: 'In Progress',
    department: 'Concierge / Chauffeur',
    assignedStaff: 'Vinod S.',
    billedToRoom: true
  },
  {
    id: 'REQ-1036',
    room: '301',
    guest: 'Meera Singhania',
    suiteType: 'Premier Suite',
    serviceType: 'Housekeeping',
    items: [
      { name: 'Full Evening Turndown Service', qty: 1, price: 0 },
      { name: 'Lavender Pillow Mist & Herbal Tea Refill', qty: 1, price: 0 }
    ],
    totalAmount: 0,
    specialInstructions: 'Please service while guest is at dinner between 8 PM to 9 PM.',
    timestamp: '3 hours ago',
    status: 'New',
    department: 'Housekeeping',
    assignedStaff: 'Pooja T.',
    billedToRoom: true
  },
  {
    id: 'REQ-1035',
    room: '204',
    guest: 'Ananya Mehta',
    suiteType: 'Business Suite',
    serviceType: 'Shoe Care',
    items: [
      { name: 'Oxford Leather Polish & Buff', qty: 1, price: 150 }
    ],
    totalAmount: 150,
    specialInstructions: 'Brown leather formal shoes.',
    timestamp: '3 hours ago',
    status: 'Completed',
    department: 'Housekeeping',
    assignedStaff: 'Sunita P.',
    billedToRoom: true
  },
  {
    id: 'REQ-1034',
    room: '302',
    guest: 'Vikramaditya Oberoi',
    suiteType: 'Executive King',
    serviceType: 'Luggage Handling',
    items: [
      { name: 'Arrival Luggage Delivery to Suite', qty: 3, price: 0 }
    ],
    totalAmount: 0,
    specialInstructions: 'High-value garment carrier. Handle with care.',
    timestamp: '4 hours ago',
    status: 'Completed',
    department: 'Bell Desk / Concierge',
    assignedStaff: 'Vikram B.',
    billedToRoom: true
  },
  {
    id: 'REQ-1031',
    room: '204',
    guest: 'Ananya Mehta',
    suiteType: 'Business Suite',
    serviceType: 'Luggage Handling',
    items: [
      { name: 'Check-out Luggage Carrying (2 bags)', qty: 1, price: 0 }
    ],
    totalAmount: 0,
    specialInstructions: 'Pickup scheduled at 10:45 AM tomorrow.',
    timestamp: '4 hours ago',
    status: 'New',
    department: 'Bell Desk / Concierge',
    assignedStaff: 'Vikram B.',
    billedToRoom: true
  }
];

export const ALL_ROOM_INVOICES = [
  {
    invoiceNumber: 'INV-204-8902',
    room: '204',
    suiteName: 'Business Suite',
    guestName: 'Ananya Mehta',
    phone: '+91 98765 43210',
    email: 'ananya.mehta@example.com',
    checkInDate: '04 Oct 2026, 02:00 PM',
    checkOutDate: '06 Oct 2026, 11:00 AM',
    paymentStatus: 'Billed to Room',
    lineItems: [
      { id: 1, date: '04 Oct', category: 'Room Tariff', description: 'Business Suite Night 1', amount: 8500 },
      { id: 2, date: '04 Oct', category: 'In-Room Dining', description: 'Vegetable Fried Rice & Paneer Tikka', amount: 560 },
      { id: 3, date: '04 Oct', category: 'Laundry Care', description: 'Business Suit Dry Cleaning & Pressing', amount: 590 },
      { id: 4, date: '05 Oct', category: 'Shoe Care', description: 'Leather Polish & Shine', amount: 150 },
      { id: 5, date: '05 Oct', category: 'Cab Concierge', description: 'Airport Transfer Booking (Sedan)', amount: 850 },
      { id: 6, date: '05 Oct', category: 'Jayaasi Store', description: 'Silk Artisan Stole & Brass Keepsake', amount: 1250 }
    ],
    subtotal: 11900,
    cgst: 297.5,
    sgst: 297.5,
    grandTotal: 12495
  },
  {
    invoiceNumber: 'INV-205-7741',
    room: '205',
    suiteName: 'Executive Suite',
    guestName: 'Dr. Siddharth Rao',
    phone: '+91 98220 11442',
    email: 'siddharth.rao@apollo.org',
    checkInDate: '03 Oct 2026, 01:00 PM',
    checkOutDate: '07 Oct 2026, 12:00 PM',
    paymentStatus: 'Billed to Room',
    lineItems: [
      { id: 1, date: '03 Oct', category: 'Room Tariff', description: 'Executive Suite Night 1', amount: 7200 },
      { id: 2, date: '04 Oct', category: 'In-Room Dining', description: 'Multigrain Club Sandwich & Macchiato', amount: 560 },
      { id: 3, date: '04 Oct', category: 'Laundry Care', description: 'Medical Blazer & Formal Slacks Dry Clean', amount: 480 },
      { id: 4, date: '05 Oct', category: 'Cab Concierge', description: 'City Hospital Chauffeur Trip', amount: 650 },
      { id: 5, date: '05 Oct', category: 'Mini Bar', description: 'Artisan Sparkling Water & Dark Chocolate', amount: 440 }
    ],
    subtotal: 9330,
    cgst: 233.25,
    sgst: 233.25,
    grandTotal: 9796.5
  },
  {
    invoiceNumber: 'INV-206-3390',
    room: '206',
    suiteName: 'Presidential Suite',
    guestName: 'Mr. Cyrus Poonawalla',
    phone: '+91 98900 99999',
    email: 'cyrus.p@serum.org',
    checkInDate: '01 Oct 2026, 03:00 PM',
    checkOutDate: '08 Oct 2026, 11:00 AM',
    paymentStatus: 'Direct Billing (Corporate VIP)',
    lineItems: [
      { id: 1, date: '01 Oct', category: 'Room Tariff', description: 'Presidential Suite Night 1', amount: 28000 },
      { id: 2, date: '02 Oct', category: 'In-Room Dining', description: 'Chef Special Caviar & Truffle Risotto', amount: 3800 },
      { id: 3, date: '03 Oct', category: 'Cab Concierge', description: 'Premium Luxury SUV Chauffeur (Full Day)', amount: 4500 },
      { id: 4, date: '04 Oct', category: 'Laundry Care', description: 'Gentlemen Bespoke Tuxedo & Silk Shirts', amount: 1650 },
      { id: 5, date: '05 Oct', category: 'Jayaasi Store', description: 'Handcrafted Heritage Marble Inlay Box', amount: 2500 }
    ],
    subtotal: 40450,
    cgst: 1011.25,
    sgst: 1011.25,
    grandTotal: 42472.5
  },
  {
    invoiceNumber: 'INV-301-4412',
    room: '301',
    suiteName: 'Premier Suite',
    guestName: 'Meera Singhania',
    phone: '+91 97110 55431',
    email: 'meera.s@singhania.com',
    checkInDate: '04 Oct 2026, 12:00 PM',
    checkOutDate: '06 Oct 2026, 11:00 AM',
    paymentStatus: 'Billed to Room',
    lineItems: [
      { id: 1, date: '04 Oct', category: 'Room Tariff', description: 'Premier Suite Night 1', amount: 11000 },
      { id: 2, date: '04 Oct', category: 'In-Room Dining', description: 'Organic Quinoa Salad & Cold Press Juice', amount: 620 },
      { id: 3, date: '05 Oct', category: 'Jayaasi Store', description: 'Artisan Silk Scarves (Set of 2)', amount: 2800 },
      { id: 4, date: '05 Oct', category: 'Cab Concierge', description: 'Airport Pickup Premium Sedan', amount: 850 }
    ],
    subtotal: 15270,
    cgst: 381.75,
    sgst: 381.75,
    grandTotal: 16033.5
  },
  {
    invoiceNumber: 'INV-302-5520',
    room: '302',
    suiteName: 'Executive King',
    guestName: 'Vikramaditya Oberoi',
    phone: '+91 99201 88321',
    email: 'v.oberoi@investments.in',
    checkInDate: '05 Oct 2026, 09:00 AM',
    checkOutDate: '07 Oct 2026, 01:00 PM',
    paymentStatus: 'Billed to Room',
    lineItems: [
      { id: 1, date: '05 Oct', category: 'Room Tariff', description: 'Executive King Early Check-in & Night 1', amount: 7500 },
      { id: 2, date: '05 Oct', category: 'In-Room Dining', description: 'Express Continental Breakfast & Latte', amount: 480 },
      { id: 3, date: '05 Oct', category: 'Laundry Care', description: 'Same-day Express Suit Pressing', amount: 520 }
    ],
    subtotal: 8500,
    cgst: 212.5,
    sgst: 212.5,
    grandTotal: 8925
  },
  {
    invoiceNumber: 'INV-303-6611',
    room: '303',
    suiteName: 'Deluxe Twin',
    guestName: 'Arunabh Sen',
    phone: '+91 98300 22319',
    email: 'arunabh.sen@techleads.co',
    checkInDate: '04 Oct 2026, 04:00 PM',
    checkOutDate: '06 Oct 2026, 11:00 AM',
    paymentStatus: 'Billed to Room',
    lineItems: [
      { id: 1, date: '04 Oct', category: 'Room Tariff', description: 'Deluxe Twin Room Night 1', amount: 5500 },
      { id: 2, date: '05 Oct', category: 'In-Room Dining', description: 'Midnight Snack Platter & Sodas', amount: 380 },
      { id: 3, date: '05 Oct', category: 'Cab Concierge', description: 'Koregaon Park Round Trip', amount: 260 }
    ],
    subtotal: 6140,
    cgst: 153.5,
    sgst: 153.5,
    grandTotal: 6447
  }
];

export const SUITE_ROOMS = [
  // 2nd Floor (Suites Wing)
  { number: '201', name: 'Deluxe King', floor: 'Floor 2', guest: 'Vacant', status: 'Cleaning', checkOut: '—', folio: '₹0', activeRequests: 0, hasInvoice: false },
  { number: '202', name: 'Deluxe Twin', floor: 'Floor 2', guest: 'Vacant', status: 'Available', checkOut: '—', folio: '₹0', activeRequests: 0, hasInvoice: false },
  { number: '203', name: 'Deluxe King', floor: 'Floor 2', guest: 'Maintenance Hold', status: 'Maintenance', checkOut: '—', folio: '₹0', activeRequests: 0, hasInvoice: false },
  { number: '204', name: 'Business Suite', floor: 'Floor 2', guest: 'Ananya Mehta', status: 'Occupied', checkOut: 'Today, 11:00 AM', folio: '₹12,495', activeRequests: 4, hasInvoice: true, isGuestAppActive: true },
  { number: '205', name: 'Executive Suite', floor: 'Floor 2', guest: 'Dr. Siddharth Rao', status: 'Occupied', checkOut: 'Tomorrow, 12:00 PM', folio: '₹9,796', activeRequests: 1, hasInvoice: true },
  { number: '206', name: 'Presidential Suite', floor: 'Floor 2', guest: 'Mr. Cyrus Poonawalla', status: 'Occupied', checkOut: '08 Oct, 11:00 AM', folio: '₹42,472', activeRequests: 1, hasInvoice: true },
  // 3rd Floor (Premier Wing)
  { number: '301', name: 'Premier Suite', floor: 'Floor 3', guest: 'Meera Singhania', status: 'Occupied', checkOut: '06 Oct, 11:00 AM', folio: '₹16,033', activeRequests: 1, hasInvoice: true },
  { number: '302', name: 'Executive King', floor: 'Floor 3', guest: 'Vikramaditya Oberoi', status: 'Occupied', checkOut: '07 Oct, 01:00 PM', folio: '₹8,925', activeRequests: 1, hasInvoice: true },
  { number: '303', name: 'Deluxe Twin', floor: 'Floor 3', guest: 'Arunabh Sen', status: 'Occupied', checkOut: 'Tomorrow, 11:00 AM', folio: '₹6,447', activeRequests: 0, hasInvoice: true },
  { number: '304', name: 'Deluxe Twin', floor: 'Floor 3', guest: 'Vacant', status: 'Cleaning', checkOut: '—', folio: '₹0', activeRequests: 0, hasInvoice: false },
  { number: '305', name: 'Executive Suite', floor: 'Floor 3', guest: 'Vacant', status: 'Available', checkOut: '—', folio: '₹0', activeRequests: 0, hasInvoice: false },
];

export const SERVICE_CATALOG = [
  { id: 'f-1', name: 'Vegetable Fried Rice', category: 'Food & Dining', price: 120, department: 'Kitchen', inStock: true },
  { id: 'f-2', name: 'Chef Special Paneer Tikka', category: 'Food & Dining', price: 280, department: 'Kitchen', inStock: true },
  { id: 'f-3', name: 'Fresh Mint Lime Soda', category: 'Food & Dining', price: 80, department: 'Bar', inStock: true },
  { id: 'f-4', name: 'Club Grilled Sandwich', category: 'Food & Dining', price: 240, department: 'Kitchen', inStock: true },
  { id: 'f-5', name: 'Single Origin Espresso Macchiato', category: 'Food & Dining', price: 160, department: 'Bar', inStock: true },
  { id: 'h-1', name: 'Extra Towels Replenishment', category: 'Housekeeping', price: 0, department: 'Housekeeping', inStock: true },
  { id: 'h-2', name: 'Packaged Mineral Water (1L)', category: 'Housekeeping', price: 0, department: 'Housekeeping', inStock: true },
  { id: 'h-3', name: 'Ayurvedic Bath & Spa Kit', category: 'Housekeeping', price: 0, department: 'Housekeeping', inStock: true },
  { id: 'l-1', name: 'Business Suit Dry Cleaning', category: 'Laundry Care', price: 350, department: 'Laundry', inStock: true },
  { id: 'l-2', name: 'Formal Cotton Shirt Pressing', category: 'Laundry Care', price: 120, department: 'Laundry', inStock: true },
  { id: 'c-1', name: 'Airport Private Transfer (Sedan)', category: 'Cab Services', price: 850, department: 'Concierge', inStock: true },
  { id: 'c-2', name: 'Premium Luxury SUV Chauffeur', category: 'Cab Services', price: 4500, department: 'Concierge', inStock: true },
  { id: 's-1', name: 'Artisan Silk Stole', category: 'Jayaasi Store', price: 950, department: 'Boutique Store', inStock: true },
  { id: 's-2', name: 'Heritage Brass Trinket Box', category: 'Jayaasi Store', price: 650, department: 'Boutique Store', inStock: true },
];
