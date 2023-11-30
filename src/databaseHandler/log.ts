import { PrismaClient, User } from "@prisma/client";
import { getIoInstance } from "../io/socket";

const prisma = new PrismaClient();

const inclusions = {
  logs: { user: true },
};
const status = async (user: User, status: number) => {
  const io = getIoInstance();
  const log = await prisma.statusLog.create({
    data: { userId: user.id, status },
    include: inclusions.logs,
  });
  io.emit("log:status:new", log);

  return log;
};

const list = {
  status: async () =>
    await prisma.statusLog.findMany({ include: inclusions.logs }),
  // status: async () => {
  //     const total = await prisma.statusLog.count()
  //     const count = Array.from({ length: Math.floor(total / 100) + 1 }, (_, i) => i)
  //     const batch = 100
  //     const list = await Promise.all(
  //         count.map(async (index) => await prisma.statusLog.findMany({ include: inclusions.logs, skip: index * batch, take: batch }))
  //     )
  //     return list.flat()
  // },
};

const getUser = async (user_id: number) =>
  await prisma.statusLog.findMany({
    where: { userId: user_id },
    include: inclusions.logs,
  });

export default { status, list, getUser };
