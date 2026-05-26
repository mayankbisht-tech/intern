import cors from 'cors'
import express from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from './lib/prisma.js'
import { config } from './config.js'
import { AppError, errorHandler } from './errors.js'
import {
  registerSchema,
  loginSchema,
  collegeQuerySchema,
  compareQuerySchema,
  savedCollegeSchema,
  savedComparisonSchema,
  createReviewSchema,
  reviewQuerySchema,
  collegeDetailQuerySchema,
  adminCollegeSchema,
} from './validation.js'
import { signToken, verifyToken } from './lib/auth.js'

// Auth Middleware
function authMiddleware(
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Missing bearer token', 'UNAUTHORIZED'))
  }

  try {
    req.auth = verifyToken(header.slice(7))
    return next()
  } catch (err) {
    if (err instanceof Error && err.message.includes('expired')) {
      return next(new AppError(401, 'Token has expired', 'TOKEN_EXPIRED'))
    }
    return next(new AppError(401, 'Invalid or expired token', 'UNAUTHORIZED'))
  }
}

function adminMiddleware(
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
) {
  if (req.auth?.role !== 'ADMIN') {
    return next(new AppError(403, 'Admin access required', 'FORBIDDEN'))
  }
  return next()
}

// Helper function to mask email
function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  return `${local[0]}***@${domain}`
}

function serializeCollegeAdmin(college: {
  id: number
  slug: string
  name: string
  location: string
  city: string
  state: string
  fees: number
  rating: number
  logoUrl: string
  shortDescription: string
  overview: string
  placementPercent: number
  averagePackage: number
  bannerImage: string
  createdAt: Date
  updatedAt: Date
  courses: Array<{
    id: number
    name: string
    degree: string
    duration: string
    fees: number
  }>
  placements: Array<{
    id: number
    year: number
    avgPackage: number
    highestPackage: number
    placementRate: number
  }>
}) {
  return college
}

export const app = express()

// Middleware
app.use(
  cors({
    origin: config.frontendOrigin,
    credentials: true,
  })
)
app.use(express.json())

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

// ============ AUTH ENDPOINTS ============

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body)

    // Check for duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: payload.email },
    })
    if (existing) {
      return next(new AppError(409, 'Email already registered', 'CONFLICT'))
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(payload.password, 10)
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        passwordHash,
        name: payload.name ?? payload.email.split('@')[0], // Use email prefix as a fallback
        role: 'STUDENT',
      },
      select: { id: true, email: true, name: true, role: true },
    })

    const token = signToken({ userId: user.id, email: user.email, role: user.role })
    return res.status(201).json({
      token,
      user,
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    })
    if (!user) {
      return next(new AppError(401, 'Invalid credentials', 'UNAUTHORIZED'))
    }

    // Verify password
    const isValid = await bcrypt.compare(payload.password, user.passwordHash)
    if (!isValid) {
      return next(new AppError(401, 'Invalid credentials', 'UNAUTHORIZED'))
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role })
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
})

app.get('/api/auth/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    if (!user) {
      return next(new AppError(404, 'User not found', 'NOT_FOUND'))
    }

    return res.json({ user })
  } catch (error) {
    next(error)
  }
})

// ============ COLLEGE ENDPOINTS ============

app.get('/api/colleges', async (req, res, next) => {
  try {
    const query = collegeQuerySchema.parse(req.query)
    const limit = query.limit
    const skip = (query.page - 1) * limit

    const colleges = await prisma.college.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        location: true,
        fees: true,
        rating: true,
        logoUrl: true,
        shortDescription: true,
        bannerImage: true,
        createdAt: true,
      },
    })

    const normalizedSearch = query.search?.trim().toLowerCase()
    const normalizedCity = query.city?.trim().toLowerCase()
    const normalizedState = query.state?.trim().toLowerCase()

    const filtered = colleges.filter((college) => {
      const haystack = `${college.name} ${college.city} ${college.state}`.toLowerCase()
      if (normalizedSearch && !haystack.includes(normalizedSearch)) return false
      if (normalizedCity && !college.city.toLowerCase().includes(normalizedCity)) return false
      if (normalizedState && !college.state.toLowerCase().includes(normalizedState)) return false
      if (query.minFees !== undefined && college.fees < query.minFees) return false
      if (query.maxFees !== undefined && college.fees > query.maxFees) return false
      if (query.minRating !== undefined && college.rating < query.minRating) return false
      if (query.maxRating !== undefined && college.rating > query.maxRating) return false
      return true
    })

    const sorted = [...filtered].sort((a, b) => {
      if (query.sortBy === 'fees') {
        return (a.fees - b.fees) * (query.sortOrder === 'desc' ? -1 : 1)
      }
      if (query.sortBy === 'name') {
        return a.name.localeCompare(b.name) * (query.sortOrder === 'desc' ? -1 : 1)
      }
      const ratingComparison = a.rating - b.rating
      return ratingComparison * (query.sortOrder === 'asc' ? 1 : -1)
    })

    const total = sorted.length
    const paginated = sorted.slice(skip, skip + limit)

    return res.json({
      data: paginated,
      pagination: {
        total,
        page: query.page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    })
  } catch (error) {
    next(error)
  }
})

// ============ ADMIN COLLEGE MANAGEMENT ============

app.get('/api/admin/colleges', authMiddleware, adminMiddleware, async (_req, res, next) => {
  try {
    const colleges = await prisma.college.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        courses: true,
        placements: {
          orderBy: { year: 'desc' },
        },
      },
    })

    return res.json({
      data: colleges.map(serializeCollegeAdmin),
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/colleges', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const payload = adminCollegeSchema.parse(req.body)

    const existing = await prisma.college.findUnique({
      where: { slug: payload.slug },
      select: { id: true },
    })
    if (existing) {
      return next(new AppError(409, 'A college with this slug already exists', 'CONFLICT'))
    }

    const college = await prisma.$transaction(async (tx) => {
      const created = await tx.college.create({
        data: {
          slug: payload.slug,
          name: payload.name,
          location: payload.location,
          city: payload.city,
          state: payload.state,
          fees: payload.fees,
          rating: payload.rating,
          logoUrl: payload.logoUrl,
          shortDescription: payload.shortDescription,
          overview: payload.overview,
          placementPercent: payload.placementPercent,
          averagePackage: payload.averagePackage,
          bannerImage: payload.bannerImage,
        },
      })

      await tx.course.createMany({
        data: payload.courses.map((course) => ({
          collegeId: created.id,
          name: course.name,
          degree: course.degree,
          duration: course.duration,
          fees: course.fees,
        })),
      })

      await tx.placement.createMany({
        data: payload.placements.map((placement) => ({
          collegeId: created.id,
          avgPackage: placement.avgPackage,
          highestPackage: placement.highestPackage,
          placementRate: placement.placementRate,
          year: placement.year,
        })),
      })

      return tx.college.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          courses: true,
          placements: {
            orderBy: { year: 'desc' },
          },
        },
      })
    })

    return res.status(201).json({ college: serializeCollegeAdmin(college) })
  } catch (error) {
    next(error)
  }
})

app.put('/api/admin/colleges/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return next(new AppError(400, 'Invalid college ID', 'VALIDATION_ERROR'))
    }

    const payload = adminCollegeSchema.parse(req.body)

    const current = await prisma.college.findUnique({
      where: { id },
      select: { id: true, slug: true },
    })
    if (!current) {
      return next(new AppError(404, 'College not found', 'NOT_FOUND'))
    }

    const duplicate = await prisma.college.findUnique({
      where: { slug: payload.slug },
      select: { id: true },
    })
    if (duplicate && duplicate.id !== id) {
      return next(new AppError(409, 'A college with this slug already exists', 'CONFLICT'))
    }

    const college = await prisma.$transaction(async (tx) => {
      await tx.course.deleteMany({ where: { collegeId: id } })
      await tx.placement.deleteMany({ where: { collegeId: id } })

      await tx.college.update({
        where: { id },
        data: {
          slug: payload.slug,
          name: payload.name,
          location: payload.location,
          city: payload.city,
          state: payload.state,
          fees: payload.fees,
          rating: payload.rating,
          logoUrl: payload.logoUrl,
          shortDescription: payload.shortDescription,
          overview: payload.overview,
          placementPercent: payload.placementPercent,
          averagePackage: payload.averagePackage,
          bannerImage: payload.bannerImage,
        },
      })

      await tx.course.createMany({
        data: payload.courses.map((course) => ({
          collegeId: id,
          name: course.name,
          degree: course.degree,
          duration: course.duration,
          fees: course.fees,
        })),
      })

      await tx.placement.createMany({
        data: payload.placements.map((placement) => ({
          collegeId: id,
          avgPackage: placement.avgPackage,
          highestPackage: placement.highestPackage,
          placementRate: placement.placementRate,
          year: placement.year,
        })),
      })

      return tx.college.findUniqueOrThrow({
        where: { id },
        include: {
          courses: true,
          placements: {
            orderBy: { year: 'desc' },
          },
        },
      })
    })

    return res.json({ college: serializeCollegeAdmin(college) })
  } catch (error) {
    next(error)
  }
})

app.delete('/api/admin/colleges/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return next(new AppError(400, 'Invalid college ID', 'VALIDATION_ERROR'))
    }

    const college = await prisma.college.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!college) {
      return next(new AppError(404, 'College not found', 'NOT_FOUND'))
    }

    await prisma.college.delete({ where: { id } })

    return res.json({ message: 'College deleted' })
  } catch (error) {
    next(error)
  }
})

// ============ COMPARE ENDPOINT ============

app.get('/api/colleges/compare', async (req, res, next) => {
  try {
    const query = compareQuerySchema.parse(req.query)
    const { ids } = query

    // Fetch colleges with their data
    const colleges = await prisma.college.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        location: true,
        fees: true,
        rating: true,
        courses: true,
        placements: {
          orderBy: { year: 'desc' },
          take: 1,
        },
      },
    })

    // Check for missing colleges
    const foundIds = new Set(colleges.map((c) => c.id))
    const invalidIds = ids.filter((id) => !foundIds.has(id))
    if (invalidIds.length > 0) {
      return next(
        new AppError(404, `Colleges not found: ${invalidIds.join(', ')}`, 'NOT_FOUND')
      )
    }

    // Reorder colleges to match input order
    const collegesMap = new Map(colleges.map((c) => [c.id, c]))
    const orderedColleges = ids
      .map((id) => collegesMap.get(id)!)
      .map((college) => ({
        id: college.id,
        name: college.name,
        location: college.location,
        fees: college.fees,
        rating: college.rating,
        avgPlacementPackage: college.placements[0]?.avgPackage ?? 0,
        placementRate: college.placements[0]?.placementRate ?? 0,
        topCourses: college.courses.slice(0, 3).map((c) => c.name),
      }))

    return res.json({ colleges: orderedColleges })
  } catch (error) {
    next(error)
  }
})

app.get('/api/colleges/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return next(new AppError(400, 'Invalid college ID format', 'VALIDATION_ERROR'))
    }

    // Get college with related data
    const college = await prisma.college.findUnique({
      where: { id },
      include: {
        courses: true,
        placements: {
          orderBy: { year: 'desc' },
        },
      },
    })

    if (!college) {
      return next(new AppError(404, 'College not found', 'NOT_FOUND'))
    }

    // Get reviews with pagination (default 10 per page)
    const { reviewPage } = collegeDetailQuerySchema.parse(req.query)
    const reviewsPerPage = 10
    const reviewsSkip = (reviewPage - 1) * reviewsPerPage

    const [reviews, reviewCount, avgRatingResult] = await Promise.all([
      prisma.review.findMany({
        where: { collegeId: id },
        select: {
          id: true,
          rating: true,
          body: true,
          createdAt: true,
          user: {
            select: { email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: reviewsSkip,
        take: reviewsPerPage,
      }),
      prisma.review.count({ where: { collegeId: id } }),
      prisma.review.aggregate({
        where: { collegeId: id },
        _avg: { rating: true },
      }),
    ])

    // Mask reviewer emails and format reviews
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      body: review.body,
      createdAt: review.createdAt,
      reviewerEmail: maskEmail(review.user.email),
    }))

    return res.json({
      college: {
        id: college.id,
        name: college.name,
        location: college.location,
        city: college.city,
        state: college.state,
        fees: college.fees,
        rating: college.rating,
        logoUrl: college.logoUrl,
        shortDescription: college.shortDescription,
        overview: college.overview,
        bannerImage: college.bannerImage,
        createdAt: college.createdAt,
      },
      courses: college.courses,
      placements: college.placements,
      reviews: formattedReviews,
      avgRating: avgRatingResult._avg.rating ?? 0,
      reviewPagination: {
        page: reviewPage,
        limit: reviewsPerPage,
        total: reviewCount,
        totalPages: Math.max(1, Math.ceil(reviewCount / reviewsPerPage)),
      },
    })
  } catch (error) {
    next(error)
  }
})

// ============ SAVED COLLEGES ENDPOINTS ============

app.post('/api/user/saved', authMiddleware, async (req, res, next) => {
  try {
    const payload = savedCollegeSchema.parse(req.body)
    const userId = req.auth!.userId

    // Check if college exists
    const college = await prisma.college.findUnique({
      where: { id: payload.collegeId },
    })
    if (!college) {
      return next(new AppError(404, 'College not found', 'NOT_FOUND'))
    }

    // Check if already saved
    const existing = await prisma.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId,
          collegeId: payload.collegeId,
        },
      },
    })
    if (existing) {
      return next(new AppError(409, 'College already saved', 'CONFLICT'))
    }

    // Save college
    const saved = await prisma.savedCollege.create({
      data: {
        userId,
        collegeId: payload.collegeId,
      },
    })

    return res.status(201).json({
      savedId: saved.id,
      collegeId: saved.collegeId,
      savedAt: saved.createdAt,
    })
  } catch (error) {
    next(error)
  }
})

app.delete('/api/user/saved/:collegeId', authMiddleware, async (req, res, next) => {
  try {
    const collegeId = Number(req.params.collegeId)
    const userId = req.auth!.userId

    if (Number.isNaN(collegeId)) {
      return next(new AppError(400, 'Invalid college ID', 'VALIDATION_ERROR'))
    }

    // Check if saved college exists
    const saved = await prisma.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId,
          collegeId,
        },
      },
    })
    if (!saved) {
      return next(new AppError(404, 'Not in saved list', 'NOT_FOUND'))
    }

    // Delete saved college
    await prisma.savedCollege.delete({
      where: { id: saved.id },
    })

    return res.json({ message: 'Removed' })
  } catch (error) {
    next(error)
  }
})

app.get('/api/user/saved', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.auth!.userId
    const page = Number(req.query.page) || 1
    const limit = Math.min(Number(req.query.limit) || 20, 50)
    const skip = (page - 1) * limit

    const [saved, total] = await Promise.all([
      prisma.savedCollege.findMany({
        where: { userId },
        include: {
          college: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
              location: true,
              fees: true,
              rating: true,
              logoUrl: true,
              shortDescription: true,
              bannerImage: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.savedCollege.count({ where: { userId } }),
    ])

    return res.json({
      data: saved.map((s) => s.college),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    })
  } catch (error) {
    next(error)
  }
})

app.get('/api/user/comparisons', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.auth!.userId

    const comparisons = await prisma.savedComparison.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
          include: {
            college: {
              select: {
                id: true,
                slug: true,
                name: true,
                location: true,
                state: true,
                fees: true,
                rating: true,
                shortDescription: true,
                overview: true,
                placementPercent: true,
                averagePackage: true,
                bannerImage: true,
                courses: {
                  select: {
                    id: true,
                    name: true,
                    degree: true,
                    duration: true,
                    fees: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return res.json({
      data: comparisons.map((comparison) => ({
        id: comparison.id,
        title: comparison.title,
        createdAt: comparison.createdAt,
        items: comparison.items.map((item) => ({
          id: item.id,
          orderIndex: item.orderIndex,
          college: {
            id: item.college.id,
            slug: item.college.slug,
            name: item.college.name,
            location: item.college.location,
            state: item.college.state,
            fees: item.college.fees,
            rating: item.college.rating,
            shortDescription: item.college.shortDescription,
            overview: item.college.overview,
            placementPercent: item.college.placementPercent,
            averagePackage: item.college.averagePackage,
            bannerImage: item.college.bannerImage,
            courses: item.college.courses,
            reviews: [],
          },
        })),
      })),
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/user/comparisons', authMiddleware, async (req, res, next) => {
  try {
    const payload = savedComparisonSchema.parse(req.body)
    const userId = req.auth!.userId
    const collegeIds = payload.collegeIds

    if (new Set(collegeIds).size !== collegeIds.length) {
      return next(new AppError(400, 'Duplicate college IDs not allowed', 'VALIDATION_ERROR'))
    }

    const colleges = await prisma.college.findMany({
      where: { id: { in: collegeIds } },
      select: { id: true },
    })
    const foundIds = new Set(colleges.map((college) => college.id))
    const missingIds = collegeIds.filter((id) => !foundIds.has(id))
    if (missingIds.length > 0) {
      return next(
        new AppError(404, `Colleges not found: ${missingIds.join(', ')}`, 'NOT_FOUND')
      )
    }

    const comparison = await prisma.$transaction(async (tx) => {
      const savedComparison = await tx.savedComparison.create({
        data: {
          userId,
          title: payload.title ?? 'My comparison',
        },
      })

      await tx.savedComparisonItem.createMany({
        data: collegeIds.map((collegeId, index) => ({
          comparisonId: savedComparison.id,
          collegeId,
          orderIndex: index,
        })),
      })

      return tx.savedComparison.findUniqueOrThrow({
        where: { id: savedComparison.id },
        include: {
          items: {
            orderBy: { orderIndex: 'asc' },
            include: {
              college: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  location: true,
                  state: true,
                  fees: true,
                  rating: true,
                  shortDescription: true,
                  overview: true,
                  placementPercent: true,
                  averagePackage: true,
                  bannerImage: true,
                  courses: {
                    select: {
                      id: true,
                      name: true,
                      degree: true,
                      duration: true,
                      fees: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
    })

    return res.status(201).json({
      id: comparison.id,
      title: comparison.title,
      createdAt: comparison.createdAt,
      items: comparison.items.map((item) => ({
        id: item.id,
        orderIndex: item.orderIndex,
        college: {
          id: item.college.id,
          slug: item.college.slug,
          name: item.college.name,
          location: item.college.location,
          state: item.college.state,
          fees: item.college.fees,
          rating: item.college.rating,
          shortDescription: item.college.shortDescription,
          overview: item.college.overview,
          placementPercent: item.college.placementPercent,
          averagePackage: item.college.averagePackage,
          bannerImage: item.college.bannerImage,
          courses: item.college.courses,
          reviews: [],
        },
      })),
    })
  } catch (error) {
    next(error)
  }
})

// ============ COMPARE ENDPOINT ============

// ============ REVIEWS ENDPOINTS ============

app.post('/api/colleges/:id/reviews', authMiddleware, async (req, res, next) => {
  try {
    const collegeId = Number(req.params.id)
    const userId = req.auth!.userId

    if (Number.isNaN(collegeId)) {
      return next(new AppError(400, 'Invalid college ID', 'VALIDATION_ERROR'))
    }

    const payload = createReviewSchema.parse(req.body)

    // Check if college exists
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
    })
    if (!college) {
      return next(new AppError(404, 'College not found', 'NOT_FOUND'))
    }

    // Check if user already reviewed this college
    const existing = await prisma.review.findFirst({
      where: {
        userId,
        collegeId,
      },
    })
    if (existing) {
      return next(
        new AppError(409, 'You have already reviewed this college', 'CONFLICT')
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        collegeId,
        userId,
        rating: payload.rating,
        body: payload.body,
      },
    })

    return res.status(201).json({
      reviewId: review.id,
      rating: review.rating,
      body: review.body,
      createdAt: review.createdAt,
    })
  } catch (error) {
    next(error)
  }
})

app.get('/api/colleges/:id/reviews', async (req, res, next) => {
  try {
    const collegeId = Number(req.params.id)
    if (Number.isNaN(collegeId)) {
      return next(new AppError(400, 'Invalid college ID', 'VALIDATION_ERROR'))
    }

    const query = reviewQuerySchema.parse(req.query)
    const limit = query.limit
    const skip = (query.page - 1) * limit

    // Check if college exists
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
    })
    if (!college) {
      return next(new AppError(404, 'College not found', 'NOT_FOUND'))
    }

    // Fetch reviews
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { collegeId },
        select: {
          id: true,
          rating: true,
          body: true,
          createdAt: true,
          user: {
            select: { email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { collegeId } }),
    ])

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      body: review.body,
      createdAt: review.createdAt,
      reviewerEmail: maskEmail(review.user.email),
    }))

    return res.json({
      data: formattedReviews,
      pagination: {
        page: query.page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    })
  } catch (error) {
    next(error)
  }
})

// Error handler (must be last)
app.use(errorHandler)
