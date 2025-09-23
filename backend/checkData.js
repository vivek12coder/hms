import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    const users = await prisma.user.findMany();
    const patients = await prisma.patient.findMany({
      include: {
        user: true
      }
    });
    
    console.log('Users in database:', users.length);
    console.log('Patients in database:', patients.length);
    
    if (users.length > 0) {
      console.log('Sample user:', users[0]);
    }
    
    if (patients.length > 0) {
      console.log('Sample patient:', patients[0]);
    }
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();