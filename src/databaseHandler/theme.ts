// import { PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient()

// const include = { user: true }

// const create = async (data: NewTheme) =>
//     await prisma.theme.create({
//         data: {
//             userId: data.userId,
//             name: data.name,
//             primary: data.primary,
//             secondary: data.secondary,
//             terciary: data.terciary,
//             success: data.success,
//             warning: data.warning,
//             background_primary: data.background.primary,
//             background_secondary: data.background.secondary,
//             text_primary: data.text.primary,
//             text_secondary: data.text.secondary,
//             text_terciary: data.text.terciary,
//             timestamp: new Date().getTime().toString()
//         },
//         include
//     })
// const list = async () => await prisma.theme.findMany({ include })
// const activate = async (id: number) => prisma.theme.update({ where: { id }, data: { active: true }, include })
// const deactivate = async () => prisma.theme.updateMany({ data: { active: false } })
// const update = async (id: number, data: NewTheme) =>
//     await prisma.theme.update({
//         where: { id },
//         data: {
//             name: data.name,
//             primary: data.primary,
//             secondary: data.secondary,
//             terciary: data.terciary,
//             success: data.success,
//             warning: data.warning,
//             background_primary: data.background.primary,
//             background_secondary: data.background.secondary,
//             text_primary: data.text.primary,
//             text_secondary: data.text.secondary,
//             text_terciary: data.text.terciary
//         },
//         include
//     })

// export default { create, list, activate, deactivate, update }
