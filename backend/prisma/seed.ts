import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hospital.com' },
    update: {},
    create: {
      email: 'admin@hospital.com',
      password: adminPassword,
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Administrator',
    },
  });

  // Create sample doctors
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  
  const doctor1 = await prisma.user.create({
    data: {
      email: 'dr.smith@hospital.com',
      password: doctorPassword,
      role: 'DOCTOR',
      firstName: 'John',
      lastName: 'Smith',
      doctor: {
        create: {
          specialization: 'Cardiology',
          licenseNumber: 'DOC001',
          availability: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '17:00' },
            saturday: { start: '09:00', end: '13:00' },
            sunday: null
          }
        }
      }
    }
  });

  const doctor2 = await prisma.user.create({
    data: {
      email: 'dr.johnson@hospital.com',
      password: doctorPassword,
      role: 'DOCTOR',
      firstName: 'Emily',
      lastName: 'Johnson',
      doctor: {
        create: {
          specialization: 'Pediatrics',
          licenseNumber: 'DOC002',
          availability: {
            monday: { start: '08:00', end: '16:00' },
            tuesday: { start: '08:00', end: '16:00' },
            wednesday: { start: '08:00', end: '16:00' },
            thursday: { start: '08:00', end: '16:00' },
            friday: { start: '08:00', end: '16:00' },
            saturday: null,
            sunday: null
          }
        }
      }
    }
  });

  // Create sample patients
  const patientPassword = await bcrypt.hash('patient123', 10);
  
  const patient1 = await prisma.user.create({
    data: {
      email: 'patient1@example.com',
      password: patientPassword,
      role: 'PATIENT',
      firstName: 'Michael',
      lastName: 'Brown',
      patient: {
        create: {
          dateOfBirth: new Date('1985-06-15'),
          gender: 'MALE',
          phone: '+1234567890',
          address: '123 Main St, City, State 12345',
          emergencyContact: {
            name: 'Sarah Brown',
            relationship: 'Spouse',
            phone: '+1234567891'
          },
          medicalHistory: {
            allergies: ['Penicillin'],
            conditions: ['Hypertension'],
            medications: ['Lisinopril 10mg']
          }
        }
      }
    }
  });

  const patient2 = await prisma.user.create({
    data: {
      email: 'patient2@example.com',
      password: patientPassword,
      role: 'PATIENT',
      firstName: 'Lisa',
      lastName: 'Wilson',
      patient: {
        create: {
          dateOfBirth: new Date('1992-03-22'),
          gender: 'FEMALE',
          phone: '+1234567892',
          address: '456 Oak Ave, City, State 12345',
          emergencyContact: {
            name: 'David Wilson',
            relationship: 'Father',
            phone: '+1234567893'
          },
          medicalHistory: {
            allergies: [],
            conditions: [],
            medications: []
          }
        }
      }
    }
  });

  console.log('Seed completed successfully!');
  console.log(`Created admin: ${admin.email}`);
  console.log(`Created doctors: ${doctor1.email}, ${doctor2.email}`);
  console.log(`Created patients: ${patient1.email}, ${patient2.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });