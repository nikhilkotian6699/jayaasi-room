import prisma from '@/lib/prisma';

export async function getGuestById(guestId: string) {
  return prisma.guest.findUnique({
    where: { id: guestId },
    include: {
      stays: {
        orderBy: { checkInAt: 'desc' },
        take: 5,
      },
    },
  });
}

export async function findOrCreateGuestByPhone(phone: string, firstName: string, lastName: string, email?: string) {
  const existing = await prisma.guest.findFirst({
    where: { phone },
  });

  if (existing) {
    return existing;
  }

  return prisma.guest.create({
    data: {
      firstName,
      lastName,
      phone,
      email,
    },
  });
}
