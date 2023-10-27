import { people_v1 } from "@googleapis/people"
import { Credentials, OAuth2Client } from "google-auth-library"
import { Socket } from "socket.io"
import databaseHandler from "../databaseHandler"
import person from "./person"
import { google } from "googleapis"
import { getGoogleClient } from "./client"

const login = async (socket: Socket, tokens: Credentials) => {
    if (tokens.access_token) {
        const googleUser = await person.getPerson(socket, tokens.access_token)

        let user = await databaseHandler.user.google.login(googleUser)
        if (tokens.refresh_token && user) {
            user = await databaseHandler.user.google.updateToken(user.id, tokens.refresh_token)
        }

        if (user) {
            socket.emit("google:login", { ...user, status: 1 })
        } else {
            const user = await databaseHandler.user.google.firstLogin(googleUser)

            if (user) {
                socket.emit("google:login:first", { ...user, status: 1, googleId: googleUser.googleId })
            } else {
                socket.emit("google:signup", googleUser)
            }
        }
    }
}

const exchangeCode = (socket: Socket, code: string) => {
    const oauth2Client = getGoogleClient()

    oauth2Client.getToken(code, (err, tokens) => {
        if (err) {
            console.log(err)
            return
        }

        if (tokens) {
            console.log(tokens)
            if (tokens.access_token) login(socket, tokens)
        }
    })
}

export default { login, exchangeCode }
