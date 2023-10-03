import { people_v1 } from "@googleapis/people"
import { OAuth2Client } from "google-auth-library"
import { Socket } from "socket.io"
import databaseHandler from "../databaseHandler"
import person from "./person"

const login = async (socket: Socket, accessToken: string) => {
    const googleUser = await person.getPerson(socket, accessToken)

    const user = await databaseHandler.user.google.login(googleUser)

    if (user) {
        socket.emit("google:login", user)
    } else {
        const user = await databaseHandler.user.google.firstLogin(googleUser)

        if (user) {
            socket.emit("google:login:first", { ...user, googleId: googleUser.googleId })
        } else {
            socket.emit("google:signup")
        }
    }
}

export default { login }