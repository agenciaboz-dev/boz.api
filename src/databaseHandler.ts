import { PrismaClient, Role } from "@prisma/client"
import { NewCustomerForm } from "./definitions/NewCustomerForm"

const prisma = new PrismaClient()

const inclusions = {
    user: { roles: true, department: true },
    department: {},
    role: {},
    service: {},
    customer: { services: true },
}

const user = {
    login: async (data: { login: string; password: string }) =>
        await prisma.user.findFirst({
            where: {
                OR: [{ email: data.login }, { username: data.login }, { cpf: data.login }],
                AND: { password: data.password },
            },
            include: inclusions.user,
        }),

    list: async () => await prisma.user.findMany({ include: inclusions.user }),

    new: async (data: NewUserForm) => {
        const splittedBirth = data.birth.split("/")
        const roles = data.roles

        return await prisma.user.create({
            data: {
                birth: new Date(`${splittedBirth[1]}/${splittedBirth[0]}/${splittedBirth[2]}`),
                cpf: data.cpf,
                email: data.email,
                name: data.name,
                password: data.username,
                username: data.username,
                departmentId: data.departmentId,
                roles: { connect: roles.map((role) => ({ id: role.id })) },
            },
            include: inclusions.user,
        })
    },

    delete: async (data: { id: number | string }) => await prisma.user.delete({ where: { id: Number(data.id) } }),
}

const department = {
    list: async () => await prisma.department.findMany({ include: inclusions.department }),
}

const role = {
    list: async () => await prisma.role.findMany({ include: inclusions.role }),
}

const customer = {
    list: async () => await prisma.customer.findMany({ include: inclusions.customer }),
    new: async (data: NewCustomerForm) =>
        await prisma.customer.create({
            data: {
                name: data.name,
                recomendations: data.recomendations,
                active: true,
                services: { connect: data.services.map((service) => ({ id: service.id })) },
            },
        }),
}

const service = {
    list: async () => await prisma.service.findMany({ include: inclusions.service }),
    new: async (data: NewServiceForm) =>
        await prisma.service.create({
            data: {
                name: data.name,
                tag: data.tag,
            },
            include: inclusions.service,
        }),
}

export default { user, department, role, service, customer }
