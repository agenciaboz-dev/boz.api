import {
  ApiTester,
  PrismaClient,
  TesterRequest,
  TestarEvent,
} from "@prisma/client";

const prisma = new PrismaClient();

const inclusions = {
  user: {
    roles: true,
    department: true,
    qrcodes: { include: { user: true, customer: true } },
  },
  department: {},
  role: {},
  service: {},
  customer: {
    services: true,
    qrcodes: { include: { user: true, customer: true } },
  },
  logs: { user: true },
  qrcode: { user: true, customer: true },
  warning: { creator: true, confirmed: true },
  apiTester: { requests: true, events: true, creator: true },
};

const create = async (data: ApiTesterForm) =>
  await prisma.apiTester.create({
    data: {
      baseUrl: data.baseUrl,
      name: data.name,
      socket: data.socket,
      creatorId: data.userId,
      port: data.port,
    },
    include: inclusions.apiTester,
  });

const list = async () =>
  prisma.apiTester.findMany({ include: inclusions.apiTester });

const update = async (data: ApiTester) =>
  await prisma.apiTester.update({
    where: { id: data.id },
    data: {
      baseUrl: data.baseUrl,
      name: data.name,
      port: data.port,
      socket: data.socket,
      description: data.description,
    },
    include: inclusions.apiTester,
  });

const remove = async (data: ApiTester) =>
  await prisma.apiTester.delete({ where: { id: data.id } });

const find = async (id: number) =>
  await prisma.apiTester.findUnique({
    where: { id },
    include: inclusions.apiTester,
  });

const requests = {
  create: async (data: NewRequestForm) =>
    await prisma.testerRequest.create({
      data: {
        name: data.name,
        method: data.method,
        url: data.url,
        creatorId: data.userId,
        apiId: data.apiId,
        payload: "",
        response: "",
      },
    }),
  update: async (data: TesterRequest) =>
    await prisma.testerRequest.update({
      where: { id: data.id },
      data: {
        method: data.method,
        name: data.name,
        payload: data.payload,
        response: data.response,
        url: data.url,
      },
    }),
  delete: async (data: TesterRequest) =>
    await prisma.testerRequest.delete({ where: { id: data.id } }),
};

const events = {
  create: async (data: NewEventForm) =>
    await prisma.testarEvent.create({
      data: {
        name: data.name,
        payload: data.payload,
        event: data.event,

        creatorId: data.userId,
        apiId: data.apiId,
      },
    }),

  update: async (data: TestarEvent) =>
    await prisma.testarEvent.update({
      where: { id: data.id },
      data: {
        name: data.name,
        payload: data.payload,
        event: data.event,
      },
    }),
  delete: async (data: TestarEvent) =>
    await prisma.testarEvent.delete({ where: { id: data.id } }),
};

export default { create, list, update, remove, find, requests, events };
