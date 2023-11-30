import { Department, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const inclusions = {
  department: {},
};

const list = async () =>
  await prisma.department.findMany({ include: inclusions.department });

const newDepartment = async (department: NewServiceForm) =>
  await prisma.department.create({
    data: { name: department.name },
    include: inclusions.department,
  });

const update = async (data: Department) =>
  await prisma.department.update({
    where: { id: data.id },
    data: { name: data.name },
    include: inclusions.department,
  });
const deleteDepartment = async (data: Department) =>
  await prisma.department.delete({
    where: { id: data.id },
  });

export default { list, newDepartment, update, deleteDepartment };
