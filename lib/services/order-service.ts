import { createGuestOrder, getOrdersForStay, CreateOrderItemInput } from '@/lib/db/orders';

export async function submitCartAsOrder(
  hotelId: string,
  stayId: string,
  guestId: string,
  roomId: string,
  cartItems: {
    serviceId?: string;
    productId?: string;
    name: string;
    quantity: number;
    price: number;
  }[],
  specialInstructions?: string
) {
  const items: CreateOrderItemInput[] = cartItems.map((c) => ({
    serviceId: c.serviceId,
    productId: c.productId,
    name: c.name,
    quantity: c.quantity,
    unitPrice: c.price,
    taxRate: 5.0,
  }));

  return createGuestOrder(hotelId, stayId, guestId, roomId, items, specialInstructions);
}

export async function fetchStayOrders(stayId: string) {
  return getOrdersForStay(stayId);
}
