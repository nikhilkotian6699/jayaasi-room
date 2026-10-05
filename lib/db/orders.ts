import prisma from '@/lib/prisma';
import { OrderStatus, Department } from '@prisma/client';

export interface CreateOrderItemInput {
  serviceId?: string;
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export async function createGuestOrder(
  hotelId: string,
  stayId: string,
  guestId: string,
  roomId: string,
  items: CreateOrderItemInput[],
  notes?: string
) {
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

  let subtotal = 0;
  let taxTotal = 0;

  const orderItemsData = items.map((item) => {
    const rate = item.taxRate !== undefined ? item.taxRate : 5.0;
    const itemSub = item.unitPrice * item.quantity;
    const itemTax = Math.round((itemSub * (rate / 100)) * 100) / 100;
    subtotal += itemSub;
    taxTotal += itemTax;

    return {
      serviceId: item.serviceId,
      productId: item.productId,
      nameSnapshot: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: rate,
      taxAmount: itemTax,
      lineTotal: itemSub + itemTax,
    };
  });

  const grandTotal = subtotal + taxTotal;

  return prisma.$transaction(async (tx) => {
    // 1. Create the Order
    const order = await tx.order.create({
      data: {
        hotelId,
        stayId,
        guestId,
        roomId,
        orderNumber,
        status: OrderStatus.CONFIRMED,
        subtotal,
        taxTotal,
        grandTotal,
        notes,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    // 2. Automatically dispatch corresponding Service Request for staff
    const reqNumber = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    await tx.serviceRequest.create({
      data: {
        hotelId,
        stayId,
        roomId,
        guestId,
        orderId: order.id,
        requestNumber: reqNumber,
        department: Department.KITCHEN,
        status: 'NEW',
        notes: notes || `Order ${orderNumber} placed from Suite`,
      },
    });

    // 3. Post charge directly to stay folio
    const folio = await tx.folio.findUnique({
      where: { stayId },
    });

    if (folio) {
      await tx.folioCharge.create({
        data: {
          folioId: folio.id,
          orderId: order.id,
          category: 'In-Room Dining / Services',
          description: items.map((i) => `${i.quantity}x ${i.name}`).join(', '),
          quantity: 1,
          unitPrice: subtotal,
          subtotal,
          tax: taxTotal,
          total: grandTotal,
        },
      });

      // Update folio totals
      await tx.folio.update({
        where: { id: folio.id },
        data: {
          subtotal: { increment: subtotal },
          taxTotal: { increment: taxTotal },
          grandTotal: { increment: grandTotal },
        },
      });
    }

    return order;
  });
}

export async function getOrdersForStay(stayId: string) {
  return prisma.order.findMany({
    where: { stayId },
    include: {
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
