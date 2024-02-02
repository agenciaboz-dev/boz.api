import { Time, Worker } from "@prisma/client"

declare interface UpdateProjectForm {
    name: string
    description?: string
    deadline?: string
    github?: string

    workers: (Worker & { times: Time[] })[]
}
