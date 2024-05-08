import { Time, Worker } from "@prisma/client"

declare interface UpdateProjectForm {
    name: string
    description?: string
    deadline?: string
    customer_id: number

    workers: (Worker & { times: Time[] })[]
    links: LinkForm[]
}
