import { Customer, PrismaClient, Role } from "@prisma/client"
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

    find: {
        username: async (username: string) => await prisma.user.findFirst({ where: { username }, include: inclusions.user }),
    },

    new: async (data: NewUserForm) => {
        const birth = data.birth.split("/").reverse().join("/")
        const roles = data.roles

        return await prisma.user.create({
            data: {
                birth: new Date(birth),
                cpf: data.cpf,
                email: data.email,
                name: data.name,
                phone: data.phone,
                password: data.username,
                username: data.username,
                departmentId: data.departmentId,
                roles: { connect: roles.map((role) => ({ id: role.id })) },
            },
            include: inclusions.user,
        })
    },

    update: async (data: NewUserForm & { id: number }) => {
        const birth = data.birth.split("/").reverse().join("/")
        const roles = data.roles

        return await prisma.user.update({
            where: {
                id: data.id,
            },
            data: {
                birth: new Date(birth),
                cpf: data.cpf,
                email: data.email,
                phone: data.phone,
                name: data.name,
                username: data.username,
                departmentId: data.departmentId,
                roles: { set: [], connect: roles.map((role) => ({ id: role.id })) },
            },
            include: inclusions.user,
        })
    },

    delete: async (data: { id: number | string }) => await prisma.user.delete({ where: { id: Number(data.id) } }),
}

const department = {
    list: async () => await prisma.department.findMany({ include: inclusions.department }),
    new: async (department: NewServiceForm) => await prisma.department.create({ data: { name: department.name }, include: inclusions.department }),
}

const role = {
    list: async () => await prisma.role.findMany({ include: inclusions.role }),
    new: async (role: NewServiceForm) => await prisma.role.create({ data: { name: role.name, tag: role.tag }, include: inclusions.role }),
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
            include: inclusions.customer,
        }),
    toggleStatus: async (customer: Customer) =>
        await prisma.customer.update({
            data: { active: !customer.active },
            where: { id: customer.id },
            include: inclusions.customer,
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
