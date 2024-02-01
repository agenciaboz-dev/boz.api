import { PrismaClient, User } from "@prisma/client";
import project from "./project"

const prisma = new PrismaClient();

export const inclusions = {
    user: {
        roles: true,
        department: true,
        qrcodes: { include: { user: true, customer: true } },
        working_projects: { include: { project: { include: project.include }, times: true } },
    },
}

const login = async (data: { login: string; password: string }) =>
  await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.login },
        { username: data.login },
        { cpf: data.login },
      ],
      AND: { password: data.password },
    },
    include: inclusions.user,
  });

const list = async () => await prisma.user.findMany({ include: inclusions.user })

const find = {
  username: async (username: string) =>
    await prisma.user.findFirst({
      where: { username },
      include: inclusions.user,
    }),
};

const newUser = async (data: NewUserForm) => {
  const birth = data.birth.split("/").reverse().join("/");
  const roles = data.roles;

  return await prisma.user.create({
    data: {
      birth: new Date(birth),
      cpf: data.cpf.replace(/\D/g, ""),
      email: data.email,
      name: data.name,
      phone: data.phone.replace(/\D/g, ""),
      password: data.username.toLowerCase(),
      username: data.username.toLowerCase(),
      departmentId: data.departmentId,
      roles: { connect: roles.map((role) => ({ id: role.id })) },
      googleId: data.googleId,
    },
    include: inclusions.user,
  });
};

const update = async (data: NewUserForm & { id: number }) => {
  const birth = data.birth.split("/").reverse().join("/");
  const roles = data.roles;

  return await prisma.user.update({
    where: {
      id: data.id,
    },
    data: {
      birth: new Date(birth),
      cpf: data.cpf.replace(/\D/g, ""),
      email: data.email,
      phone: data.phone.replace(/\D/g, ""),
      name: data.name,
      username: data.username,
      departmentId: data.departmentId,
      roles: { set: [], connect: roles.map((role) => ({ id: role.id })) },
    },
    include: inclusions.user,
  });
};

const image = async (data: { id: number; filename: string }) =>
  await prisma.user.update({
    where: { id: data.id },
    data: {
      image: `https://app.agencyboz.com:4105/static/users/${data.id}/images/${data.filename}`,
    },
    include: inclusions.user,
  });

const deleteUser = async (data: { id: number | string }) =>
  await prisma.user.delete({ where: { id: Number(data.id) } });

const google = {
  firstLogin: async (googleUser: People) =>
    await prisma.user.findFirst({
      where: { email: { in: googleUser.emails } },
      include: inclusions.user,
    }),
  login: async (googleUser: People) =>
    await prisma.user.findFirst({
      where: { googleId: googleUser.googleId },
      include: inclusions.user,
    }),
  link: async (user: User) =>
    await prisma.user.update({
      where: { id: user.id },
      data: { googleId: user.googleId },
    }),
  updateToken: async (id: number, token: string) =>
    await prisma.user.update({
      where: { id },
      data: { googleToken: token },
      include: inclusions.user,
    }),
};

export default {
  login,
  list,
  find,
  newUser,
  update,
  image,
  deleteUser,
  google,
};
