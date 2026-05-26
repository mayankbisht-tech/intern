import { prisma } from '../backend/src/lib/prisma.js'
import bcrypt from 'bcryptjs'
import { pathToFileURL } from 'url'

const LOGO_URL = 'https://via.placeholder.com/200?text=College+Logo'
const BANNER_URL =
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80'

interface CollegeData {
  slug: string
  name: string
  location: string
  city: string
  state: string
  fees: number
  rating: number
  shortDescription: string
  overview: string
  placementPercent: number
  averagePackage: number
  courses: { name: string; degree: string; duration: string; fees: number }[]
  placements: { avgPackage: number; highestPackage: number; placementRate: number; year: number }[]
}

const ADMIN_EMAIL = 'admin@academialink.com'
const ADMIN_PASSWORD = 'AdminPassword123'

async function ensureAdminAccount() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
  if (existing) return existing

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  return prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      name: 'AcademiaLink Admin',
      passwordHash,
      role: 'ADMIN',
    },
  })
}

const collegesToSeed: CollegeData[] = [
  {
    slug: 'iit-delhi',
    name: 'Indian Institute of Technology Delhi',
    location: 'Hauz Khas, New Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    fees: 245000,
    rating: 4.9,
    shortDescription: 'Prestigious engineering institute with world-class research.',
    overview:
      'A top-ranked engineering institute with a strong research ecosystem, excellent recruiters, and global recognition.',
    placementPercent: 98,
    averagePackage: 2140000,
    courses: [
      { name: 'B.Tech Computer Science & Engineering', degree: 'B.Tech', duration: '4 Years', fees: 245000 },
      { name: 'B.Tech Electrical Engineering', degree: 'B.Tech', duration: '4 Years', fees: 240000 },
      { name: 'M.Tech Artificial Intelligence', degree: 'M.Tech', duration: '2 Years', fees: 195000 },
      { name: 'B.Tech Mechanical Engineering', degree: 'B.Tech', duration: '4 Years', fees: 235000 },
    ],
    placements: [
      { avgPackage: 2140000, highestPackage: 4800000, placementRate: 98, year: 2024 },
      { avgPackage: 2010000, highestPackage: 4500000, placementRate: 97, year: 2023 },
      { avgPackage: 1850000, highestPackage: 4200000, placementRate: 96, year: 2022 },
    ],
  },
  {
    slug: 'iit-bombay',
    name: 'Indian Institute of Technology Bombay',
    location: 'Powai, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    fees: 240000,
    rating: 4.9,
    shortDescription: 'Elite institute with exceptional placements.',
    overview: 'Known for a strong tech scene, beautiful campus, and exceptional outcomes across branches.',
    placementPercent: 98,
    averagePackage: 2380000,
    courses: [
      { name: 'B.Tech Computer Science & Engineering', degree: 'B.Tech', duration: '4 Years', fees: 240000 },
      { name: 'B.Tech Mechanical Engineering', degree: 'B.Tech', duration: '4 Years', fees: 225000 },
      { name: 'M.Tech Data Science', degree: 'M.Tech', duration: '2 Years', fees: 198000 },
      { name: 'B.Tech Civil Engineering', degree: 'B.Tech', duration: '4 Years', fees: 220000 },
    ],
    placements: [
      { avgPackage: 2380000, highestPackage: 5200000, placementRate: 98, year: 2024 },
      { avgPackage: 2250000, highestPackage: 5000000, placementRate: 97, year: 2023 },
      { avgPackage: 2100000, highestPackage: 4800000, placementRate: 96, year: 2022 },
    ],
  },
  {
    slug: 'nit-trichy',
    name: 'National Institute of Technology Trichy',
    location: 'Tiruchirappalli, Tamil Nadu',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    fees: 180000,
    rating: 4.7,
    shortDescription: 'Well-balanced public institute with strong placements.',
    overview: 'A well-regarded national institute with strong placements and good affordability.',
    placementPercent: 94,
    averagePackage: 1560000,
    courses: [
      { name: 'B.Tech Computer Science', degree: 'B.Tech', duration: '4 Years', fees: 180000 },
      { name: 'B.Tech Electronics and Communication', degree: 'B.Tech', duration: '4 Years', fees: 175000 },
      { name: 'M.Tech Structural Engineering', degree: 'M.Tech', duration: '2 Years', fees: 160000 },
      { name: 'B.Tech Electrical Engineering', degree: 'B.Tech', duration: '4 Years', fees: 172000 },
    ],
    placements: [
      { avgPackage: 1560000, highestPackage: 3200000, placementRate: 94, year: 2024 },
      { avgPackage: 1480000, highestPackage: 3000000, placementRate: 93, year: 2023 },
      { avgPackage: 1420000, highestPackage: 2900000, placementRate: 92, year: 2022 },
    ],
  },
  {
    slug: 'bits-pilani',
    name: 'BITS Pilani',
    location: 'Pilani, Rajasthan',
    city: 'Pilani',
    state: 'Rajasthan',
    fees: 380000,
    rating: 4.8,
    shortDescription: 'Renowned private institute with innovation-focused curriculum.',
    overview: 'Top private engineering institute known for its emphasis on problem-solving and entrepreneurship.',
    placementPercent: 97,
    averagePackage: 1980000,
    courses: [
      { name: 'B.E Computer Science', degree: 'B.E', duration: '4 Years', fees: 380000 },
      { name: 'B.E Mechanical Engineering', degree: 'B.E', duration: '4 Years', fees: 370000 },
      { name: 'M.Tech Information Systems', degree: 'M.Tech', duration: '2 Years', fees: 320000 },
      { name: 'B.E Electrical and Electronics', degree: 'B.E', duration: '4 Years', fees: 365000 },
    ],
    placements: [
      { avgPackage: 1980000, highestPackage: 4000000, placementRate: 97, year: 2024 },
      { avgPackage: 1890000, highestPackage: 3800000, placementRate: 96, year: 2023 },
      { avgPackage: 1810000, highestPackage: 3600000, placementRate: 95, year: 2022 },
    ],
  },
  {
    slug: 'vit-vellore',
    name: 'VIT Vellore',
    location: 'Vellore, Tamil Nadu',
    city: 'Vellore',
    state: 'Tamil Nadu',
    fees: 280000,
    rating: 4.6,
    shortDescription: 'Industry-focused institution with strong internship opportunities.',
    overview: 'Known for industry partnerships, research facilities, and practical learning approach.',
    placementPercent: 93,
    averagePackage: 1420000,
    courses: [
      { name: 'B.Tech Computer Science', degree: 'B.Tech', duration: '4 Years', fees: 280000 },
      { name: 'B.Tech Mechanical Engineering', degree: 'B.Tech', duration: '4 Years', fees: 270000 },
      { name: 'M.Tech VLSI Design', degree: 'M.Tech', duration: '2 Years', fees: 240000 },
      { name: 'B.Tech Aerospace Engineering', degree: 'B.Tech', duration: '4 Years', fees: 290000 },
    ],
    placements: [
      { avgPackage: 1420000, highestPackage: 2800000, placementRate: 93, year: 2024 },
      { avgPackage: 1360000, highestPackage: 2700000, placementRate: 92, year: 2023 },
      { avgPackage: 1310000, highestPackage: 2600000, placementRate: 91, year: 2022 },
    ],
  },
  {
    slug: 'manipal-university',
    name: 'Manipal Institute of Technology',
    location: 'Manipal, Karnataka',
    city: 'Manipal',
    state: 'Karnataka',
    fees: 320000,
    rating: 4.6,
    shortDescription: 'Premier institution with global exposure.',
    overview: 'Known for its international collaborations, research focus, and diverse student community.',
    placementPercent: 92,
    averagePackage: 1350000,
    courses: [
      { name: 'B.Tech Information Technology', degree: 'B.Tech', duration: '4 Years', fees: 320000 },
      { name: 'B.Tech Electronics and Communication', degree: 'B.Tech', duration: '4 Years', fees: 310000 },
      { name: 'M.Tech Machine Learning', degree: 'M.Tech', duration: '2 Years', fees: 280000 },
      { name: 'B.Tech Civil Engineering', degree: 'B.Tech', duration: '4 Years', fees: 305000 },
    ],
    placements: [
      { avgPackage: 1350000, highestPackage: 2600000, placementRate: 92, year: 2024 },
      { avgPackage: 1290000, highestPackage: 2500000, placementRate: 91, year: 2023 },
      { avgPackage: 1240000, highestPackage: 2400000, placementRate: 90, year: 2022 },
    ],
  },
  {
    slug: 'nit-warangal',
    name: 'National Institute of Technology Warangal',
    location: 'Warangal, Telangana',
    city: 'Warangal',
    state: 'Telangana',
    fees: 165000,
    rating: 4.5,
    shortDescription: 'Quality engineering education with good industry links.',
    overview: 'A respected NIT with strong academics, research opportunities, and dependable placements.',
    placementPercent: 91,
    averagePackage: 1280000,
    courses: [
      { name: 'B.Tech Computer Science', degree: 'B.Tech', duration: '4 Years', fees: 165000 },
      { name: 'B.Tech Electronics and Communication', degree: 'B.Tech', duration: '4 Years', fees: 162000 },
      { name: 'M.Tech Power Electronics', degree: 'M.Tech', duration: '2 Years', fees: 145000 },
      { name: 'B.Tech Civil Engineering', degree: 'B.Tech', duration: '4 Years', fees: 160000 },
    ],
    placements: [
      { avgPackage: 1280000, highestPackage: 2400000, placementRate: 91, year: 2024 },
      { avgPackage: 1220000, highestPackage: 2300000, placementRate: 90, year: 2023 },
      { avgPackage: 1170000, highestPackage: 2200000, placementRate: 89, year: 2022 },
    ],
  },
  {
    slug: 'nit-surathkal',
    name: 'National Institute of Technology Surathkal',
    location: 'Mangaluru, Karnataka',
    city: 'Mangaluru',
    state: 'Karnataka',
    fees: 168000,
    rating: 4.5,
    shortDescription: 'Premier NIT with strong campus placement record.',
    overview: 'Located in the coastal region, known for strong academics and emerging startup culture.',
    placementPercent: 90,
    averagePackage: 1310000,
    courses: [
      { name: 'B.Tech Information Technology', degree: 'B.Tech', duration: '4 Years', fees: 168000 },
      { name: 'B.Tech Mechanical Engineering', degree: 'B.Tech', duration: '4 Years', fees: 165000 },
      { name: 'M.Tech Structural Engineering', degree: 'M.Tech', duration: '2 Years', fees: 150000 },
      { name: 'B.Tech Electrical Engineering', degree: 'B.Tech', duration: '4 Years', fees: 164000 },
    ],
    placements: [
      { avgPackage: 1310000, highestPackage: 2500000, placementRate: 90, year: 2024 },
      { avgPackage: 1250000, highestPackage: 2400000, placementRate: 89, year: 2023 },
      { avgPackage: 1200000, highestPackage: 2300000, placementRate: 88, year: 2022 },
    ],
  },
  {
    slug: 'iit-guwahati',
    name: 'Indian Institute of Technology Guwahati',
    location: 'Guwahati, Assam',
    city: 'Guwahati',
    state: 'Assam',
    fees: 230000,
    rating: 4.6,
    shortDescription: 'Emerging research hub with improving placements.',
    overview: 'Known for its growing research ecosystem and emphasis on innovation and entrepreneurship.',
    placementPercent: 93,
    averagePackage: 1620000,
    courses: [
      { name: 'B.Tech Computer Science', degree: 'B.Tech', duration: '4 Years', fees: 230000 },
      { name: 'B.Tech Mechanical Engineering', degree: 'B.Tech', duration: '4 Years', fees: 225000 },
      { name: 'M.Tech Data Science', degree: 'M.Tech', duration: '2 Years', fees: 190000 },
      { name: 'B.Tech Chemical Engineering', degree: 'B.Tech', duration: '4 Years', fees: 220000 },
    ],
    placements: [
      { avgPackage: 1620000, highestPackage: 3100000, placementRate: 93, year: 2024 },
      { avgPackage: 1540000, highestPackage: 3000000, placementRate: 92, year: 2023 },
      { avgPackage: 1480000, highestPackage: 2900000, placementRate: 91, year: 2022 },
    ],
  },
  {
    slug: 'coep-pune',
    name: 'College of Engineering Pune',
    location: 'Pune, Maharashtra',
    city: 'Pune',
    state: 'Maharashtra',
    fees: 220000,
    rating: 4.6,
    shortDescription: 'Historic premier engineering college with strong alumni network.',
    overview: 'One of India\'s oldest engineering colleges with a proud legacy and strong placement record.',
    placementPercent: 92,
    averagePackage: 1480000,
    courses: [
      { name: 'B.E Electronics & Telecommunication', degree: 'B.E', duration: '4 Years', fees: 220000 },
      { name: 'B.E Mechanical Engineering', degree: 'B.E', duration: '4 Years', fees: 215000 },
      { name: 'B.E Computer Engineering', degree: 'B.E', duration: '4 Years', fees: 225000 },
      { name: 'M.E Advanced Manufacturing', degree: 'M.E', duration: '2 Years', fees: 200000 },
    ],
    placements: [
      { avgPackage: 1480000, highestPackage: 2800000, placementRate: 92, year: 2024 },
      { avgPackage: 1410000, highestPackage: 2700000, placementRate: 91, year: 2023 },
      { avgPackage: 1360000, highestPackage: 2600000, placementRate: 90, year: 2022 },
    ],
  },
  {
    slug: 'dtu-delhi',
    name: 'Delhi Technological University',
    location: 'Shahbad Daulatpur, Delhi',
    city: 'Delhi',
    state: 'Delhi',
    fees: 195000,
    rating: 4.4,
    shortDescription: 'Public university with growing research focus.',
    overview: 'Major government institution in Delhi with emphasis on quality education and industry collaboration.',
    placementPercent: 88,
    averagePackage: 1120000,
    courses: [
      { name: 'B.Tech Information Technology', degree: 'B.Tech', duration: '4 Years', fees: 195000 },
      { name: 'B.Tech Electronics & Communication', degree: 'B.Tech', duration: '4 Years', fees: 190000 },
      { name: 'M.Tech Cyber Security', degree: 'M.Tech', duration: '2 Years', fees: 170000 },
      { name: 'B.Tech Mechanical Engineering', degree: 'B.Tech', duration: '4 Years', fees: 185000 },
    ],
    placements: [
      { avgPackage: 1120000, highestPackage: 2200000, placementRate: 88, year: 2024 },
      { avgPackage: 1070000, highestPackage: 2100000, placementRate: 87, year: 2023 },
      { avgPackage: 1020000, highestPackage: 2000000, placementRate: 86, year: 2022 },
    ],
  },
]

// Generate additional colleges for variety
function generateAdditionalColleges(): CollegeData[] {
  const states = ['Punjab', 'Gujarat', 'West Bengal', 'Bihar', 'Uttar Pradesh', 'Haryana', 'Himachal Pradesh']
  const cities = ['Chandigarh', 'Ahmedabad', 'Kolkata', 'Patna', 'Lucknow', 'Hisar', 'Shimla']
  const additionalColleges: CollegeData[] = []

  const baseNames = [
    'Institute of Engineering and Technology',
    'University College of Engineering',
    'School of Technology and Engineering',
    'National College of Science',
    'Advanced Institute of Technology',
    'Modern Engineering Academy',
    'Technology and Management Institute',
    'Professional College of Engineering',
    'Excellence Institute of Engineering',
    'Future Engineering College',
  ]

  for (let i = 0; i < 20; i++) {
    const state = states[i % states.length]
    const city = cities[i % cities.length]
    const idx = i % baseNames.length
    const fees = 150000 + i * 8000
    const rating = Number((3.8 + (i % 8) * 0.12).toFixed(1))

    additionalColleges.push({
      slug: `college-${i + 1}`,
      name: `${baseNames[idx]} - ${city}`,
      location: `Campus, ${city}`,
      city,
      state,
      fees,
      rating,
      shortDescription: 'Quality engineering education with good infrastructure.',
      overview: 'A modern engineering college focused on practical learning and industry readiness.',
      placementPercent: 75 + (i % 15),
      averagePackage: 800000 + i * 35000,
      courses: [
        { name: 'B.Tech Computer Science', degree: 'B.Tech', duration: '4 Years', fees },
        { name: 'B.Tech Mechanical Engineering', degree: 'B.Tech', duration: '4 Years', fees: fees - 5000 },
        { name: 'B.Tech Electronics Engineering', degree: 'B.Tech', duration: '4 Years', fees: fees - 3000 },
        { name: 'B.Tech Civil Engineering', degree: 'B.Tech', duration: '4 Years', fees: fees - 8000 },
      ],
      placements: [
        {
          avgPackage: 800000 + i * 35000,
          highestPackage: 1600000 + i * 50000,
          placementRate: 75 + (i % 15),
          year: 2024,
        },
        {
          avgPackage: 750000 + i * 32000,
          highestPackage: 1500000 + i * 45000,
          placementRate: 74 + (i % 14),
          year: 2023,
        },
      ],
    })
  }

  return additionalColleges
}

export async function seedDatabase() {
  console.log('🌱 Starting database seed...')

  await ensureSqliteSchema()

  const existingColleges = await prisma.college.count().catch(() => 0)
  if (existingColleges > 0) {
    await ensureAdminAccount()
    console.log('Seed skipped: database already has data.')
    return
  }

  // Clear existing data
  console.log('🗑️  Clearing existing data...')
  await prisma.savedComparisonItem.deleteMany()
  await prisma.savedComparison.deleteMany()
  await prisma.savedCollege.deleteMany()
  await prisma.review.deleteMany()
  await prisma.placement.deleteMany()
  await prisma.course.deleteMany()
  await prisma.college.deleteMany()
  await prisma.user.deleteMany()

  // Create test users
  console.log('👥 Creating test users...')
  const user1Password = await bcrypt.hash('TestPassword123', 10)
  const user2Password = await bcrypt.hash('TestPassword456', 10)
  const user3Password = await bcrypt.hash('TestPassword789', 10)
  const adminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: 'AcademiaLink Admin',
        passwordHash: adminPassword,
        role: 'ADMIN',
      },
    }),
    prisma.user.create({
      data: {
        email: 'student1@example.com',
        name: 'Aarav',
        passwordHash: user1Password,
      },
    }),
    prisma.user.create({
      data: {
        email: 'student2@example.com',
        name: 'Meera',
        passwordHash: user2Password,
      },
    }),
    prisma.user.create({
      data: {
        email: 'student3@example.com',
        name: 'Kabir',
        passwordHash: user3Password,
      },
    }),
  ])

  console.log('✅ Test users created:')
  console.log(`  - ${ADMIN_EMAIL} (password: ${ADMIN_PASSWORD})`)
  console.log(`  - student1@example.com (password: TestPassword123)`)
  console.log(`  - student2@example.com (password: TestPassword456)`)
  console.log(`  - student3@example.com (password: TestPassword789)`)

  // Seed colleges
  const allColleges = [...collegesToSeed, ...generateAdditionalColleges()]
  console.log(`🏫 Seeding ${allColleges.length} colleges...`)

  for (const collegeData of allColleges) {
    const college = await prisma.college.create({
      data: {
        slug: collegeData.slug,
        name: collegeData.name,
        location: collegeData.location,
        city: collegeData.city,
        state: collegeData.state,
        fees: collegeData.fees,
        rating: collegeData.rating,
        logoUrl: LOGO_URL,
        shortDescription: collegeData.shortDescription,
        overview: collegeData.overview,
        placementPercent: collegeData.placementPercent,
        averagePackage: collegeData.averagePackage,
        bannerImage: BANNER_URL,
      },
    })

    // Add courses
    await Promise.all(
      collegeData.courses.map((course) =>
        prisma.course.create({
          data: {
            collegeId: college.id,
            name: course.name,
            degree: course.degree,
            duration: course.duration,
            fees: course.fees,
          },
        })
      )
    )

    // Add placements
    await Promise.all(
      collegeData.placements.map((placement) =>
        prisma.placement.create({
          data: {
            collegeId: college.id,
            avgPackage: placement.avgPackage,
            highestPackage: placement.highestPackage,
            placementRate: placement.placementRate,
            year: placement.year,
          },
        })
      )
    )

    // Add reviews with proper userId
    const reviewsToCreate = [
      { userId: users[0].id, rating: 4, body: 'Great facilities and amazing placements. A wonderful learning experience!' },
      { userId: users[1].id, rating: 5, body: 'Excellent campus culture with a focus on academics and extracurricular activities.' },
      { userId: users[2].id, rating: 4, body: 'The infrastructure is world-class and the faculty are very supportive.' },
    ]

    for (const review of reviewsToCreate) {
      await prisma.review.create({
        data: {
          collegeId: college.id,
          userId: review.userId,
          rating: review.rating,
          body: review.body,
        },
      })
    }
  }

  console.log(`✅ ${allColleges.length} colleges seeded with courses, placements, and reviews!`)
  console.log('🎉 Database seeding completed successfully!')
}

async function ensureSqliteSchema() {
  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON;`)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "passwordHash" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'STUDENT',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "College" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "slug" TEXT NOT NULL UNIQUE,
      "name" TEXT NOT NULL,
      "location" TEXT NOT NULL,
      "city" TEXT NOT NULL DEFAULT '',
      "state" TEXT NOT NULL,
      "fees" INTEGER NOT NULL,
      "rating" REAL NOT NULL DEFAULT 0,
      "logoUrl" TEXT NOT NULL DEFAULT '',
      "shortDescription" TEXT NOT NULL,
      "overview" TEXT NOT NULL,
      "placementPercent" REAL NOT NULL,
      "averagePackage" INTEGER NOT NULL,
      "bannerImage" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Course" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "collegeId" INTEGER NOT NULL,
      "name" TEXT NOT NULL,
      "degree" TEXT NOT NULL,
      "duration" TEXT NOT NULL,
      "fees" INTEGER NOT NULL,
      CONSTRAINT "Course_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Placement" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "collegeId" INTEGER NOT NULL,
      "avgPackage" INTEGER NOT NULL,
      "highestPackage" INTEGER NOT NULL,
      "placementRate" REAL NOT NULL DEFAULT 0,
      "year" INTEGER NOT NULL DEFAULT 2024,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Placement_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Review" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "collegeId" INTEGER NOT NULL,
      "userId" INTEGER NOT NULL,
      "rating" INTEGER NOT NULL,
      "body" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Review_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `)
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Review_userId_collegeId_key" ON "Review"("userId", "collegeId");
  `)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SavedCollege" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "userId" INTEGER NOT NULL,
      "collegeId" INTEGER NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "SavedCollege_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "SavedCollege_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `)
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "SavedCollege_userId_collegeId_key" ON "SavedCollege"("userId", "collegeId");
  `)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SavedComparison" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "userId" INTEGER NOT NULL,
      "title" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "SavedComparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SavedComparisonItem" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "comparisonId" INTEGER NOT NULL,
      "collegeId" INTEGER NOT NULL,
      "orderIndex" INTEGER NOT NULL,
      CONSTRAINT "SavedComparisonItem_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "SavedComparison" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "SavedComparisonItem_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `)
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "SavedComparisonItem_comparisonId_collegeId_key" ON "SavedComparisonItem"("comparisonId", "collegeId");
  `)
}

const isMainModule = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false

if (isMainModule) {
  seedDatabase()
    .then(async () => {
      await prisma.$disconnect()
    })
    .catch(async (error) => {
      console.error('❌ Seed error:', error)
      await prisma.$disconnect()
      process.exit(1)
    })
}
