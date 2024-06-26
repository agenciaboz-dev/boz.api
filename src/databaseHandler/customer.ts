import { Customer, PrismaClient, Service } from "@prisma/client";
import { NewCustomerForm } from "../types/NewCustomerForm"
import { include as project_inclusions } from "./project"
import { prisma } from "../prisma"

const inclusions = {
    customer: {
        services: true,
        qrcodes: { include: { user: true, customer: true } },
        projects: { include: project_inclusions },
    },
}

const list = async () =>
  await prisma.customer.findMany({ include: inclusions.customer });

const newCustomer = async (data: NewCustomerForm) =>
  await prisma.customer.create({
    data: {
      name: data.name,
      recomendations: data.recomendations,
      active: true,
      services: {
        connect: data.services.map((service) => ({ id: service.id })),
      },
    },
    include: inclusions.customer,
  });

const update = async (data: Customer & { services: Service[] }) =>
  await prisma.customer.update({
    data: {
      active: data.active,
      name: data.name,
      recomendations: data.recomendations,
      services: {
        set: [],
        connect: data.services.map((service) => ({ id: service.id })),
      },
    },
    where: { id: data.id },
    include: inclusions.customer,
  });

const image = async (data: { id: number; filename: string }) =>
  await prisma.customer.update({
    where: { id: data.id },
    data: {
      image: `https://app.agencyboz.com:4105/static/customers/${data.id}/images/${data.filename}`,
    },
    include: inclusions.customer,
  });

const deleteCustomer = async (data: Customer) =>
  await prisma.customer.delete({
    where: { id: data.id },
  });

const toggleStatus = async (customer: Customer) =>
  await prisma.customer.update({
    data: { active: !customer.active },
    where: { id: customer.id },
    include: inclusions.customer,
  });

const find = async (id: number) => await prisma.customer.findUnique({ where: { id }, include: inclusions.customer })

export default {
    list,
    newCustomer,
    update,
    image,
    deleteCustomer,
    toggleStatus,
    find,
}
