import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"
import cors from "cors"
import { router } from "./routes"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import https from "https"
import http from "http"
import fs from "fs"
import { Server } from "socket.io"
import { handleSocket } from "./src/io/socket"

dotenv.config()

const app:Express = express()
const port = process.env.PORT

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use("/api", router)

try {
    const server = https.createServer({
        key: fs.readFileSync("/etc/letsencrypt/live/app.agenciaboz.com.br/privkey.pem", "utf8"),
        cert: fs.readFileSync("/etc/letsencrypt/live/app.agenciaboz.com.br/cert.pem", "utf8"),
        ca: fs.readFileSync("/etc/letsencrypt/live/app.agenciaboz.com.br/chain.pem", "utf8"),
    }, app);

    const io = new Server(server, { cors: { origin: "*" } })
    io.on("connection", (socket) => {
        handleSocket(socket)
    })
    
    server.listen(port, () => {
        console.log(`[server]: Server is running at https://${port}`)
    })
} catch {
    const server = http.createServer(app)
    const io = new Server(server, { cors: { origin: "*" } })
    io.on("connection", (socket) => {
        handleSocket(socket)
    })

    server.listen(port, () => {
        console.log(`[server]: Server is running at http://${port}`)
    })
}
