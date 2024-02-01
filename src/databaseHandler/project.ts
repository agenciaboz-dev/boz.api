import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const include = { times: true, workers: { include: { times: true } } }

const list = async () => await prisma.project.findMany({ include })

const create = async (data: NewProjectForm) =>
    await prisma.project.create({
        data: {
            ...data,

            times: {
                create: {
                    started: new Date().getTime().toString(),
                },
            },
            workers: {
                create: data.workers.map((worker) => ({
                    ...worker,
                    joined_date: new Date().getTime().toString(),
                    role: "",
                })),
            },
        },
        include,
    })

export default { include, create, list }
