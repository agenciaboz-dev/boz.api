import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()


const list = async () => await prisma.project.findMany({ include })
const include = { times: true, workers: { include: { times: true, user: true } } }

const create = async (data: NewProjectForm) =>
    await prisma.project.create({
        data: {
            name: data.name,
            description: data.description,
            deadline: data.deadline,
            github: data.github,

            times: {
                create: {
                    started: new Date().getTime().toString(),
                },
            },
            workers: {
                create: data.workers.map((worker) => ({
                    admin: worker.admin,
                    joined_date: new Date().getTime().toString(),
                    role: worker.role,
                    user: { connect: { id: worker.user_id } },
                })),
            },
        },
        include,
    })

const remove = async (id: number) => await prisma.project.delete({ where: { id } })

export default { include, create, list, remove }
