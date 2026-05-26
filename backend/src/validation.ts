import { z } from 'zod'

const emailSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value
    return value.trim().toLowerCase()
  },
  z.string().email('Invalid email format')
)

// Auth Schemas
export const registerSchema = z.object({
  email: emailSchema,
  name: z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : undefined
    },
    z.string().min(2, 'Name must be at least 2 characters').max(100).optional()
  ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine(
      (pwd) => /\d/.test(pwd),
      'Password must contain at least one number'
    ),
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// College Query Schema
export const collegeQuerySchema = z
  .object({
    search: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    minFees: z.coerce.number().int().nonnegative().optional(),
    maxFees: z.coerce.number().int().nonnegative().optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    maxRating: z.coerce.number().min(0).max(5).optional(),
    sortBy: z.enum(['rating', 'fees', 'name']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .superRefine((data, ctx) => {
    if (
      data.minFees !== undefined &&
      data.maxFees !== undefined &&
      data.minFees > data.maxFees
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'minFees cannot be greater than maxFees',
        path: ['minFees'],
      })
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'maxFees cannot be less than minFees',
        path: ['maxFees'],
      })
    }
    if (
      data.minRating !== undefined &&
      data.maxRating !== undefined &&
      data.minRating > data.maxRating
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'minRating cannot be greater than maxRating',
        path: ['minRating'],
      })
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'maxRating cannot be less than minRating',
        path: ['maxRating'],
      })
    }
  })

// Compare Query Schema
export const compareQuerySchema = z
  .object({
    ids: z.string().min(1),
  })
  .transform((data) => {
    const rawIds = data.ids.split(',').map((id) => id.trim())
    const ids = rawIds.map((id) => Number(id))
    return { ids, rawIds }
  })
  .superRefine((data, ctx) => {
    if (data.rawIds.some((id) => id.length === 0) || data.ids.some((id) => !Number.isInteger(id) || id <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'IDs must be positive integers',
        path: ['ids'],
      })
      return
    }
    if (data.ids.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minimum 2 colleges required',
        path: ['ids'],
      })
    }
    if (data.ids.length > 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Maximum 3 colleges allowed',
        path: ['ids'],
      })
    }
    if (new Set(data.ids).size !== data.ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Duplicate college IDs not allowed',
        path: ['ids'],
      })
    }
  })
  .transform((data) => ({ ids: data.ids }))

// Saved College Schema
export const savedCollegeSchema = z.object({
  collegeId: z.coerce.number().int().positive(),
})

// Review Schemas
export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().min(20, 'Review must be at least 20 characters').max(1000, 'Review must be at most 1000 characters'),
})

export const reviewQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export const collegeDetailQuerySchema = z.object({
  reviewPage: z.coerce.number().int().positive().default(1),
})

// Saved Comparison Schema (for future use)
export const savedComparisonSchema = z.object({
  collegeIds: z.array(z.coerce.number().int().positive()).min(2).max(3),
  title: z.string().min(2).max(120).optional(),
})

// Admin College Schemas
const collegeCourseSchema = z.object({
  name: z.string().trim().min(2).max(150),
  degree: z.string().trim().min(1).max(50),
  duration: z.string().trim().min(1).max(50),
  fees: z.coerce.number().int().nonnegative(),
})

const collegePlacementSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  avgPackage: z.coerce.number().int().nonnegative(),
  highestPackage: z.coerce.number().int().nonnegative(),
  placementRate: z.coerce.number().min(0).max(100),
})

export const adminCollegeSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
  location: z.string().trim().min(2).max(150),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  fees: z.coerce.number().int().nonnegative(),
  rating: z.coerce.number().min(0).max(5),
  logoUrl: z.string().trim().url('Logo URL must be a valid URL').or(z.literal('')),
  shortDescription: z.string().trim().min(10).max(240),
  overview: z.string().trim().min(20).max(2000),
  placementPercent: z.coerce.number().min(0).max(100),
  averagePackage: z.coerce.number().int().nonnegative(),
  bannerImage: z.string().trim().url('Banner URL must be a valid URL'),
  courses: z.array(collegeCourseSchema).min(1, 'Add at least one course'),
  placements: z.array(collegePlacementSchema).min(1, 'Add at least one placement record'),
})
