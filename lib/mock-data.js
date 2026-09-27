// ─── Jayaasi Room — Mock Data Store ────────────────────────────────
// This file serves as the single source of truth during development.
// Every interface (guest, staff, admin) reads from these exports.
// When Prisma + PostgreSQL are added, these become database queries.

// ─── Hotel ─────────────────────────────────────────────────────────
export const hotel = {
  id: 'hotel_001',
  name: 'Jayaasi Rooms',
  slug: 'jayaasi-rooms',
  type: 'Business Suite',
  address: 'Koregaon Park, Pune, Maharashtra',
  city: 'Pune',
  phone: '+91 20 4000 2100',
  email: 'hello@jayaasi.in',
  website: 'https://jayaasi.in',
  checkIn: '14:00',
  checkOut: '11:00',
  wifiName: 'Jayaasi_Guest',
  wifiPassword: 'suite204',
  smokingPolicy: 'Non-smoking property',
  emergencyPhone: '112',
  receptionExt: '0',
  lostFoundExt: '105',
  maintenanceExt: '106',
  settings: {
    qrAccess: true,
    phoneVerification: true,
    whatsappUpdates: false,
    feedbackPrompt: true,
  },
};

// ─── Rooms ─────────────────────────────────────────────────────────
export const rooms = [
  { id: 'rm_101', number: '101', type: 'Deluxe King', floor: 1, capacity: 2, bedType: 'King', size: '320 sq ft', status: 'Occupied', guest: 'Mira Patel', amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Bar', 'Safe'], qrActive: true },
  { id: 'rm_102', number: '102', type: 'Deluxe King', floor: 1, capacity: 2, bedType: 'King', size: '320 sq ft', status: 'Available', guest: null, amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Bar'], qrActive: true },
  { id: 'rm_103', number: '103', type: 'Deluxe Twin', floor: 1, capacity: 2, bedType: 'Twin', size: '310 sq ft', status: 'Cleaning', guest: null, amenities: ['Wi-Fi', 'AC', 'TV'], qrActive: true },
  { id: 'rm_104', number: '104', type: 'Business Suite', floor: 1, capacity: 3, bedType: 'King', size: '480 sq ft', status: 'Occupied', guest: 'Rahul Shah', amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Bar', 'Safe', 'Work Desk', 'Lounge'], qrActive: true },
  { id: 'rm_201', number: '201', type: 'Deluxe King', floor: 2, capacity: 2, bedType: 'King', size: '320 sq ft', status: 'Occupied', guest: 'David Thomas', amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Bar', 'Safe'], qrActive: true },
  { id: 'rm_202', number: '202', type: 'Deluxe King', floor: 2, capacity: 2, bedType: 'King', size: '320 sq ft', status: 'Available', guest: null, amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Bar'], qrActive: true },
  { id: 'rm_203', number: '203', type: 'Business Suite', floor: 2, capacity: 3, bedType: 'King', size: '480 sq ft', status: 'Occupied', guest: 'Aarav Singh', amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Bar', 'Safe', 'Work Desk', 'Lounge'], qrActive: true },
  { id: 'rm_204', number: '204', type: 'Business Suite', floor: 2, capacity: 3, bedType: 'King', size: '480 sq ft', status: 'Occupied', guest: 'Ananya Mehta', amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Bar', 'Safe', 'Work Desk', 'Lounge'], qrActive: true },
  { id: 'rm_205', number: '205', type: 'Deluxe Twin', floor: 2, capacity: 2, bedType: 'Twin', size: '310 sq ft', status: 'Maintenance', guest: null, amenities: ['Wi-Fi', 'AC', 'TV'], qrActive: false },
  { id: 'rm_301', number: '301', type: 'Executive Suite', floor: 3, capacity: 4, bedType: 'King', size: '650 sq ft', status: 'Occupied', guest: 'Priya Nair', amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Bar', 'Safe', 'Work Desk', 'Lounge', 'Bathtub', 'Balcony'], qrActive: true },
  { id: 'rm_302', number: '302', type: 'Deluxe King', floor: 3, capacity: 2, bedType: 'King', size: '320 sq ft', status: 'Occupied', guest: 'Kabir Rao', amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Bar', 'Safe'], qrActive: true },
  { id: 'rm_303', number: '303', type: 'Deluxe Twin', floor: 3, capacity: 2, bedType: 'Twin', size: '310 sq ft', status: 'Available', guest: null, amenities: ['Wi-Fi', 'AC', 'TV'], qrActive: true },
];

// ─── Services ──────────────────────────────────────────────────────
export const services = [
  { id: 'svc_food', name: 'Food & Room Service', icon: '🍽', description: 'In-room dining from your hotel menu.', department: 'Kitchen', hours: '7:00 AM – 11:00 PM', active: true, category: 'Food & Dining' },
  { id: 'svc_housekeeping', name: 'Housekeeping', icon: '🧹', description: 'Cleaning, towels and room essentials.', department: 'Housekeeping', hours: '8:00 AM – 9:00 PM', active: true, category: 'Housekeeping',
    subServices: [
      { name: 'Room Cleaning', price: 0 },
      { name: 'Bed Making', price: 0 },
      { name: 'Bathroom Cleaning', price: 0 },
      { name: 'Towel Replacement', price: 0 },
      { name: 'Toiletries', price: 0 },
      { name: 'Drinking Water', price: 0 },
      { name: 'Garbage Removal', price: 0 },
      { name: 'On-request Cleaning', price: 0 },
    ],
  },
  { id: 'svc_laundry', name: 'Laundry Services', icon: '🧺', description: 'Washing, ironing and dry cleaning.', department: 'Laundry', hours: '8:00 AM – 8:00 PM', active: true, category: 'Laundry' },
  { id: 'svc_maintenance', name: 'Maintenance', icon: '🔧', description: 'Report an issue in your room.', department: 'Maintenance', hours: 'Available 24 hours', active: true, category: 'Maintenance' },
  { id: 'svc_amenities', name: 'Amenities', icon: '🛎', description: 'Extra bed, cot, toiletries and more.', department: 'Housekeeping', hours: '8:00 AM – 10:00 PM', active: true, category: 'Amenities',
    subServices: [
      { name: 'Extra Bed', price: 500 },
      { name: 'Baby Cot', price: 0 },
      { name: 'Toiletries', price: 0 },
      { name: 'Water', price: 0 },
      { name: 'Shoe Care', price: 100 },
      { name: 'Other Amenities', price: 0 },
    ],
  },
  { id: 'svc_travel', name: 'Travel & Cab', icon: '🚕', description: 'Book a cab or airport transfer.', department: 'Reception', hours: 'Available 24 hours', active: true, category: 'Travel' },
  { id: 'svc_luggage', name: 'Luggage Handling', icon: '🧳', description: 'Help with bags and room transfers.', department: 'Reception', hours: 'Available 24 hours', active: true, category: 'Other' },
  { id: 'svc_store', name: 'Jayaasi Store', icon: '🛍', description: 'Curated gifts and travel essentials.', department: 'Reception', hours: '10:00 AM – 9:00 PM', active: true, category: 'Other' },
  { id: 'svc_shoecare', name: 'Shoe Care', icon: '👞', description: 'Shoe cleaning and polishing.', department: 'Housekeeping', hours: '9:00 AM – 7:00 PM', active: false, category: 'Other' },
];

// ─── Menu ──────────────────────────────────────────────────────────
export const menuCategories = ['Starters', 'Mains', 'Beverages', 'Desserts', 'Snacks'];

export const menuItems = [
  { id: 'mi_001', name: 'Paneer Tikka', category: 'Starters', price: 320, emoji: '🍢', available: true, veg: true, description: 'Grilled cottage cheese with bell peppers and onions' },
  { id: 'mi_002', name: 'Chicken Seekh Kebab', category: 'Starters', price: 380, emoji: '🍖', available: true, veg: false, description: 'Minced chicken seekh grilled on skewers' },
  { id: 'mi_003', name: 'Butter Chicken', category: 'Mains', price: 480, emoji: '🍛', available: true, veg: false, description: 'Tandoori chicken in rich tomato butter gravy' },
  { id: 'mi_004', name: 'Dal Khichdi', category: 'Mains', price: 280, emoji: '🥣', available: true, veg: true, description: 'Comfort food with rice, lentils and ghee' },
  { id: 'mi_005', name: 'Paneer Butter Masala', category: 'Mains', price: 420, emoji: '🧀', available: true, veg: true, description: 'Creamy paneer in spiced tomato gravy' },
  { id: 'mi_006', name: 'Biryani', category: 'Mains', price: 520, emoji: '🍚', available: true, veg: false, description: 'Fragrant basmati rice with tender chicken' },
  { id: 'mi_007', name: 'Masala Chai', category: 'Beverages', price: 90, emoji: '☕', available: true, veg: true, description: 'Traditional Indian spiced tea' },
  { id: 'mi_008', name: 'Fresh Lime Soda', category: 'Beverages', price: 140, emoji: '🥤', available: false, veg: true, description: 'Sweet or salted fresh lime soda' },
  { id: 'mi_009', name: 'Cold Coffee', category: 'Beverages', price: 180, emoji: '🧋', available: true, veg: true, description: 'Creamy iced coffee with chocolate' },
  { id: 'mi_010', name: 'Chocolate Brownie', category: 'Desserts', price: 220, emoji: '🍰', available: true, veg: true, description: 'Warm chocolate brownie with ice cream' },
  { id: 'mi_011', name: 'Gulab Jamun', category: 'Desserts', price: 160, emoji: '🍩', available: true, veg: true, description: 'Soft milk dumplings in rose sugar syrup' },
  { id: 'mi_012', name: 'Club Sandwich', category: 'Snacks', price: 350, emoji: '🥪', available: true, veg: false, description: 'Triple decker with chicken, egg and veggies' },
  { id: 'mi_013', name: 'French Fries', category: 'Snacks', price: 180, emoji: '🍟', available: true, veg: true, description: 'Crispy golden fries with dipping sauce' },
  { id: 'mi_014', name: 'Naan Basket', category: 'Mains', price: 120, emoji: '🫓', available: true, veg: true, description: 'Butter, garlic, and plain naan' },
];

// ─── Requests ──────────────────────────────────────────────────────
export const requests = [
  { id: 'JR-2048', roomId: 'rm_204', room: '204', guest: 'Ananya Mehta', service: 'Fresh Towels', detail: '2 bath towels', department: 'Housekeeping', time: '2 min ago', status: 'New', icon: '🧹', priority: 'Normal', createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
  { id: 'JR-2047', roomId: 'rm_104', room: '108', guest: 'Rahul Shah', service: 'Butter Chicken & Naan', detail: '₹ 680 · 2 items', department: 'Kitchen', time: '8 min ago', status: 'In Progress', icon: '🍽', priority: 'Normal', createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
  { id: 'JR-2046', roomId: 'rm_302', room: '302', guest: 'Priya Nair', service: 'Laundry Pickup', detail: '3 garments', department: 'Laundry', time: '14 min ago', status: 'New', icon: '🧺', priority: 'Normal', createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString() },
  { id: 'JR-2045', roomId: 'rm_201', room: '201', guest: 'David Thomas', service: 'AC Not Cooling', detail: 'Maintenance request', department: 'Maintenance', time: '21 min ago', status: 'In Progress', icon: '🔧', priority: 'High', createdAt: new Date(Date.now() - 21 * 60 * 1000).toISOString() },
  { id: 'JR-2044', roomId: 'rm_101', room: '105', guest: 'Mira Patel', service: 'Room Cleaning', detail: 'On-request cleaning', department: 'Housekeeping', time: '35 min ago', status: 'Completed', icon: '🧹', priority: 'Normal', createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString() },
  { id: 'JR-2043', roomId: 'rm_203', room: '207', guest: 'Kabir Rao', service: 'Extra Drinking Water', detail: '2 bottles', department: 'Housekeeping', time: '42 min ago', status: 'Completed', icon: '🧹', priority: 'Normal', createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString() },
  { id: 'JR-2042', roomId: 'rm_301', room: '301', guest: 'Priya Nair', service: 'Room Service - Dinner', detail: '₹ 1,240 · 4 items', department: 'Kitchen', time: '1h ago', status: 'Completed', icon: '🍽', priority: 'Normal', createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
  { id: 'JR-2041', roomId: 'rm_104', room: '104', guest: 'Rahul Shah', service: 'Extra Pillows', detail: '2 soft pillows', department: 'Housekeeping', time: '2h ago', status: 'Completed', icon: '🛏', priority: 'Low', createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString() },
];

// ─── Orders (food) ─────────────────────────────────────────────────
export const orders = [
  {
    id: 'ORD-1001', roomId: 'rm_104', room: '108', guest: 'Rahul Shah',
    items: [
      { menuItemId: 'mi_003', name: 'Butter Chicken', qty: 1, price: 480 },
      { menuItemId: 'mi_014', name: 'Naan Basket', qty: 1, price: 120 },
    ],
    total: 600, status: 'Preparing', time: '8 min ago',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-1002', roomId: 'rm_301', room: '301', guest: 'Priya Nair',
    items: [
      { menuItemId: 'mi_006', name: 'Biryani', qty: 2, price: 1040 },
      { menuItemId: 'mi_009', name: 'Cold Coffee', qty: 2, price: 360 },
    ],
    total: 1400, status: 'Delivered', time: '1h ago',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-1003', roomId: 'rm_204', room: '204', guest: 'Ananya Mehta',
    items: [
      { menuItemId: 'mi_007', name: 'Masala Chai', qty: 2, price: 180 },
    ],
    total: 180, status: 'New', time: '3 min ago',
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
];

// ─── Staff ─────────────────────────────────────────────────────────
export const staff = [
  { id: 'usr_001', initials: 'AK', name: 'Arjun Kumar', role: 'Hotel Admin', title: 'Hotel Administrator', department: 'All departments', email: 'arjun@jayaasi.in', active: true },
  { id: 'usr_002', initials: 'SP', name: 'Sneha Patil', role: 'Manager', title: 'Front Desk Manager', department: 'Reception', email: 'sneha@jayaasi.in', active: true },
  { id: 'usr_003', initials: 'RV', name: 'Rohan Verma', role: 'Department Staff', title: 'Housekeeping Lead', department: 'Housekeeping', email: 'rohan@jayaasi.in', active: true },
  { id: 'usr_004', initials: 'ND', name: 'Neha Desai', role: 'Department Staff', title: 'Kitchen Manager', department: 'Kitchen', email: 'neha@jayaasi.in', active: true },
  { id: 'usr_005', initials: 'MK', name: 'Mohit Kulkarni', role: 'Department Staff', title: 'Maintenance Technician', department: 'Maintenance', email: 'mohit@jayaasi.in', active: true },
];

// ─── Nearby Places ─────────────────────────────────────────────────
export const nearbyPlaces = [
  { id: 'np_001', name: 'Pune International Airport', icon: '✈️', category: 'Airport', distance: '30 min', address: 'Lohegaon, Pune' },
  { id: 'np_002', name: 'Ruby Hall Clinic', icon: '🏥', category: 'Hospital', distance: '12 min', address: 'Sassoon Road, Pune' },
  { id: 'np_003', name: 'Phoenix Marketcity', icon: '🛍', category: 'Shopping', distance: '18 min', address: 'Nagar Road, Viman Nagar' },
  { id: 'np_004', name: 'Pune Junction', icon: '🚉', category: 'Train Station', distance: '16 min', address: 'Station Road, Pune' },
  { id: 'np_005', name: 'Koregaon Park', icon: '🍽', category: 'Dining', distance: '10 min', address: 'North Main Road' },
  { id: 'np_006', name: 'Aga Khan Palace', icon: '🏛', category: 'Attraction', distance: '15 min', address: 'Nagar Road, Kalyani Nagar' },
  { id: 'np_007', name: 'Shaniwar Wada', icon: '🏰', category: 'Attraction', distance: '20 min', address: 'Shaniwar Peth' },
];

// ─── Cab Providers ─────────────────────────────────────────────────
export const cabProviders = [
  { id: 'cab_uber', name: 'Uber', logo: 'U', color: '#000', enabled: true, description: 'Ride link · hotel pickup prefilled' },
  { id: 'cab_ola', name: 'Ola', logo: 'O', color: '#559231', enabled: true, description: 'Affiliate link · pickup and drop prefilled' },
];

// ─── Analytics (mock weekly data) ──────────────────────────────────
export const analytics = {
  weeklyRequests: [
    { day: 'Mon', thisWeek: 22, lastWeek: 17 },
    { day: 'Tue', thisWeek: 31, lastWeek: 22 },
    { day: 'Wed', thisWeek: 26, lastWeek: 25 },
    { day: 'Thu', thisWeek: 39, lastWeek: 28 },
    { day: 'Fri', thisWeek: 34, lastWeek: 24 },
    { day: 'Sat', thisWeek: 44, lastWeek: 31 },
    { day: 'Sun', thisWeek: 37, lastWeek: 29 },
  ],
  topServices: [
    { name: 'Food & Room Service', percentage: 42, icon: '🍽' },
    { name: 'Housekeeping', percentage: 28, icon: '🧹' },
    { name: 'Laundry', percentage: 16, icon: '🧺' },
    { name: 'Maintenance', percentage: 9, icon: '🔧' },
    { name: 'Other', percentage: 5, icon: '📦' },
  ],
  occupancy: 82,
  avgResponse: '6 min',
  completionRate: 94,
  guestRating: 4.8,
  totalReviews: 36,
  todayOrders: 24,
};

// ─── Notifications ─────────────────────────────────────────────────
export const notifications = [
  { id: 'n_001', title: 'New request from Room 204', body: 'Ananya Mehta requested fresh towels', time: '2 min ago', read: false, type: 'request' },
  { id: 'n_002', title: 'Order received from Room 204', body: 'Masala Chai × 2 — ₹ 180', time: '3 min ago', read: false, type: 'order' },
  { id: 'n_003', title: 'Laundry pickup needed', body: 'Room 302 — 3 garments', time: '14 min ago', read: false, type: 'request' },
  { id: 'n_004', title: 'Maintenance assigned', body: 'AC repair — Room 201 assigned to Mohit', time: '21 min ago', read: true, type: 'maintenance' },
  { id: 'n_005', title: 'Order delivered', body: 'ORD-1002 delivered to Room 301', time: '1h ago', read: true, type: 'order' },
];
