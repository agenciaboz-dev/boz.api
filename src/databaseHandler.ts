import { ApiTester, Customer, Department, PrismaClient, QrCode, Role, Service, TestarEvent, TesterRequest, User, Warning } from "@prisma/client"
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
    warning: { creator: true, confirmed: true },
    apiTester: { requests: true, events: true, creator: true },
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
                googleId: data.googleId,
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
                image: `https://app.agencyboz.com:4105/static/users/${data.id}/images/${data.filename}`,
            },
            include: inclusions.user,
        }),

    delete: async (data: { id: number | string }) => await prisma.user.delete({ where: { id: Number(data.id) } }),

    google: {
        firstLogin: async (googleUser: People) =>
            await prisma.user.findFirst({ where: { email: { in: googleUser.emails } }, include: inclusions.user }),
        login: async (googleUser: People) => await prisma.user.findFirst({ where: { googleId: googleUser.googleId }, include: inclusions.user }),
        link: async (user: User) => await prisma.user.update({ where: { id: user.id }, data: { googleId: user.googleId } }),
        updateToken: async (id: number, token: string) =>
            await prisma.user.update({ where: { id }, data: { googleToken: token }, include: inclusions.user }),
    },
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
                image: `https://app.agencyboz.com:4105/static/customers/${data.id}/images/${data.filename}`,
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
        // status: async () => {
        //     const total = await prisma.statusLog.count()
        //     const count = Array.from({ length: Math.floor(total / 100) + 1 }, (_, i) => i)
        //     const batch = 100
        //     const list = await Promise.all(
        //         count.map(async (index) => await prisma.statusLog.findMany({ include: inclusions.logs, skip: index * batch, take: batch }))
        //     )
        //     return list.flat()
        // },
    },
}

const qrcode = {
    new: async (data: NewQrCodeForm) => {
        const io = getIoInstance()
        const qr = await prisma.qrCode.create({
            data: { name: data.name, code: data.code, userId: data.user.id, customerId: data.customer.id },
        })
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

    delete: async (qrcode: QrCode) => await prisma.qrCode.delete({ where: { id: qrcode.id } }),
}

const warning = {
    create: async (data: NewWarningForm) =>
        prisma.warning.create({
            data: {
                title: data.title,
                text: data.text,
                date: new Date().getTime().toString(),
                creatorId: data.creatorId,
                confirmed: { connect: { id: data.creatorId } },
            },
            include: inclusions.warning,
        }),

    list: async () => prisma.warning.findMany({ include: inclusions.warning }),

    confirm: async (userId: number, warning: Warning & { confirmed: User[] }) =>
        await prisma.warning.update({
            where: { id: warning.id },
            data: { confirmed: { set: [], connect: [...warning.confirmed.map((user) => ({ id: user.id })), { id: userId }] } },
            include: inclusions.warning,
        }),
}

const apiTester = {
    create: async (data: ApiTesterForm) =>
        await prisma.apiTester.create({
            data: { baseUrl: data.baseUrl, name: data.name, socket: data.socket, creatorId: data.userId, port: data.port },
            include: inclusions.apiTester,
        }),

    list: async () => prisma.apiTester.findMany({ include: inclusions.apiTester }),

    update: async (data: ApiTester) =>
        await prisma.apiTester.update({
            where: { id: data.id },
            data: {
                baseUrl: data.baseUrl,
                name: data.name,
                port: data.port,
                socket: data.socket,
                description: data.description,
            },
            include: inclusions.apiTester,
        }),

    remove: async (data: ApiTester) => await prisma.apiTester.delete({ where: { id: data.id } }),

    find: async (id: number) => await prisma.apiTester.findUnique({ where: { id }, include: inclusions.apiTester }),

    requests: {
        create: async (data: NewRequestForm) =>
            await prisma.testerRequest.create({
                data: {
                    name: data.name,
                    method: data.method,
                    url: data.url,
                    creatorId: data.userId,
                    apiId: data.apiId,
                    payload: "",
                    response: "",
                },
            }),
        update: async (data: TesterRequest) =>
            await prisma.testerRequest.update({
                where: { id: data.id },
                data: {
                    method: data.method,
                    name: data.name,
                    payload: data.payload,
                    response: data.response,
                    url: data.url,
                },
            }),
        delete: async (data: TesterRequest) => await prisma.testerRequest.delete({ where: { id: data.id } }),
    },

    events: {
        create: async (data: NewEventForm) =>
            await prisma.testarEvent.create({
                data: {
                    name: data.name,
                    payload: data.payload,
                    event: data.event,

                    creatorId: data.userId,
                    apiId: data.apiId,
                },
            }),

        update: async (data: TestarEvent) =>
            await prisma.testarEvent.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    payload: data.payload,
                    event: data.event,
                },
            }),
        delete: async (data: TestarEvent) => await prisma.testarEvent.delete({ where: { id: data.id } }),
    },
}

export default { user, department, role, service, customer, log, qrcode, warning, apiTester }
