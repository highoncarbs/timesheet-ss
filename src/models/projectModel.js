
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProject = async (data) => {
  return prisma.project.create({
    data,
  });
};

const getProjects = async () => {
  return prisma.project.findMany();
};

module.exports = {
  createProject,
  getProjects,
};
