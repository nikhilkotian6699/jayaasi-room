import prisma from '@/lib/prisma';

export async function getAllInvoices(hotelId: string) {
  return prisma.invoice.findMany({
    where: { hotelId },
    include: {
      stay: {
        include: {
          guest: true,
          room: true,
        },
      },
      folio: {
        include: {
          charges: true,
        },
      },
    },
    orderBy: { invoiceDate: 'desc' },
  });
}

export async function getInvoiceByNumber(invoiceNumber: string) {
  return prisma.invoice.findUnique({
    where: { invoiceNumber },
    include: {
      hotel: true,
      stay: {
        include: {
          guest: true,
          room: {
            include: {
              roomType: true,
            },
          },
        },
      },
      folio: {
        include: {
          charges: {
            orderBy: { postedAt: 'asc' },
          },
        },
      },
      payments: true,
    },
  });
}

export async function generateInvoiceFromFolio(
  hotelId: string,
  stayId: string,
  folioId: string
) {
  const folio = await prisma.folio.findUnique({
    where: { id: folioId },
  });

  if (!folio) {
    throw new Error('Folio not found');
  }

  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
  const subtotal = Number(folio.subtotal);
  const cgst = Math.round((subtotal * 0.025) * 100) / 100;
  const sgst = Math.round((subtotal * 0.025) * 100) / 100;
  const grandTotal = subtotal + cgst + sgst;

  return prisma.invoice.create({
    data: {
      hotelId,
      stayId,
      folioId,
      invoiceNumber,
      subtotal,
      cgst,
      sgst,
      grandTotal,
      status: 'ISSUED',
    },
  });
}
