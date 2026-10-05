import { getFolioByStay, addManualChargeToFolio, settleFolio } from '@/lib/db/folios';
import { getAllInvoices, getInvoiceByNumber, generateInvoiceFromFolio } from '@/lib/db/invoices';

export async function fetchStayFolio(stayId: string) {
  const folio = await getFolioByStay(stayId);
  if (!folio) return null;

  return {
    id: folio.id,
    folioNumber: folio.folioNumber,
    room: folio.stay.room.roomNumber,
    guest: `${folio.stay.guest.firstName} ${folio.stay.guest.lastName}`,
    status: folio.status,
    subtotal: Number(folio.subtotal),
    taxTotal: Number(folio.taxTotal),
    grandTotal: Number(folio.grandTotal),
    charges: folio.charges.map((c) => ({
      id: c.id,
      category: c.category,
      description: c.description,
      quantity: c.quantity,
      unitPrice: Number(c.unitPrice),
      total: Number(c.total),
      postedAt: c.postedAt.toISOString(),
    })),
  };
}

export async function postCharge(
  folioId: string,
  category: string,
  description: string,
  amount: number,
  quantity: number = 1
) {
  return addManualChargeToFolio(folioId, category, description, amount, quantity);
}

export async function closeFolio(folioId: string) {
  return settleFolio(folioId);
}

export async function fetchInvoices(hotelId: string) {
  return getAllInvoices(hotelId);
}

export async function fetchInvoiceDetails(invoiceNumber: string) {
  return getInvoiceByNumber(invoiceNumber);
}

export async function createInvoice(hotelId: string, stayId: string, folioId: string) {
  return generateInvoiceFromFolio(hotelId, stayId, folioId);
}
