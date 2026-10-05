import prisma from '@/lib/prisma';
import { Department } from '@prisma/client';

export async function getServiceCategories(hotelId: string) {
  return prisma.serviceCategory.findMany({
    where: { hotelId, active: true },
    orderBy: { displayOrder: 'asc' },
    include: {
      services: {
        where: { active: true },
        include: { foodDetails: true },
        orderBy: { displayOrder: 'asc' },
      },
    },
  });
}

export async function getServicesByDepartment(hotelId: string, department: Department) {
  return prisma.service.findMany({
    where: {
      hotelId,
      department,
      active: true,
    },
    include: {
      foodDetails: true,
      category: true,
    },
    orderBy: { displayOrder: 'asc' },
  });
}

export async function toggleServiceAvailability(serviceId: string, available: boolean) {
  return prisma.service.update({
    where: { id: serviceId },
    data: { available },
  });
}

export async function getStoreProducts(hotelId: string) {
  return prisma.product.findMany({
    where: { hotelId, available: true },
    orderBy: { name: 'asc' },
  });
}
