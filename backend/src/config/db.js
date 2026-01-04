import prismaPkg from "../../generated/prisma/index.js";
const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();

export default prisma;