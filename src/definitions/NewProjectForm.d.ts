declare interface NewProjectForm {
    name: string
    description?: string
    deadline?: string
    github?: string

    workers: NewWorkerForm[]
}

declare interface NewWorkerForm {
    user_id: number
    role: string
    admin?: boolean
}
