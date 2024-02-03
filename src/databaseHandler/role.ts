import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const inclusions = {
  role: {},
};

const list = async () => await prisma.role.findMany({ include: inclusions.role })
  
const create = async (role: UserRoleForm) =>
    await prisma.role.create({
        data: { name: role.name, tag: role.tag, project_roles: role.project_roles },
        include: inclusions.role,
    })

const update = async (role: UserRoleForm, id: number) =>
    await prisma.role.update({
        where: { id },
        data: {
            name: role.name,
            project_roles: role.project_roles,
            tag: role.tag,
        },
    })

const remove = async (id: number) => await prisma.role.delete({ where: { id } })

export default { list, create, update, remove }
