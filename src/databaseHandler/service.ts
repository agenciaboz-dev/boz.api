import { PrismaClient, Service } from "@prisma/client";

const prisma = new PrismaClient();

const inclusions = {
  service: {},
};

const list = async () =>
  await prisma.service.findMany({ include: inclusions.service });

const newService = async (data: NewServiceForm) =>
  await prisma.service.create({
    data: {
      name: data.name,
      tag: data.tag,
    },
    include: inclusions.service,
  });
const update = async (data: Service) =>
  await prisma.service.update({
    where: { id: data.id },
    data: { name: data.name, tag: data.tag },
    include: inclusions.service,
  });

const deleteService = async (data: Service) =>
  await prisma.service.delete({
    where: { id: data.id },
  });

export default { list, newService, update, deleteService };
