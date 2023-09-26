import axios from "axios"

const token = "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"

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
