import { PrismaClient, User, Warning } from "@prisma/client"
import { prisma } from "../prisma"

const inclusions = {
    warning: { creator: true, customer: true, departments: true, confirmed: true },
}

const create = async (data: NewWarningForm) =>
    prisma.warning.create({
        data: {
            title: data.title,
            text: data.text,
            date: new Date().getTime().toString(),
            creatorId: data.creatorId,
            confirmed: { connect: { id: data.creatorId } },
            customerId: data.customerId || undefined,
        },
        include: inclusions.warning,
    })

const list = async () => prisma.warning.findMany({ include: inclusions.warning })

const confirm = async (userId: number, warning: Warning & { confirmed: User[] }) =>
    await prisma.warning.update({
        where: { id: warning.id },
        data: {
            confirmed: {
                set: [],
                connect: [...warning.confirmed.map((user) => ({ id: user.id })), { id: userId }],
            },
        },
        include: inclusions.warning,
    })

export default { create, list, confirm }
