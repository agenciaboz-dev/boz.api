import { Customer, PrismaClient, QrCode, User } from "@prisma/client";
import { getIoInstance } from "../io/socket";
import { NewQrCodeForm } from "../types/NewQrCodeForm"
import { prisma } from "../prisma"


const inclusions = {
  qrcode: { user: true, customer: true },
  customer: { qrcodes: { include: { user: true, customer: true } } },
};

const newQr = async (data: NewQrCodeForm) => {
  const io = getIoInstance();
  const qr = await prisma.qrCode.create({
    data: {
      name: data.name,
      code: data.code,
      userId: data.user.id,
      customerId: data.customer.id,
    },
  });
  const customer = await prisma.customer.findUnique({
    where: { id: data.customer.id },
    include: inclusions.customer,
  });
  io.emit("customer:update", customer);
  return qr;
};

const update = async (data: QrCode & { user: User; customer: Customer }) => {
  const io = getIoInstance();
  const qr = await prisma.qrCode.update({
    where: { id: data.id },
    data: {
      name: data.name,
      code: data.code,
      userId: data.user.id,
      customerId: data.customer.id,
    },
  });
  const customer = await prisma.customer.findUnique({
    where: { id: data.customer.id },
    include: inclusions.customer,
  });
  io.emit("customer:update", customer);
  return qr;
};

const list = async () =>
  await prisma.qrCode.findMany({ include: inclusions.qrcode });

const deleteQr = async (qrcode: QrCode) =>
  await prisma.qrCode.delete({ where: { id: qrcode.id } });

export default { newQr, update, list, deleteQr };
