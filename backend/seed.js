const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding with RBAC test users...')

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hospital.com' },
    update: {},
    create: {
      firstName: 'Hospital',
      lastName: 'Admin',
      email: 'admin@hospital.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Created ADMIN user: admin@hospital.com / password123')

  // Create multiple doctor users for testing
  const doctorUser1 = await prisma.user.upsert({
    where: { email: 'doctor@hospital.com' },
    update: {},
    create: {
      firstName: 'Dr. John',
      lastName: 'Smith',
      email: 'doctor@hospital.com',
      password: hashedPassword,
      role: 'DOCTOR',
    },
  })

  const doctorUser2 = await prisma.user.upsert({
    where: { email: 'doctor2@hospital.com' },
    update: {},
    create: {
      firstName: 'Dr. Emily',
      lastName: 'Johnson',
      email: 'doctor2@hospital.com',
      password: hashedPassword,
      role: 'DOCTOR',
    },
  })
  console.log('✅ Created DOCTOR users: doctor@hospital.com & doctor2@hospital.com / password123')

  // Create doctor profiles
  const doctor1 = await prisma.doctor.upsert({
    where: { userId: doctorUser1.id },
    update: {},
    create: {
      userId: doctorUser1.id,
      specialization: 'Cardiology',
      licenseNumber: 'MD12345',
      availability: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' }
      },
    },
  })

  const doctor2 = await prisma.doctor.upsert({
    where: { userId: doctorUser2.id },
    update: {},
    create: {
      userId: doctorUser2.id,
      specialization: 'Pediatrics',
      licenseNumber: 'MD67890',
      availability: {
        monday: { start: '08:00', end: '16:00' },
        tuesday: { start: '08:00', end: '16:00' },
        wednesday: { start: '08:00', end: '16:00' },
        thursday: { start: '08:00', end: '16:00' },
        friday: { start: '08:00', end: '16:00' }
      },
    },
  })

  // Create multiple patient users for testing RBAC
  const patientUser1 = await prisma.user.upsert({
    where: { email: 'patient@hospital.com' },
    update: {},
    create: {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'patient@hospital.com',
      password: hashedPassword,
      role: 'PATIENT',
    },
  })

  const patientUser2 = await prisma.user.upsert({
    where: { email: 'patient2@hospital.com' },
    update: {},
    create: {
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'patient2@hospital.com',
      password: hashedPassword,
      role: 'PATIENT',
    },
  })

  const patientUser3 = await prisma.user.upsert({
    where: { email: 'patient3@hospital.com' },
    update: {},
    create: {
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'patient3@hospital.com',
      password: hashedPassword,
      role: 'PATIENT',
    },
  })
  console.log('✅ Created PATIENT users: patient@hospital.com, patient2@hospital.com, patient3@hospital.com / password123')

  // Create patient profiles
  const patient1 = await prisma.patient.upsert({
    where: { userId: patientUser1.id },
    update: {},
    create: {
      userId: patientUser1.id,
      dateOfBirth: new Date('1990-05-15'),
      gender: 'FEMALE',
      phone: '+1234567890',
      address: '123 Main St, City, State 12345',
      emergencyContact: {
        name: 'John Doe',
        phone: '+1234567891',
        relationship: 'Husband'
      },
      medicalHistory: {
        allergies: ['Penicillin'],
        conditions: ['Hypertension'],
        medications: ['Lisinopril 10mg']
      },
    },
  })

  const patient2 = await prisma.patient.upsert({
    where: { userId: patientUser2.id },
    update: {},
    create: {
      userId: patientUser2.id,
      dateOfBirth: new Date('1985-12-20'),
      gender: 'MALE',
      phone: '+1234567892',
      address: '456 Oak Ave, City, State 12345',
      emergencyContact: {
        name: 'Lisa Johnson',
        phone: '+1234567893',
        relationship: 'Wife'
      },
      medicalHistory: {
        allergies: [],
        conditions: ['Diabetes Type 2'],
        medications: ['Metformin 500mg']
      },
    },
  })

  const patient3 = await prisma.patient.upsert({
    where: { userId: patientUser3.id },
    update: {},
    create: {
      userId: patientUser3.id,
      dateOfBirth: new Date('1995-03-10'),
      gender: 'FEMALE',
      phone: '+1234567894',
      address: '789 Pine Rd, City, State 12345',
      emergencyContact: {
        name: 'David Williams',
        phone: '+1234567895',
        relationship: 'Brother'
      },
      medicalHistory: {
        allergies: ['Shellfish', 'Pollen'],
        conditions: [],
        medications: []
      },
    },
  })

  // Create comprehensive billing records for RBAC testing
  const billing1 = await prisma.billing.create({
    data: {
      patientId: patient1.id,
      amount: 250.00,
      description: 'Routine checkup and consultation with Dr. Smith',
      status: 'PAID',
      issueDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15'),
    },
  })

  const billing2 = await prisma.billing.create({
    data: {
      patientId: patient2.id,
      amount: 450.00,
      description: 'Blood work and comprehensive lab tests',
      status: 'PENDING',
      issueDate: new Date('2024-01-20'),
      dueDate: new Date('2024-02-20'),
    },
  })

  const billing3 = await prisma.billing.create({
    data: {
      patientId: patient1.id,
      amount: 75.00,
      description: 'Prescription refill - Lisinopril',
      status: 'OVERDUE',
      issueDate: new Date('2023-12-10'),
      dueDate: new Date('2024-01-10'),
    },
  })

  const billing4 = await prisma.billing.create({
    data: {
      patientId: patient3.id,
      amount: 180.00,
      description: 'Allergy testing and consultation',
      status: 'PENDING',
      issueDate: new Date('2024-01-25'),
      dueDate: new Date('2024-02-25'),
    },
  })

  const billing5 = await prisma.billing.create({
    data: {
      patientId: patient2.id,
      amount: 320.00,
      description: 'Diabetes monitoring and HbA1c test',
      status: 'PAID',
      issueDate: new Date('2024-01-10'),
      dueDate: new Date('2024-02-10'),
    },
  })

  console.log('')
  console.log('🔐 RBAC TEST USERS CREATED:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('� ADMIN (Full System Access):')
  console.log('   📧 admin@hospital.com / password123')
  console.log('   ✅ Can: manage all users, view all data, delete records')
  console.log('')
  console.log('� DOCTORS (Patient Management Access):')
  console.log('   📧 doctor@hospital.com / password123 (Cardiologist)')
  console.log('   📧 doctor2@hospital.com / password123 (Pediatrician)')
  console.log('   ✅ Can: view all patients, manage appointments, create billing')
  console.log('   ❌ Cannot: delete users, access admin functions')
  console.log('')
  console.log('🟢 PATIENTS (Own Data Only):')
  console.log('   📧 patient@hospital.com / password123 (Jane Doe)')
  console.log('   📧 patient2@hospital.com / password123 (Michael Johnson)')
  console.log('   📧 patient3@hospital.com / password123 (Sarah Williams)')
  console.log('   ✅ Can: view own data, appointments, billing')
  console.log('   ❌ Cannot: access other patients data, admin functions')
  console.log('')
  console.log('📊 SAMPLE DATA FOR TESTING:')
  console.log(`   • ${doctor1.specialization} doctor: Dr. ${doctorUser1.firstName} ${doctorUser1.lastName}`)
  console.log(`   • ${doctor2.specialization} doctor: Dr. ${doctorUser2.firstName} ${doctorUser2.lastName}`)
  console.log(`   • 3 patients with different medical histories`)
  console.log(`   • 5 billing records with mixed statuses (PAID/PENDING/OVERDUE)`)
  console.log('')
  console.log('🧪 RBAC TESTING SCENARIOS:')
  console.log('1. Login as patient@hospital.com → Should only see own data')
  console.log('2. Login as doctor@hospital.com → Should see all patients but no admin functions')
  console.log('3. Login as admin@hospital.com → Should have full system access')
  console.log('4. Try cross-patient data access → Should be blocked')
  console.log('5. Test audit logs → Check /var/log/audit or console for HIPAA trails')
  console.log('')
  console.log('✅ Database seeding completed with comprehensive RBAC test data!')

}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })