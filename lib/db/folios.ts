import prisma from '@/lib/prisma';
import { FolioStatus } from '@prisma/client';

export async function getFolioByStay(stayId: string) {
  return prisma.folio.findUnique({
    where: { stayId },
    include: {
      stay: {
        include: {
          guest: true,
          room: true,
        },
      },
      charges: {
        orderBy: { postedAt: 'asc' },
      },
      invoices: true,
      payments: true,
    },
  });
}

export async function addManualChargeToFolio(
  folioId: string,
  category: string,
  description: string,
  amount: number,
  quantity: number = 1
) {
  const subtotal = amount * quantity;
  const tax = Math.round((subtotal * 0.05) * 100) / 100;
  const total = subtotal + tax;

  return prisma.$transaction(async (tx) => {
    const charge = await tx.folioCharge.create({
      data: {
        folioId,
        category,
        description,
        quantity,
        unitPrice: amount,
        subtotal,
        tax,
        total,
      },
    });

    await tx.folio.update({
      where: { id: folioId },
      data: {
        subtotal: { increment: subtotal },
        taxTotal: { increment: tax },
        grandTotal: { increment: total },
      },
    });

    return charge;
  });
}

export async function settleFolio(folioId: string) {
  return prisma.folio.update({
    where: { id: folioId },
    data: {
      status: FolioStatus.SETTLED,
      settledAt: new Date(),
    },
  });
}
