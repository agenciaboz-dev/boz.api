import { Customer, Department, PrismaClient, QrCode, Role, Service, User } from "@prisma/client"
import { NewCustomerForm } from "./definitions/NewCustomerForm"
import { getIoInstance } from "./io/socket"
import { NewQrCodeForm } from "./definitions/NewQrCodeForm"

const prisma = new PrismaClient()

const inclusions = {
    user: { roles: true, department: true, qrcodes: { include: { user: true, customer: true } } },
    department: {},
    role: {},
    service: {},
    customer: { services: true, qrcodes: { include: { user: true, customer: true } } },
    logs: { user: true },
    qrcode: { user: true, customer: true },
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
                cpf: data.cpf.replace(/\D/g, ""),
                email: data.email,
                name: data.name,
                phone: data.phone.replace(/\D/g, ""),
                password: data.username.toLowerCase(),
                username: data.username.toLowerCase(),
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
                cpf: data.cpf.replace(/\D/g, ""),
                email: data.email,
                phone: data.phone.replace(/\D/g, ""),
                name: data.name,
                username: data.username,
                departmentId: data.departmentId,
                roles: { set: [], connect: roles.map((role) => ({ id: role.id })) },
            },
            include: inclusions.user,
        })
    },

    image: async (data: { id: number; filename: string }) =>
        await prisma.user.update({
            where: { id: data.id },
            data: {
                image: `https://app.agenciaboz.com.br:4105/static/users/${data.id}/images/${data.filename}`,
            },
            include: inclusions.user,
        }),

    delete: async (data: { id: number | string }) => await prisma.user.delete({ where: { id: Number(data.id) } }),
}

const department = {
    list: async () => await prisma.department.findMany({ include: inclusions.department }),
    new: async (department: NewServiceForm) => await prisma.department.create({ data: { name: department.name }, include: inclusions.department }),
    update: async (data: Department) =>
        await prisma.department.update({
            where: { id: data.id },
            data: { name: data.name },
            include: inclusions.department,
        }),
    delete: async (data: Department) =>
        await prisma.department.delete({
            where: { id: data.id },
        }),
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
    update: async (data: Customer & { services: Service[] }) =>
        await prisma.customer.update({
            data: {
                active: data.active,
                name: data.name,
                recomendations: data.recomendations,
                services: { set: [], connect: data.services.map((service) => ({ id: service.id })) },
            },
            where: { id: data.id },
            include: inclusions.customer,
        }),
    image: async (data: { id: number; filename: string }) =>
        await prisma.customer.update({
            where: { id: data.id },
            data: {
                image: `https://app.agenciaboz.com.br:4105/static/customers/${data.id}/images/${data.filename}`,
            },
            include: inclusions.customer,
        }),
    delete: async (data: Customer) =>
        await prisma.customer.delete({
            where: { id: data.id },
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
    update: async (data: Service) =>
        await prisma.service.update({
            where: { id: data.id },
            data: { name: data.name, tag: data.tag },
            include: inclusions.service,
        }),
    delete: async (data: Service) =>
        await prisma.service.delete({
            where: { id: data.id },
        }),
}

const log = {
    status: async (user: User, status: number) => {
        const io = getIoInstance()
        const log = await prisma.statusLog.create({ data: { userId: user.id, status }, include: inclusions.logs })
        io.emit("log:status:new", log)

        return log
    },

    list: {
        status: async () => await prisma.statusLog.findMany({ include: inclusions.logs }),
    },
}

const qrcode = {
    new: async (data: NewQrCodeForm) => {
        const io = getIoInstance()
        const qr = await prisma.qrCode.create({ data: { name: data.name, code: data.code, userId: data.user.id, customerId: data.customer.id } })
        const customer = await prisma.customer.findUnique({ where: { id: data.customer.id }, include: inclusions.customer })
        io.emit("customer:update", customer)
        return qr
    },
    update: async (data: QrCode & { user: User; customer: Customer }) => {
        const io = getIoInstance()
        const qr = await prisma.qrCode.update({
            where: { id: data.id },
            data: { name: data.name, code: data.code, userId: data.user.id, customerId: data.customer.id },
        })
        const customer = await prisma.customer.findUnique({ where: { id: data.customer.id }, include: inclusions.customer })
        io.emit("customer:update", customer)
        return qr
    },
    list: async () => await prisma.qrCode.findMany({ include: inclusions.qrcode }),
}

export default { user, department, role, service, customer, log, qrcode }
