import { PrismaClient, Time } from "@prisma/client"
import { UpdateProjectForm } from "../definitions/UpdateProjectForm"

const prisma = new PrismaClient()

const list = async () => await prisma.project.findMany({ include })
const worker_include = { times: true, user: true }
const include = { times: true, workers: { include: worker_include } }

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

const play = async (worker_id: number) => {
    const worker = await prisma.worker.findUnique({ where: { id: worker_id }, include: { times: true } })

    return await prisma.worker.update({
        where: {
            id: worker_id,
        },
        data: {
            times: {
                set: [],
                create: [
                    ...worker!.times.map((time) => ({ started: time.started, ended: time.ended, worked: time.worked })),
                    {
                        started: new Date().getTime().toString(),
                    },
                ],
            },
        },
        include: worker_include,
    })
}

const stop = async (time: Time) =>
    await prisma.time.update({
        where: { id: time.id },
        data: {
            ended: new Date().getTime().toString(),
            worked: (new Date().getTime() - Number(time.started)).toString(),
        },
        include: { worker: true },
    })

const find = async (id: number) => await prisma.project.findUnique({ where: { id }, include })

const findWorkerProject = async (id: number) => await prisma.project.findFirst({ where: { workers: { some: { id } } }, include })

const update = async (data: UpdateProjectForm, id: number) =>
    await prisma.project.update({
        where: { id },
        data: {
            deadline: data.deadline,
            description: data.description,
            github: data.github,
            name: data.name,
            workers: {
                deleteMany: { project_id: id },
                create: data.workers.map((worker) => ({
                    joined_date: worker.joined_date,
                    role: worker.role,
                    user_id: worker.user_id,
                    admin: worker.admin,
                    times: {
                        create: worker.times.map((time) => ({
                            started: time.started,
                            ended: time.ended,
                            worked: time.worked,
                        })),
                    },
                })),
            },
        },
        include,
    })

export default { include, create, list, remove, play, find, stop, findWorkerProject, update }
