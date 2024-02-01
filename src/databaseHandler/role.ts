import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const inclusions = {
  role: {},
};

const list = async () => await prisma.role.findMany({ include: inclusions.role })
  
const newRole = async (role: NewServiceForm) =>
  await prisma.role.create({
    data: { name: role.name, tag: role.tag },
    include: inclusions.role,
  });

export default { list, newRole };
