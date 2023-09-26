import axios from "axios"

const token = process.env.GITHUB_TOKEN

const api = axios.create({
    baseURL: "https://api.github.com",
    headers: {
        Authorization: `token ${token}`,
    },
})

const lastestRelease = async () => {
    const data = (await api.get("/repos/agenciaboz-dev/boz.electron/releases/latest")).data
    const version = data.name.replace("v", "")
    const downloadUrl = data.assets[0].browser_download_url

    return { latestVersion: version, downloadUrl }
}

export default { lastestRelease }
