import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const username = 'admin';
const password = 'adminpassword';

(async () => {
  const exist = await prisma.user.findUnique({ where: { username } });
  if (!exist) {
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        username,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@uoft.com',
        password: hashed,
        phoneNum: '0987654321',
        role: 'ADMIN',
      },
    });
    console.log('✔ admin / adminpassword created');
  } else {
    console.log('ℹ admin user already exists');
  }
  await prisma.$disconnect();
})();
