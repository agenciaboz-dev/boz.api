declare interface ApiTesterForm {
    name: string
    userId: number
    socket: boolean
    baseUrl: string
    port: string
}

declare interface NewRequestForm {
    name: string
    url: string
    method: HTTPMethod
    userId: number
    apiId: number
}

declare type HTTPMethod = "GET" | "POST"