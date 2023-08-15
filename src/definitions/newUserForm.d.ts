declare interface NewUserForm {
    birth: string
    roles: Role[]
    cpf: string
    email: string
    name: string
    password: string
    phone: string
    username: string
    departmentId: number

    image?: ArrayBuffer
}
