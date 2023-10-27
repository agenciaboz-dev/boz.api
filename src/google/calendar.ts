import { calendar_v3 } from "@googleapis/calendar"
import { OAuth2Client } from "google-auth-library"
import { Socket } from "socket.io"
import { getGoogleClient } from "./client"

const getCalendar = async (socket: Socket, refresh_token: string) => {
    const oauth2Client = getGoogleClient()
    oauth2Client.setCredentials({
        refresh_token: refresh_token,
    })

    oauth2Client.refreshAccessToken(async (err, credentials) => {
        if (credentials) {
            const calendar = new calendar_v3.Calendar({ auth: oauth2Client })

            const response = await calendar.events.list({
                calendarId: "primary",
            })
            console.log(response.data)
            socket.emit("google:calendar", response.data)
        }
    })
}

export default { getCalendar }